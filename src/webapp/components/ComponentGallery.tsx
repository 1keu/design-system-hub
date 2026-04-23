import React, { useState } from 'react';
import { ComponentConfig, SizeConfig } from '../../shared/types';
import { ComponentPreview } from '../../shared/ComponentPreview';

interface Props {
  components: ComponentConfig[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function defaultStyle(comp: ComponentConfig) {
  return comp.styleMap[comp.variants[0]] ?? { backgroundColor: '#6366f1', textColor: '#fff', borderColor: 'transparent', borderWidth: 0, borderRadius: 8, paddingX: 16, paddingY: 8, fontSize: 14, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0 };
}

function midSize(comp: ComponentConfig): SizeConfig | undefined {
  if (!comp.hasSizes) return undefined;
  const enabled = comp.sizeConfigs.filter(s => s.enabled);
  return enabled[Math.floor(enabled.length / 2)] ?? enabled[0];
}

const CATEGORY_COLOR: Record<string, string> = {
  'Actions': '#6366f1', 'Forms': '#8b5cf6', 'Data Display': '#06b6d4',
  'Layout': '#10b981', 'Navigation': '#f59e0b', 'Overlays': '#ef4444', 'Feedback': '#ec4899',
};

function ComponentSection({ comp, onEdit, onDelete }: { comp: ComponentConfig; onEdit: () => void; onDelete: () => void }) {
  const [activeTab, setActiveTab] = useState<'variants' | 'sizes' | 'docs'>('variants');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const enabledSizes = comp.hasSizes ? comp.sizeConfigs.filter(s => s.enabled) : [];
  const ms = midSize(comp);
  const color = CATEGORY_COLOR[comp.category] ?? '#6366f1';

  return (
    <section className="gallery-section">
      <div className="gallery-section-header">
        <div className="gallery-section-meta">
          <div className="gallery-section-dot" style={{ backgroundColor: color }} />
          <div>
            <h2 className="gallery-section-name">{comp.name}</h2>
            <span className="gallery-section-cat" style={{ color }}>{comp.category}</span>
          </div>
        </div>
        <div className="gallery-section-actions">
          {confirmDelete ? (
            <>
              <span className="gallery-confirm-text">削除しますか？</span>
              <button className="gallery-btn gallery-btn-danger" onClick={() => { onDelete(); setConfirmDelete(false); }}>削除</button>
              <button className="gallery-btn gallery-btn-ghost" onClick={() => setConfirmDelete(false)}>キャンセル</button>
            </>
          ) : (
            <>
              <button className="gallery-btn gallery-btn-outline" onClick={onEdit}>編集</button>
              <button className="gallery-btn gallery-btn-ghost" onClick={() => setConfirmDelete(true)}>削除</button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="gallery-tabs">
        <button className={`gallery-tab ${activeTab === 'variants' ? 'active' : ''}`} onClick={() => setActiveTab('variants')}>
          バリアント <span className="gallery-tab-count">{comp.variants.length}</span>
        </button>
        {comp.hasSizes && (
          <button className={`gallery-tab ${activeTab === 'sizes' ? 'active' : ''}`} onClick={() => setActiveTab('sizes')}>
            サイズ <span className="gallery-tab-count">{enabledSizes.length}</span>
          </button>
        )}
        <button className={`gallery-tab ${activeTab === 'docs' ? 'active' : ''}`} onClick={() => setActiveTab('docs')}>
          ドキュメント
        </button>
      </div>

      <div className="gallery-tab-body">
        {/* Variants */}
        {activeTab === 'variants' && (
          <div className="gallery-variants">
            {comp.variants.map(v => {
              const style = comp.styleMap[v] ?? defaultStyle(comp);
              return (
                <div key={v} className="gallery-variant-item">
                  <div className="gallery-preview-box">
                    <ComponentPreview comp={comp} variant={v} style={style} size={ms} />
                  </div>
                  <div className="gallery-variant-label">{v}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sizes */}
        {activeTab === 'sizes' && comp.hasSizes && (
          <div className="gallery-sizes">
            {enabledSizes.map(sz => {
              const style = comp.styleMap[comp.variants[0]] ?? defaultStyle(comp);
              return (
                <div key={sz.name} className="gallery-size-row">
                  <span className="gallery-size-label">{sz.name}</span>
                  <div className="gallery-preview-box gallery-preview-box--inline">
                    <ComponentPreview comp={comp} variant={comp.variants[0]} style={style} size={sz} />
                  </div>
                  {!comp.id.match(/avatar|checkbox/) && (
                    <span className="gallery-size-meta">{sz.paddingX}/{sz.paddingY}px · {sz.fontSize}px · r{sz.borderRadius}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Docs */}
        {activeTab === 'docs' && (
          <div className="gallery-docs">
            {comp.definition && (
              <div className="gallery-doc-block">
                <h4 className="gallery-doc-label">Definition</h4>
                <p className="gallery-doc-text">{comp.definition}</p>
              </div>
            )}
            {comp.usageExamples && (
              <div className="gallery-doc-block">
                <h4 className="gallery-doc-label">Usage Examples</h4>
                <ul className="gallery-doc-list">
                  {comp.usageExamples.split('\n').filter(l => l.trim()).map((l, i) => <li key={i}>{l.trim()}</li>)}
                </ul>
              </div>
            )}
            {(comp.doExample || comp.dontExample) && (
              <div className="gallery-doc-row">
                {comp.doExample && (
                  <div className="gallery-doc-block gallery-doc-block--do">
                    <h4 className="gallery-doc-label" style={{ color: '#166534' }}>✓ Do</h4>
                    <ul className="gallery-doc-list">
                      {comp.doExample.split('\n').filter(l => l.trim()).map((l, i) => <li key={i}>{l.trim()}</li>)}
                    </ul>
                  </div>
                )}
                {comp.dontExample && (
                  <div className="gallery-doc-block gallery-doc-block--dont">
                    <h4 className="gallery-doc-label" style={{ color: '#991b1b' }}>✕ Don't</h4>
                    <ul className="gallery-doc-list">
                      {comp.dontExample.split('\n').filter(l => l.trim()).map((l, i) => <li key={i}>{l.trim()}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {comp.accessibility && (
              <div className="gallery-doc-block">
                <h4 className="gallery-doc-label">Accessibility</h4>
                <ul className="gallery-doc-list">
                  {comp.accessibility.split('\n').filter(l => l.trim()).map((l, i) => <li key={i}>{l.trim()}</li>)}
                </ul>
              </div>
            )}
            {comp.states && (
              <div className="gallery-doc-block">
                <h4 className="gallery-doc-label">States</h4>
                <div className="gallery-states">
                  {comp.states.split('\n').filter(l => l.trim()).map((l, i) => {
                    const [k, ...rest] = l.split(':');
                    return (
                      <div key={i} className="gallery-state-row">
                        <code className="gallery-state-key">{k.trim()}</code>
                        <span className="gallery-state-val">{rest.join(':').trim()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {comp.relatedComponents && (
              <div className="gallery-doc-block">
                <h4 className="gallery-doc-label">Related Components</h4>
                <ul className="gallery-doc-list">
                  {comp.relatedComponents.split('\n').filter(l => l.trim()).map((l, i) => <li key={i}>{l.trim()}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default function ComponentGallery({ components, onEdit, onDelete }: Props) {
  if (components.length === 0) return null;

  return (
    <div className="gallery-root">
      {components.map(comp => (
        <ComponentSection
          key={comp.id}
          comp={comp}
          onEdit={() => onEdit(comp.id)}
          onDelete={() => onDelete(comp.id)}
        />
      ))}
    </div>
  );
}
