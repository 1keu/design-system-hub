import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ComponentGallery from './components/ComponentGallery';
import AddComponentModal from './components/AddComponentModal';
import AuthModal from './auth/AuthModal';
import LandingPage from './LandingPage';
import ColorPanel from '../ui/panels/ColorPanel';
import TypographyPanel from '../ui/panels/TypographyPanel';
import ComponentPanel from '../ui/panels/ComponentPanel';
import { ColorVariableData, TypographyVariableData, ComponentConfig, VariantStyle, SizeConfig, ComponentProperty } from '../shared/types';
import { generateColorVariableData } from '../ui/utils/colorGenerator';
import { generateTypographyVariableData } from '../ui/utils/typographyGenerator';
import { buildFigmaExport, parseFigmaExport, mergeImportedComponents, generateDetailedMarkdown } from './utils/figmaExport';
import { downloadJson, downloadMarkdown } from './utils/download';
import { useSync } from './hooks/useSync';
import { Session } from '../shared/supabaseClient';

const SUPABASE_URL = (window as unknown as Record<string, string>).__SUPABASE_URL__ ?? '';
const SUPABASE_KEY = (window as unknown as Record<string, string>).__SUPABASE_KEY__ ?? '';
const STORAGE_KEY = 'design-system-hub-v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { colors: ColorVariableData | null; typography: TypographyVariableData | null; components: ComponentConfig[] };
  } catch { return null; }
}

function save(colors: ColorVariableData | null, typography: TypographyVariableData | null, components: ComponentConfig[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ colors, typography, components })); } catch { /* ignore */ }
}

type View = 'gallery' | 'colors' | 'typography' | string; // string = component id being edited

interface Toast { id: number; message: string; error?: boolean }

const LP_SEEN_KEY = 'design-system-hub-lp-seen';

