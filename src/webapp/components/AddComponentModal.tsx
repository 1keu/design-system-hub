import React, { useState, useCallback } from 'react';
import { ComponentConfig, SizeConfig, VariantStyle, ComponentProperty } from '../../shared/types';
import { INITIAL_COMPONENTS } from '../../shared/defaults';
import { ComponentPreview } from '../../shared/ComponentPreview';
import ConfigStyleTab from './ConfigStyleTab';
import ConfigSizesTab from './ConfigSizesTab';
import ConfigPropertiesTab from './ConfigPropertiesTab';

interface Props {
  existingIds: string[];
  onAdd: (comp: ComponentConfig) => void;
  onClose: () => void;
}

type Step = 'select' | 'configure';
type ConfigTab = 'style' | 'sizes' | 'properties';

const CATEGORY_ORDER = ['Actions', 'Forms', 'Data Display', 'Layout', 'Navigation', 'Overlays', 'Feedback'];

const CATEGORY_COLOR: Record<string, string> = {
  'Actions': '#6366f1', 'Forms': '#8b5cf6', 'Data Display': '#06b6d4',
  'Layout': '#10b981', 'Navigation': '#f59e0b', 'Overlays': '#ef4444', 'Feedback': '#ec4899',
};

function midSize(comp: ComponentConfig): SizeConfig | undefined {
  if (!comp.hasSizes) return undefined;
  const enabled = comp.sizeConfigs.filter(s => s.enabled);
  return enabled[Math.floor(enabled.length / 2)] ?? enabled[0];
}

function cloneComp(comp: ComponentConfig): ComponentConfig {
  return {
    ...comp,
    selected: true,
    styleMap: Object.fromEntries(Object.entries(comp.styleMap).map(([k, v]) => [k, { ...v }])),
    sizeConfigs: comp.sizeConfigs.map(s => ({ ...s })),
    componentProperties: comp.componentProperties.map(p => ({ ...p })),
  };
}

