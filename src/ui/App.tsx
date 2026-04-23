import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Sidebar, { SidebarItemId } from './components/Sidebar';
import ColorPanel from './panels/ColorPanel';
import TypographyPanel from './panels/TypographyPanel';
import ComponentPanel from './panels/ComponentPanel';
import { ColorVariableData, TypographyVariableData, ComponentConfig, VariantStyle, SizeConfig, ComponentProperty, FigmaSelectionNode } from '../shared/types';
import { generateColorVariableData } from './utils/colorGenerator';
import { generateTypographyVariableData } from './utils/typographyGenerator';
import { INITIAL_COMPONENTS } from '../shared/defaults';
import { parseFigmaExport, mergeImportedComponents } from '../webapp/utils/figmaExport';
import { useSync } from '../webapp/hooks/useSync';
import { Session } from '../shared/supabaseClient';

const SUPABASE_URL = (window as unknown as Record<string, string>).__SUPABASE_URL__ ?? '';
const SUPABASE_KEY = (window as unknown as Record<string, string>).__SUPABASE_KEY__ ?? '';

// ===== Toast =====

interface Toast { id: number; message: string; error?: boolean }

// ===== App =====

export default function App() {
  const [selected, setSelected] = useState<SidebarItemId>('colors');
  const [colorData, setColorData] = useState<ColorVariableData | null>(null);
  const [typographyData, setTypographyData] = useState<TypographyVariableData | null>(null);
  const [components, setComponents] = useState<ComponentConfig[]>(INITIAL_COMPONENTS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<FigmaSelectionNode[] | null>(null);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, error = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, error }]);
    if (!error) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.onmessage = (e: MessageEvent) => {
      const msg = e.data.pluginMessage;
      if (msg?.type === 'notify') addToast(msg.message, msg.error);
      if (msg?.type === 'selection-info') setSelectionInfo(msg.data);
      if (msg?.type === 'import-result' && msg.data) {
        const parsed = parseFigmaExport(msg.data);
        if (parsed) {
          if (parsed.colors) setColorData(parsed.colors);
          if (parsed.typography) setTypographyData(parsed.typography);
          if (parsed.components?.length) setComponents(prev => mergeImportedComponents(prev, parsed.components));
          addToast(`インポート完了 — ${parsed.components.length} コンポーネント`);
        }
      }
    };
  }, [addToast]);

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        const parsed = parseFigmaExport(json);
        if (!parsed) { addToast('無効な .figma.json ファイルです', true); return; }
        if (parsed.colors) setColorData(parsed.colors);
        if (parsed.typography) setTypographyData(parsed.typography);
        if (parsed.components?.length) setComponents(prev => mergeImportedComponents(prev, parsed.components));
        addToast(`インポート完了 — ${parsed.components.length} コンポーネント`);
      } catch { addToast('ファイルの読み込みに失敗しました', true); }
      e.target.value = '';
    };
    reader.readAsText(file);
  }, [addToast]);

  const send = useCallback((msg: object) => parent.postMessage({ pluginMessage: msg }, '*'), []);

  // Color
  const handleColorAdd = useCallback((data: ColorVariableData) => {
    send({ type: 'add-color-variables', data });
  }, [send]);

  // Typography
  const handleTypoAdd = useCallback((data: TypographyVariableData) => {
    send({ type: 'add-typography-variables', data });
  }, [send]);

  // Component
  const handleToggleComponent = useCallback((id: string) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  }, []);

  const handleStyleChange = useCallback((compId: string, variant: string, field: keyof VariantStyle, value: string | number) => {
    setComponents(prev => prev.map(c => c.id !== compId ? c : {
      ...c,
      styleMap: { ...c.styleMap, [variant]: { ...c.styleMap[variant], [field]: value } },
    }));
  }, []);

  const handleSizeChange = useCallback((compId: string, sizeName: string, field: keyof SizeConfig, value: number | boolean) => {
    setComponents(prev => prev.map(c => c.id !== compId ? c : {
      ...c,
      sizeConfigs: c.sizeConfigs.map(s => s.name === sizeName ? { ...s, [field]: value } : s),
    }));
  }, []);

  const handlePropertyChange = useCallback((compId: string, propId: string, field: keyof ComponentProperty, value: boolean | string) => {
    setComponents(prev => prev.map(c => c.id !== compId ? c : {
      ...c,
      componentProperties: c.componentProperties.map(p => p.id === propId ? { ...p, [field]: value } : p),
    }));
  }, []);

  const handleDocChange = useCallback((compId: string, field: 'definition' | 'usageExamples' | 'usageConditions' | 'doExample' | 'dontExample' | 'accessibility' | 'states' | 'relatedComponents', value: string) => {
    setComponents(prev => prev.map(c => c.id !== compId ? c : { ...c, [field]: value }));
  }, []);

  const handleComponentAdd = useCallback((comp: ComponentConfig) => {
    send({ type: 'generate-components', data: { components: [comp], spacing: 32, includeVariants: true } });
  }, [send]);

  // Add all
  const handleAddAll = useCallback(() => {
    const cd = colorData ?? generateColorVariableData([
      { name: 'indigo', hex: '#6366f1', role: 'primary' },
      { name: 'violet', hex: '#8b5cf6', role: 'secondary' },
      { name: 'cyan', hex: '#06b6d4', role: 'accent' },
      { name: 'slate', hex: '#64748b', role: 'neutral' },
      { name: 'green', hex: '#22c55e', role: 'custom' },
      { name: 'red', hex: '#ef4444', role: 'custom' },
      { name: 'amber', hex: '#f59e0b', role: 'custom' },
    ]);
    const td = typographyData ?? generateTypographyVariableData({ sansFont: 'Inter', serifFont: 'Merriweather', monoFont: 'JetBrains Mono', baseSize: 16, scaleRatio: 'major-third' });
    send({ type: 'add-color-variables', data: cd });
    send({ type: 'add-typography-variables', data: td });
    send({ type: 'generate-components', data: { components: components.filter(c => c.selected), spacing: 24, includeVariants: true } });
  }, [colorData, typographyData, components, send]);

  // Phase 2: restore session
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return;
    (async () => {
      const { initSupabase } = await import('../shared/supabaseClient');
      const sb = initSupabase(SUPABASE_URL, SUPABASE_KEY);
      const { data } = await sb.auth.getSession();
      if (data.session) setSession(data.session);
    })();
  }, []);

  const syncData = useMemo(() => ({ colors: colorData, typography: typographyData, components }), [colorData, typographyData, components]);

  useSync({
    session,
    data: syncData,
    onRemoteUpdate: (data) => {
      if (data.colors) setColorData(data.colors);
      if (data.typography) setTypographyData(data.typography);
      if (data.components?.length) setComponents(data.components);
      addToast('クラウドから同期しました');
    },
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_KEY,
  });

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!SUPABASE_URL || !SUPABASE_KEY) return;
    setLoginLoading(true);
    try {
      const { initSupabase } = await import('../shared/supabaseClient');
      const sb = initSupabase(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await sb.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;
      if (data.session) { setSession(data.session); setShowLoginPanel(false); addToast('ログインしました'); }
    } catch (e) { addToast((e as Error).message, true); } finally { setLoginLoading(false); }
  }, [loginEmail, loginPassword, addToast]);

  const handleLogout = useCallback(async () => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return;
    const { getSupabase } = await import('../shared/supabaseClient');
    await getSupabase().auth.signOut();
    setSession(null);
    addToast('ログアウトしました');
  }, [addToast]);

  const selectedComp = useMemo(() => components.find(c => c.id === selected), [components, selected]);
  const colorVarCount = colorData ? colorData.primitive.variables.length + colorData.system.variables.length + colorData.semantic.variables.length : 0;
  const typoVarCount = typographyData?.variables.length ?? 0;

  const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="app-icon">⚡</span>
          <div>
            <h1>Design System Hub</h1>
            <p>デザインシステムを秒で作成</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileImport} />
          <button className="btn-add-all" style={{ background: 'transparent', color: 'var(--accent)', border: '1.5px solid var(--accent)', fontSize: 11 }} onClick={() => fileInputRef.current?.click()}>
            JSON↑
          </button>
          {hasSupabase && (
            session ? (
              <button className="btn-add-all" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontSize: 11 }} onClick={handleLogout} title={session.user.email}>
                ●同期中
              </button>
            ) : (
              <button className="btn-add-all" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: 11 }} onClick={() => setShowLoginPanel(p => !p)}>
                同期
              </button>
            )
          )}
          <button
            className="btn-add-all"
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: 11 }}
            onClick={() => send({ type: 'get-selection' })}
          >
            選択確認
          </button>
          <button className="btn-add-all" onClick={handleAddAll}>
            全てFigmaに追加
          </button>
        </div>
      </header>

      {showLoginPanel && hasSupabase && !session && (
        <form onSubmit={handleLogin} style={{ display: 'flex', gap: 6, padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', alignItems: 'center' }}>
          <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="メールアドレス" required style={{ flex: 1, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
          <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="パスワード" required style={{ flex: 1, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }} />
          <button type="submit" disabled={loginLoading} style={{ padding: '5px 10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
            {loginLoading ? '...' : 'ログイン'}
          </button>
        </form>
      )}

      {selectionInfo !== null && (
        <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Figma Selection — {selectionInfo.length === 0 ? '未選択' : `${selectionInfo.length}ノード`}
            </span>
            <button onClick={() => setSelectionInfo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12 }}>✕</button>
          </div>
          {selectionInfo.length === 0 && (
            <span style={{ color: 'var(--text-secondary)' }}>Figmaでコンポーネントを選択してください</span>
          )}
          {selectionInfo.map((node, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ background: node.nodeType === 'COMPONENT_SET' ? '#e0e7ff' : '#f0fdf4', color: node.nodeType === 'COMPONENT_SET' ? '#4338ca' : '#166534', borderRadius: 4, padding: '1px 5px', fontSize: 10, fontWeight: 600, fontFamily: 'monospace' }}>{node.nodeType}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{node.name}</span>
              </div>
              {node.description && <div style={{ color: 'var(--text-secondary)' }}>{node.description}</div>}
              {Object.keys(node.variants).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                  {Object.entries(node.variants).map(([key, opts]) => (
                    <div key={key} style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', minWidth: 60, fontFamily: 'monospace' }}>{key}:</span>
                      {opts.map(o => (
                        <span key={o} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', fontFamily: 'monospace' }}>{o}</span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {Object.keys(node.booleans).length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                  {Object.entries(node.booleans).map(([key, val]) => (
                    <span key={key} style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 3, padding: '1px 5px', fontFamily: 'monospace', fontSize: 10 }}>{key}: {String(val)}</span>
                  ))}
                </div>
              )}
              {node.childCount > 0 && (
                <div style={{ color: 'var(--text-secondary)', fontSize: 10 }}>子ノード: {node.childCount}個</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="layout">
        <Sidebar
          selected={selected}
          onSelect={setSelected}
          components={components}
          onToggleComponent={handleToggleComponent}
          colorCount={colorVarCount}
          typoCount={typoVarCount}
        />

        <div className="main-area">
          {selected === 'colors' && (
            <ColorPanel
              data={colorData}
              onDataChange={setColorData}
              onAdd={handleColorAdd}
            />
          )}
          {selected === 'typography' && (
            <TypographyPanel
              data={typographyData}
              onDataChange={setTypographyData}
              onAdd={handleTypoAdd}
            />
          )}
          {selectedComp && (
            <ComponentPanel
              comp={selectedComp}
              onStyleChange={handleStyleChange}
              onSizeChange={handleSizeChange}
              onPropertyChange={handlePropertyChange}
              onDocChange={handleDocChange}
              onToggle={handleToggleComponent}
              onAdd={handleComponentAdd}
              colorData={colorData}
            />
          )}
        </div>
      </div>

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.error ? 'toast-error' : 'toast-success'}`} onClick={() => dismissToast(t.id)} style={t.error ? { cursor: 'pointer' } : undefined}>
            {t.message}{t.error && <span style={{ marginLeft: 8, opacity: 0.7 }}>✕</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
