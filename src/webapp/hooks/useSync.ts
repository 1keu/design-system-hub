import { useEffect, useRef, useCallback } from 'react';
import { ColorVariableData, TypographyVariableData, ComponentConfig } from '../../shared/types';
import { Session } from '../../shared/supabaseClient';

interface SyncData {
  colors: ColorVariableData | null;
  typography: TypographyVariableData | null;
  components: ComponentConfig[];
}

interface UseSyncOptions {
  session: Session | null;
  data: SyncData;
  onRemoteUpdate: (data: SyncData) => void;
  supabaseUrl: string;
  supabaseKey: string;
}

const DESIGN_SYSTEM_TABLE = 'design_system_state';
const DEBOUNCE_MS = 1500;

export function useSync({ session, data, onRemoteUpdate, supabaseUrl, supabaseKey }: UseSyncOptions) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDataRef = useRef<string>('');
  const designSystemId = useRef<string | null>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  const getOrCreateDesignSystem = useCallback(async (sb: import('@supabase/supabase-js').SupabaseClient, userId: string) => {
    if (designSystemId.current) return designSystemId.current;

    const { data: existing } = await sb
      .from('design_systems')
      .select('id')
      .eq('owner_id', userId)
      .single();

    if (existing) {
      designSystemId.current = existing.id;
      return existing.id as string;
    }

    const { data: created, error } = await sb
      .from('design_systems')
      .insert({ owner_id: userId, name: 'My Design System' })
      .select('id')
      .single();

    if (error) throw error;
    designSystemId.current = (created as { id: string }).id;
    return designSystemId.current;
  }, []);

  // Push local state to Supabase (debounced)
  const pushToCloud = useCallback(async (payload: SyncData) => {
    if (!session) return;
    try {
      const { initSupabase } = await import('../../shared/supabaseClient');
      const sb = initSupabase(supabaseUrl, supabaseKey);
      const dsId = await getOrCreateDesignSystem(sb, session.user.id);

      await sb.from(DESIGN_SYSTEM_TABLE).upsert({
        design_system_id: dsId,
        colors: payload.colors,
        typography: payload.typography,
        components: payload.components,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'design_system_id' });
    } catch (e) {
      console.error('Sync push failed:', e);
    }
  }, [session, supabaseUrl, supabaseKey, getOrCreateDesignSystem]);

  // Load state from Supabase on login
  useEffect(() => {
    if (!session) return;

    (async () => {
      try {
        const { initSupabase } = await import('../../shared/supabaseClient');
        const sb = initSupabase(supabaseUrl, supabaseKey);
        const dsId = await getOrCreateDesignSystem(sb, session.user.id);

        const { data: remote } = await sb
          .from(DESIGN_SYSTEM_TABLE)
          .select('*')
          .eq('design_system_id', dsId)
          .single();

        if (remote) {
          onRemoteUpdate({
            colors: remote.colors,
            typography: remote.typography,
            components: remote.components,
          });
        }

        // Subscribe to realtime changes
        const channel = sb
          .channel(`ds:${dsId}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: DESIGN_SYSTEM_TABLE,
            filter: `design_system_id=eq.${dsId}`,
          }, payload => {
            const row = payload.new as { colors: ColorVariableData; typography: TypographyVariableData; components: ComponentConfig[] };
            onRemoteUpdate({
              colors: row.colors,
              typography: row.typography,
              components: row.components,
            });
          })
          .subscribe();

        subscriptionRef.current = { unsubscribe: () => sb.removeChannel(channel) };
      } catch (e) {
        console.error('Sync init failed:', e);
      }
    })();

    return () => { subscriptionRef.current?.unsubscribe(); };
  }, [session, supabaseUrl, supabaseKey, getOrCreateDesignSystem, onRemoteUpdate]);

  // Debounce push on data change
  useEffect(() => {
    if (!session) return;
    const serialized = JSON.stringify(data);
    if (serialized === prevDataRef.current) return;
    prevDataRef.current = serialized;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => pushToCloud(data), DEBOUNCE_MS);

    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [session, data, pushToCloud]);
}