export default function AddComponentModal({ existingIds, onAdd, onClose }: Props) {
  const [step, setStep] = useState<Step>('select');
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [draft, setDraft] = useState<ComponentConfig | null>(null);
  const [activeVariant, setActiveVariant] = useState('');
  const [configTab, setConfigTab] = useState<ConfigTab>('style');

  const available = INITIAL_COMPONENTS.filter(c => !existingIds.includes(c.id));

  const byCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = available.filter(c => c.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, ComponentConfig[]>);

  const selectedComp = available.find(c => c.id === selected);
  const hoveredComp  = available.find(c => c.id === hovered);
  const previewComp  = selectedComp ?? hoveredComp;

  const handleNext = () => {
    if (!selectedComp) return;
    const d = cloneComp(selectedComp);
    setDraft(d);
    setActiveVariant(d.variants[0] ?? '');
    setConfigTab('style');
    setStep('configure');
  };

  const handleAdd = () => {
    if (!draft) return;
    onAdd(draft);
    onClose();
  };

  const handleStyleChange = useCallback((variant: string, field: keyof VariantStyle, value: string | number) => {
    setDraft(prev => !prev ? null : {
      ...prev,
      styleMap: { ...prev.styleMap, [variant]: { ...prev.styleMap[variant], [field]: value } },
    });
  }, []);

  const handleSizeChange = useCallback((sizeName: string, field: keyof SizeConfig, value: number | boolean) => {
    setDraft(prev => !prev ? null : {
      ...prev,
      sizeConfigs: prev.sizeConfigs.map(s => s.name === sizeName ? { ...s, [field]: value } : s),
    });
  }, []);

  const handlePropertyChange = useCallback((propId: string, field: keyof ComponentProperty, value: boolean | string) => {
    setDraft(prev => !prev ? null : {
      ...prev,
      componentProperties: prev.componentProperties.map(p => p.id === propId ? { ...p, [field]: value } : p),
    });
  }, []);

  // ===== Empty state =====
  if (available.length === 0) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="add-modal" onClick={e => e.stopPropagation()}>
          <div className="add-modal-header">
            <h2>コンポーネントを追加</h2>
            <button className="add-modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="add-modal-empty">
            <p>追加できるコンポーネントはすべて追加済みです。</p>
            <button className="wa-btn wa-btn-primary" onClick={onClose}>閉じる</button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Step 1: Select =====
  if (step === 'select') {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="add-modal add-modal--wide" onClick={e => e.stopPropagation()}>
          <div className="add-modal-header">
            <h2>コンポーネントを追加</h2>
            <button className="add-modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="add-modal-body">
            <div className="add-modal-list">
              {Object.entries(byCategory).map(([cat, comps]) => (
                <div key={cat} className="add-modal-cat">
                  <div className="add-modal-cat-label" style={{ color: CATEGORY_COLOR[cat] }}>{cat}</div>
                  <div className="add-modal-items">
                    {comps.map(comp => (
                      <button
                        key={comp.id}
                        className={`add-modal-item ${selected === comp.id ? 'selected' : ''}`}
                        onClick={() => setSelected(comp.id === selected ? null : comp.id)}
                        onMouseEnter={() => setHovered(comp.id)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <div className="add-modal-item-dot" style={{ backgroundColor: comp.styleMap[comp.variants[0]]?.backgroundColor ?? '#6366f1' }} />
                        <div className="add-modal-item-info">
                          <span className="add-modal-item-name">{comp.name}</span>
                          <span className="add-modal-item-variants">{comp.variants.length} variants</span>
                        </div>
                        {selected === comp.id && <span className="add-modal-check">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="add-modal-preview">
              {previewComp ? (
                <>
                  <div className="add-modal-preview-name">{previewComp.name}</div>
                  <div className="add-modal-preview-desc">{previewComp.definition?.slice(0, 100)}{(previewComp.definition?.length ?? 0) > 100 ? '...' : ''}</div>
                  <div className="add-modal-preview-variants">
                    {previewComp.variants.map(v => {
                      const style = previewComp.styleMap[v];
                      if (!style) return null;
                      return (
                        <div key={v} className="add-modal-preview-variant">
                          <div className="add-modal-preview-variant-comp">
                            <ComponentPreview comp={previewComp} variant={v} style={style} size={midSize(previewComp)} />
                          </div>
                          <div className="add-modal-preview-variant-label">{v}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="add-modal-preview-empty">
                  <div className="add-modal-preview-empty-icon">←</div>
                  <p>コンポーネントを選択するとプレビューが表示されます</p>
                </div>
              )}
            </div>
          </div>

          <div className="add-modal-footer">
            <button className="wa-btn wa-btn-ghost" onClick={onClose}>キャンセル</button>
            <button className="wa-btn wa-btn-primary" onClick={handleNext} disabled={!selected}>
              {selected ? `「${selectedComp?.name}」の設定へ →` : 'コンポーネントを選択してください'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Step 2: Configure =====
  if (!draft) return null;

  const activeStyle = draft.styleMap[activeVariant] ?? Object.values(draft.styleMap)[0];
  const enabledSizes = draft.hasSizes ? draft.sizeConfigs.filter(s => s.enabled) : [];
  const previewSize = enabledSizes[Math.floor(enabledSizes.length / 2)] ?? draft.sizeConfigs[0];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="add-modal add-modal--configure" onClick={e => e.stopPropagation()}>
        <div className="add-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="cfg-back-btn" onClick={() => setStep('select')}>← 選択に戻る</button>
            <h2>{draft.name} の設定</h2>
          </div>
          <button className="add-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="add-modal-cfg-body">
          {/* Left: config controls */}
          <div className="add-modal-cfg-left">
            <div className="cfg-variant-bar">
              {draft.variants.map(v => (
                <button
                  key={v}
                  className={`cfg-variant-pill ${activeVariant === v ? 'active' : ''}`}
                  style={activeVariant === v ? { borderColor: activeStyle?.backgroundColor, color: activeStyle?.backgroundColor } : {}}
                  onClick={() => setActiveVariant(v)}
                >
                  <div className="cfg-vp-dot" style={{ backgroundColor: draft.styleMap[v]?.backgroundColor ?? '#ccc' }} />
                  {v}
                </button>
              ))}
            </div>

            <div className="cfg-tabs">
              <button className={`cfg-tab ${configTab === 'style' ? 'active' : ''}`} onClick={() => setConfigTab('style')}>スタイル</button>
              {draft.hasSizes && (
                <button className={`cfg-tab ${configTab === 'sizes' ? 'active' : ''}`} onClick={() => setConfigTab('sizes')}>
                  サイズ <span className="cfg-tab-badge">{enabledSizes.length}</span>
                </button>
              )}
              {draft.componentProperties.length > 0 && (
                <button className={`cfg-tab ${configTab === 'properties' ? 'active' : ''}`} onClick={() => setConfigTab('properties')}>
                  プロパティ <span className="cfg-tab-badge">{draft.componentProperties.filter(p => p.enabled).length}</span>
                </button>
              )}
            </div>

            <div className="cfg-tab-body">
              {configTab === 'style' && activeStyle && (
                <ConfigStyleTab
                  style={activeStyle}
                  onChange={(field, value) => handleStyleChange(activeVariant, field, value)}
                />
              )}
              {configTab === 'sizes' && draft.hasSizes && (
                <ConfigSizesTab
                  compId={draft.id}
                  sizeConfigs={draft.sizeConfigs}
                  onSizeChange={handleSizeChange}
                />
              )}
              {configTab === 'properties' && (
                <ConfigPropertiesTab
                  properties={draft.componentProperties}
                  onChange={handlePropertyChange}
                />
              )}
            </div>
          </div>

          {/* Right: live preview */}
          <div className="add-modal-cfg-right">
            <div className="cfg-preview-label">プレビュー — {activeVariant}</div>
            <div className="cfg-preview-main">
              {activeStyle && (
                <ComponentPreview comp={draft} variant={activeVariant} style={activeStyle} size={previewSize} />
              )}
            </div>
            <div className="cfg-preview-all-label">全バリアント</div>
            <div className="cfg-preview-grid">
              {draft.variants.map(v => {
                const s = draft.styleMap[v];
                if (!s) return null;
                return (
                  <div key={v} className={`cfg-preview-item ${activeVariant === v ? 'active' : ''}`} onClick={() => setActiveVariant(v)}>
                    <div className="cfg-preview-item-box">
                      <ComponentPreview comp={draft} variant={v} style={s} size={previewSize} />
                    </div>
                    <div className="cfg-preview-item-label">{v}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="add-modal-footer">
          <button className="wa-btn wa-btn-ghost" onClick={() => setStep('select')}>← 戻る</button>
          <button className="wa-btn wa-btn-primary" onClick={handleAdd}>
            「{draft.name}」を追加
          </button>
        </div>
      </div>
    </div>
  );
}
