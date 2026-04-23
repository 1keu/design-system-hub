import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

const SUPABASE_URL = (typeof process !== 'undefined' && (process.env as Record<string,string>).SUPABASE_URL) || '';
const SUPABASE_ANON_KEY = (typeof process !== 'undefined' && (process.env as Record<string,string>).SUPABASE_ANON_KEY) || '';

export let supabase: SupabaseClient | null = null;

export function initSupabase(url?: string, anonKey?: string): SupabaseClient {
  const u = url || SUPABASE_URL;
  const k = anonKey || SUPABASE_ANON_KEY;
  if (!u || !k) throw new Error('Supabase URL / Anon Key が設定されていません');
  supabase = createClient(u, k);
  return supabase;
}

export function getSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase が初期化されていません');
  return supabase;
}

export type { Session, User };
