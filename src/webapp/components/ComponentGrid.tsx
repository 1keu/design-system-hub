import React from 'react';
import { ComponentConfig } from '../../shared/types';

interface Props {
  components: ComponentConfig[];
  onSelect: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Actions':      '#6366f1',
  'Forms':        '#8b5cf6',
  'Data Display': '#06b6d4',
  'Layout':       '#10b981',
  'Navigation':   '#f59e0b',
  'Overlays':     '#ef4444',
  'Feedback':     '#ec4899',
};

function VariantSwatches({ comp }: { comp: ComponentConfig }) {
  return (
    <div className="cg-swatches">
      {comp.variants.slice(0, 5).map(v => (
        <div
          key={v}
          className="cg-swatch"
          style={{ backgroundColor: comp.styleMap[v]?.backgroundColor ?? '#e5e7eb' }}
          title={v}
        />
      ))}
      {comp.variants.length > 5 && (
        <span className="cg-swatch-more">+{comp.variants.length - 5}</span>
      )}
    </div>
  );
}

function ComponentCard({ comp, onSelect }: { comp: ComponentConfig; onSelect: () => void }) {
  const color = CATEGORY_COLORS[comp.category] ?? '#6366f1';
  return (
    <article className="cg-card" onClick={onSelect} tabIndex={0} onKeyDown={e => e.key === 'Enter' && onSelect()}>
      <div className="cg-card-bar" style={{ backgroundColor: color }} />
      <div className="cg-card-body">
        <div className="cg-card-header">
          <div>
            <h3 className="cg-card-name">{comp.name}</h3>
            <span className="cg-card-cat" style={{ color }}>{comp.category}</span>
          </div>
          <div className={`cg-card-badge ${comp.selected ? 'active' : ''}`}>
            {comp.selected ? 'ON' : 'OFF'}
          </div>
        </div>
        <p className="cg-card-desc">{comp.definition?.slice(0, 80)}{comp.definition?.length > 80 ? '...' : ''}</p>
        <VariantSwatches comp={comp} />
        <div className="cg-card-meta">
          <span>{comp.variants.length} variants</span>
          {comp.hasSizes && <span>{comp.sizeConfigs.filter(s => s.enabled).length} sizes</span>}
          {comp.componentProperties.filter(p => p.enabled).length > 0 && (
            <span>{comp.componentProperties.filter(p => p.enabled).length} props</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ComponentGrid({ components, onSelect }: Props) {
  const byCategory = components.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {} as Record<string, ComponentConfig[]>);

  return (
    <div className="cg-root">
      <div className="cg-header">
        <h2 className="cg-title">コンポーネント一覧</h2>
        <span className="cg-count">{components.length} components</span>
      </div>
      {Object.entries(byCategory).map(([cat, comps]) => (
        <section key={cat} className="cg-section">
          <h3 className="cg-section-title" style={{ color: CATEGORY_COLORS[cat] ?? '#6366f1' }}>
            {cat}
          </h3>
          <div className="cg-grid">
            {comps.map(comp => (
              <ComponentCard key={comp.id} comp={comp} onSelect={() => onSelect(comp.id)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
