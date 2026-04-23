import React from 'react';
import { ComponentConfig } from '../../shared/types';

export type SidebarItemId = 'colors' | 'typography' | string;

interface SidebarItem {
  id: SidebarItemId;
  label: string;
  icon: string;
  type: 'system' | 'component';
  category?: string;
  enabled?: boolean;
}

interface Props {
  selected: SidebarItemId;
  onSelect: (id: SidebarItemId) => void;
  components: ComponentConfig[];
  onToggleComponent: (id: string) => void;
  colorCount: number;
  typoCount: number;
}

const CATEGORY_ORDER = ['Actions', 'Forms', 'Data Display', 'Layout', 'Navigation', 'Overlays', 'Feedback'];

export default function Sidebar({ selected, onSelect, components, onToggleComponent, colorCount, typoCount }: Props) {
  const byCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = components.filter(c => c.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, ComponentConfig[]>);

  const selectedCount = components.filter(c => c.selected).length;

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-group-label">デザイントークン</div>

        <button
          className={`sidebar-item ${selected === 'colors' ? 'active' : ''}`}
          onClick={() => onSelect('colors')}
        >
          <span className="si-icon">🎨</span>
          <span className="si-label">カラー</span>
          {colorCount > 0 && <span className="si-badge">{colorCount}</span>}
        </button>

        <button
          className={`sidebar-item ${selected === 'typography' ? 'active' : ''}`}
          onClick={() => onSelect('typography')}
        >
          <span className="si-icon">📐</span>
          <span className="si-label">タイポグラフィ</span>
          {typoCount > 0 && <span className="si-badge">{typoCount}</span>}
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-group-label">
          コンポーネント
          <span className="si-badge-inline">{selectedCount}/{components.length}</span>
        </div>

        {Object.entries(byCategory).map(([cat, comps]) => (
          <div key={cat} className="sidebar-category">
            <div className="sidebar-cat-label">{cat}</div>
            {comps.map(comp => (
              <div
                key={comp.id}
                className={`sidebar-item comp-item ${selected === comp.id ? 'active' : ''}`}
                onClick={() => onSelect(comp.id)}
              >
                <div
                  className={`si-check ${comp.selected ? 'checked' : ''}`}
                  onClick={e => { e.stopPropagation(); onToggleComponent(comp.id); }}
                />
                <span className="si-label">{comp.name}</span>
                <div className="si-swatches">
                  {comp.variants.slice(0, 3).map(v => (
                    <div
                      key={v}
                      className="si-swatch"
                      style={{ backgroundColor: comp.styleMap[v]?.backgroundColor ?? '#ccc' }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