export default function App() {
  const local = load();
  const [showLanding, setShowLanding] = useState(() => {
    try { return !localStorage.getItem(LP_SEEN_KEY); } catch { return true; }
  });

  const [components, setComponents]     = useState<ComponentConfig[]>(local?.components ?? []);
  const [colorData, setColorData]       = useState<ColorVariableData | null>(local?.colors ?? null);
  const [typographyData, setTypographyData] = useState<TypographyVariableData | null>(local?.typography ?? null);
  const [view, setView]                 = useState<View>('gallery');
  const [showAddModal, setShowAddModal] = useState(false);
  const [session, setSession]           = useState<Session | null>(null);
  const [showAuth, setShowAuth]         = useState(false);
  const [toasts, setToasts]             = useState<Toast[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleEnterApp() {
    try { localStorage.setItem(LP_SEEN_KEY, '1'); } catch { /* ignore */ }
    setShowLanding(false);
  }

  // Persist to localStorage
  useEffect(() => { save(colorData, typographyData, components); }, [colorData, typographyData, components]);

  // Restore Supabase session
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return;
    (async () => {
      const { initSupabase } = await import('../shared/supabaseClient');
      const sb = initSupabase(SUPABASE_URL, SUPABASE_KEY);
      const { data } = await sb.auth.getSession();
      if (data.session) setSession(data.session);
    })();
  }, []);

  const addToast = useCallback((message: string, error = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, error }]);
    if (!error) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  // Phase 2 sync
  const syncData = useMemo(() => ({ colors: colorData, typography: typographyData, components }), [colorData, typographyData, components]);

  useSync({
    session,
    data: syncData,
    onRemoteUpdate: ({ colors, typography, components: comps }) => {
      if (colors)    setColorData(colors);
      if (typography) setTypographyData(typography);
      if (comps)     setComponents(comps);
      addToast('クラウドから同期しました');
    },
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_KEY,
  });

  // Add component from template
  const handleAddComponent = useCallback((comp: ComponentConfig) => {
    setComponents(prev => [...prev, comp]);
    addToast(`「${comp.name}」を追加しました`);
  }, [addToast]);

  // Delete component
  const handleDeleteComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    if (view === id) setView('gallery');
  }, [view]);

  // Component config handlers
  const handleToggle = useCallback((id: string) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  }, []);

  const handleStyleChange = useCallback((compId: string, variant: string, field: keyof VariantStyle, value: string | number) => {
    setComponents(prev => prev.map(c => c.id !== compId ? c : {
      ...c, styleMap: { ...c.styleMap, [variant]: { ...c.styleMap[variant], [field]: value } },
    }));
  }, []);

  const handleSizeChange = useCallback((compId: string, sizeName: string, field: keyof SizeConfig, value: number | boolean) => {
    setComponents(prev => prev.map(c => c.id !== compId ? c : {
      ...c, sizeConfigs: c.sizeConfigs.map(s => s.name === sizeName ? { ...s, [field]: value } : s),
    }));
  }, []);

  const handlePropertyChange = useCallback((compId: string, propId: string, field: keyof ComponentProperty, value: boolean | string) => {
    setComponents(prev => prev.map(c => c.id !== compId ? c : {
      ...c, componentProperties: c.componentProperties.map(p => p.id === propId ? { ...p, [field]: value } : p),
    }));
  }, []);

  const handleDocChange = useCallback((compId: string, field: 'definition' | 'usageExamples' | 'usageConditions' | 'doExample' | 'dontExample' | 'accessibility' | 'states' | 'relatedComponents', value: string) => {
    setComponents(prev => prev.map(c => c.id !== compId ? c : { ...c, [field]: value }));
  }, []);

  // Export
  const handleDownloadFigmaJson = useCallback(() => {
    const colors = colorData ?? generateColorVariableData([
      { name: 'indigo', hex: '#6366f1', role: 'primary' },
      { name: 'violet', hex: '#8b5cf6', role: 'secondary' },
      { name: 'cyan', hex: '#06b6d4', role: 'accent' },
      { name: 'slate', hex: '#64748b', role: 'neutral' },
    ]);
    const typo = typographyData ?? generateTypographyVariableData({ sansFont: 'Inter', serifFont: 'Merriweather', monoFont: 'JetBrains Mono', baseSize: 16, scaleRatio: 'major-third' });
    downloadJson(buildFigmaExport(colors, typo, components), 'design-system.figma.json');
    addToast('.figma.json をダウンロードしました');
  }, [colorData, typographyData, components, addToast]);

  const handleDownloadMarkdown = useCallback(() => {
    downloadMarkdown(generateDetailedMarkdown(colorData, typographyData, components), 'design-system.md');
    addToast('Markdown をダウンロードしました');
  }, [colorData, typographyData, components, addToast]);

  // File import
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
        if (parsed.components?.length) {
          setComponents(prev => mergeImportedComponents(prev, parsed.components));
          addToast(`インポート完了 — ${parsed.components.length} コンポーネント`);
        }
      } catch { addToast('ファイルの読み込みに失敗しました', true); }
      e.target.value = '';
    };
    reader.readAsText(file);
  }, [addToast]);

  const handleLogout = useCallback(async () => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return;
    const { getSupabase } = await import('../shared/supabaseClient');
    await getSupabase().auth.signOut();
    setSession(null);
    addToast('ログアウトしました');
  }, [addToast]);

  const editingComp = useMemo(() => components.find(c => c.id === view), [components, view]);
  const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);
  const isEmpty = components.length === 0 && view === 'gallery';

  if (showLanding) return <LandingPage onEnterApp={handleEnterApp} />;

  return (
    <div className="wa-app">
      {/* ===== Header ===== */}
      <header className="wa-header">
        <button className="wa-logo" onClick={() => setView('gallery')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="wa-logo-icon">⚡</span>
          <div style={{ textAlign: 'left' }}>
            <span className="wa-logo-name">Design System Hub</span>
            <span className="wa-logo-sub">{session ? '同期中' : 'ローカル'}</span>
          </div>
        </button>

        {/* Nav */}
        <nav className="wa-header-nav">
          <button className={`wa-nav-btn ${view === 'gallery' ? 'active' : ''}`} onClick={() => setView('gallery')}>
            コンポーネント <span className="wa-nav-count">{components.length}</span>
          </button>
          <button className={`wa-nav-btn ${view === 'colors' ? 'active' : ''}`} onClick={() => setView('colors')}>
            カラー
          </button>
          <button className={`wa-nav-btn ${view === 'typography' ? 'active' : ''}`} onClick={() => setView('typography')}>
            タイポグラフィ
          </button>
        </nav>

        {/* Actions */}
        <div className="wa-header-actions">
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileImport} />
          <button className="wa-btn wa-btn-ghost" onClick={() => fileInputRef.current?.click()}>インポート</button>
          <button className="wa-btn wa-btn-outline" onClick={handleDownloadMarkdown}>.md ↓</button>
          <button className="wa-btn wa-btn-figma" onClick={handleDownloadFigmaJson}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <rect width="20" height="20" rx="4" fill="#0ACF83"/>
              <path d="M7 4h6l2 3-2 3H7L5 7l2-3z" fill="white" opacity="0.9"/>
            </svg>
            Figmaにエクスポート
          </button>
          <button className="wa-btn wa-btn-add" onClick={() => setShowAddModal(true)}>
            + 追加
          </button>

          {hasSupabase && (
            session ? (
              <div className="wa-user">
                <span className="wa-user-dot synced" />
                <span className="wa-user-email">{session.user.email}</span>
                <button className="wa-btn wa-btn-ghost" onClick={handleLogout}>ログアウト</button>
              </div>
            ) : (
              <button className="wa-btn wa-btn-sync" onClick={() => setShowAuth(true)}>
                ☁ 同期
              </button>
            )
          )}
        </div>
      </header>

      {/* ===== Main ===== */}
      <main className="wa-main">
        {/* Empty state */}
        {isEmpty && (
          <div className="wa-empty">
            <div className="wa-empty-icon">⚡</div>
            <h1 className="wa-empty-title">デザインシステムを始めましょう</h1>
            <p className="wa-empty-desc">
              コンポーネントを追加してStorybookのように確認できます。<br />
              完成したらFigmaや.mdファイルにエクスポートできます。
            </p>
            <button className="wa-empty-btn" onClick={() => setShowAddModal(true)}>
              + 最初のコンポーネントを追加
            </button>
            <div className="wa-empty-import">
              または{' '}
              <button className="wa-empty-import-link" onClick={() => fileInputRef.current?.click()}>
                .figma.json をインポート
              </button>
            </div>
          </div>
        )}

        {/* Gallery */}
        {view === 'gallery' && components.length > 0 && (
          <div className="wa-gallery-wrap">
            <div className="wa-gallery-toolbar">
              <h2 className="wa-gallery-title">コンポーネント</h2>
              <button className="wa-btn wa-btn-primary" onClick={() => setShowAddModal(true)}>
                + コンポーネントを追加
              </button>
            </div>
            <ComponentGallery
              components={components}
              onEdit={id => setView(id)}
              onDelete={handleDeleteComponent}
            />
          </div>
        )}

        {/* Color panel */}
        {view === 'colors' && (
          <div className="wa-panel-wrap">
            <ColorPanel data={colorData} onDataChange={setColorData} onAdd={() => addToast('カラートークンを保存しました')} />
          </div>
        )}

        {/* Typography panel */}
        {view === 'typography' && (
          <div className="wa-panel-wrap">
            <TypographyPanel data={typographyData} onDataChange={setTypographyData} onAdd={() => addToast('タイポグラフィを保存しました')} />
          </div>
        )}

        {/* Component edit panel */}
        {editingComp && (
          <div className="wa-panel-wrap wa-panel-edit">
            <div className="wa-edit-breadcrumb">
              <button className="wa-edit-back" onClick={() => setView('gallery')}>← コンポーネント一覧</button>
              <span className="wa-edit-sep">/</span>
              <span className="wa-edit-name">{editingComp.name}</span>
            </div>
            <ComponentPanel
              comp={editingComp}
              onStyleChange={handleStyleChange}
              onSizeChange={handleSizeChange}
              onPropertyChange={handlePropertyChange}
              onDocChange={handleDocChange}
              onToggle={handleToggle}
              onAdd={() => { setView('gallery'); addToast(`「${editingComp.name}」を更新しました`); }}
              colorData={colorData}
            />
          </div>
        )}
      </main>

      {/* ===== Toasts ===== */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.error ? 'toast-error' : 'toast-success'}`} onClick={() => dismissToast(t.id)} style={t.error ? { cursor: 'pointer' } : undefined}>
            {t.message}{t.error && <span style={{ marginLeft: 8, opacity: 0.7 }}>✕</span>}
          </div>
        ))}
      </div>

      {/* ===== Modals ===== */}
      {showAddModal && (
        <AddComponentModal
          existingIds={components.map(c => c.id)}
          onAdd={handleAddComponent}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showAuth && hasSupabase && (
        <AuthModal
          supabaseUrl={SUPABASE_URL}
          supabaseKey={SUPABASE_KEY}
          onAuth={s => { setSession(s); setShowAuth(false); addToast('ログインしました'); }}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}
