import React, { useState, useCallback, useMemo } from 'react';
import { ComponentConfig, VariantStyle, SizeConfig, ColorVariableData, ComponentProperty } from '../../shared/types';

interface Props {
  comp: ComponentConfig;
  onStyleChange: (compId: string, variant: string, field: keyof VariantStyle, value: string | number) => void;
  onSizeChange: (compId: string, sizeName: string, field: keyof SizeConfig, value: number | boolean) => void;
  onPropertyChange: (compId: string, propId: string, field: keyof ComponentProperty, value: boolean | string) => void;
  onDocChange: (compId: string, field: 'definition' | 'usageExamples' | 'usageConditions' | 'doExample' | 'dontExample' | 'accessibility' | 'states' | 'relatedComponents', value: string) => void;
  onToggle: (id: string) => void;
  onAdd: (comp: ComponentConfig) => void;
  colorData: ColorVariableData | null;
}

type DetailTab = 'style' | 'sizes' | 'properties' | 'doc';

function defaultStyle(overrides: Partial<VariantStyle> = {}): VariantStyle {
  return { backgroundColor: '#6366f1', textColor: '#ffffff', borderColor: 'transparent', borderWidth: 0, borderRadius: 8, paddingX: 16, paddingY: 8, fontSize: 14, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0, ...overrides };
}

// ===== HTML Preview =====

function hasLayer(comp: ComponentConfig, layer: ComponentProperty['layer']): boolean {
  return comp.componentProperties.some(p => p.layer === layer && p.enabled && p.defaultValue === true);
}

function ComponentPreview({ comp, variant, style, size }: { comp: ComponentConfig; variant: string; style: VariantStyle; size?: SizeConfig }) {
  const px = size?.paddingX ?? style.paddingX;
  const py = size?.paddingY ?? style.paddingY;
  const fs = size?.fontSize ?? style.fontSize;
  const br = size?.borderRadius ?? style.borderRadius;
  const shadow = style.shadowBlur > 0 ? `0 4px ${style.shadowBlur}px ${style.shadowColor}` : 'none';

  const base: React.CSSProperties = {
    backgroundColor: style.backgroundColor,
    color: style.textColor,
    border: style.borderWidth > 0 ? `${style.borderWidth}px solid ${style.borderColor}` : 'none',
    borderRadius: br,
    padding: `${py}px ${px}px`,
    fontSize: fs,
    fontWeight: style.fontWeight,
    boxShadow: shadow,
    fontFamily: 'Inter, sans-serif',
    lineHeight: 1.4,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s',
  };

  const iconBox = (color: string, s: number) => (
    <div style={{ width: s, height: s, borderRadius: 3, backgroundColor: color, opacity: 0.5, flexShrink: 0 }} />
  );

  if (comp.id === 'button') {
    const showLeft  = hasLayer(comp, 'icon-left');
    const showRight = hasLayer(comp, 'icon-right');
    const iconOnly  = hasLayer(comp, 'icon-only');
    const showLabel = !iconOnly && hasLayer(comp, 'label');
    const labelText = showLabel !== false ? variant.charAt(0).toUpperCase() + variant.slice(1) : null;
    return (
      <button style={{ ...base, cursor: 'default' }}>
        {showLeft  && iconBox(style.textColor, fs)}
        {iconOnly  ? iconBox(style.textColor, fs) : labelText}
        {showRight && iconBox(style.textColor, fs)}
      </button>
    );
  }
  if (comp.id === 'input') {
    const isUnder   = variant === 'underlined';
    const showLabel = hasLayer(comp, 'label');
    const showLeft  = hasLayer(comp, 'icon-left');
    const showRight = hasLayer(comp, 'icon-right');
    const showHelper = hasLayer(comp, 'helper-text');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {showLabel && <label style={{ fontSize: Math.max(fs - 2, 10), fontWeight: 500, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Label</label>}
        <div style={{ ...base, display: 'flex', width: 160, border: isUnder ? 'none' : base.border, borderBottom: isUnder ? `2px solid ${style.borderColor}` : undefined, borderRadius: isUnder ? 0 : br, color: '#94a3b8', gap: 6 }}>
          {showLeft  && iconBox('#94a3b8', fs)}
          <span style={{ flex: 1 }}>Placeholder...</span>
          {showRight && iconBox('#94a3b8', fs)}
        </div>
        {showHelper && <span style={{ fontSize: Math.max(fs - 3, 9), color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>Helper text</span>}
      </div>
    );
  }
  if (comp.id === 'badge') {
    const showLeading = hasLayer(comp, 'icon-left');
    const showLabel   = hasLayer(comp, 'label');
    const statusIcon: Record<string, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    return (
      <span style={base}>
        {showLeading && iconBox(style.textColor, fs - 1)}
        {showLabel && (statusIcon[variant] ? `${statusIcon[variant]} ` : '') + variant.charAt(0).toUpperCase() + variant.slice(1)}
      </span>
    );
  }
  if (comp.id === 'avatar') {
    const d = size?.fixedSize ?? 40;
    const radius = variant === 'circle' ? '50%' : variant === 'rounded' ? d * 0.2 : 4;
    const showDot = hasLayer(comp, 'status-dot');
    return (
      <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
        <div style={{ width: d, height: d, borderRadius: radius, backgroundColor: style.backgroundColor, color: style.textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs, fontWeight: 700, fontFamily: 'Inter, sans-serif', boxShadow: shadow }}>
          {variant === 'circle' ? 'AB' : variant === 'rounded' ? 'AB' : '▣'}
        </div>
        {showDot && (
          <div style={{ position: 'absolute', bottom: 1, right: 1, width: d * 0.25, height: d * 0.25, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid white' }} />
        )}
      </div>
    );
  }
  if (comp.id === 'card') {
    const showImage  = hasLayer(comp, 'image');
    const showFooter = hasLayer(comp, 'footer');
    const showClose  = hasLayer(comp, 'close-btn');
    return (
      <div style={{ ...base, flexDirection: 'column', alignItems: 'flex-start', display: 'flex', width: 160, gap: 8, position: 'relative' }}>
        {showClose && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, color: '#94a3b8' }}>✕</div>}
        {showImage && <div style={{ width: '100%', height: 50, backgroundColor: '#e2e8f0', borderRadius: 6 }} />}
        <div style={{ fontWeight: 700, fontSize: fs }}>Card Title</div>
        <div style={{ fontSize: Math.max(fs - 2, 10), color: '#94a3b8' }}>Description text.</div>
        {showFooter && (
          <div style={{ width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: 6, display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#6366f1', fontFamily: 'Inter, sans-serif' }}>Action</span>
          </div>
        )}
      </div>
    );
  }
  if (comp.id === 'modal') {
    return (
      <div style={{ width: 200, backgroundColor: style.backgroundColor, borderRadius: br, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.18)' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: fs, color: style.textColor, fontFamily: 'Inter, sans-serif' }}>Modal</span>
          <span style={{ color: '#94a3b8' }}>✕</span>
        </div>
        <div style={{ padding: '10px 14px', fontSize: Math.max(fs - 2, 10), color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Content here.</div>
        <div style={{ padding: '8px 14px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: Math.max(fs - 2, 10), backgroundColor: '#6366f1', color: '#fff', padding: '4px 10px', borderRadius: 5, fontFamily: 'Inter, sans-serif' }}>OK</span>
        </div>
      </div>
    );
  }
  if (comp.id === 'toast') {
    const icons: Record<string, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ', default: '🔔' };
    const showIcon  = hasLayer(comp, 'icon-left');
    const showDesc  = hasLayer(comp, 'description');
    const showClose = hasLayer(comp, 'close-btn');
    return (
      <div style={{ ...base, width: 200, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {showIcon && <span style={{ fontSize: fs + 2, flexShrink: 0 }}>{icons[variant] ?? '🔔'}</span>}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: fs }}>Notification</div>
          {showDesc && <div style={{ fontSize: Math.max(fs - 2, 10), opacity: 0.8 }}>Toast message.</div>}
        </div>
        {showClose && <span style={{ fontSize: fs, opacity: 0.5, flexShrink: 0 }}>✕</span>}
      </div>
    );
  }
  if (comp.id === 'checkbox') {
    const d = size?.fixedSize ?? 18;
    const checked = variant === 'primary';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: d, height: d, borderRadius: br, backgroundColor: checked ? style.backgroundColor : '#fff', border: `2px solid ${checked ? style.backgroundColor : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: d * 0.6, fontWeight: 700 }}>{checked ? '✓' : ''}</div>
        <span style={{ fontSize: fs, color: '#1e293b' }}>Label</span>
      </div>
    );
  }
  if (comp.id === 'tabs') {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', gap: variant === 'pill' ? 4 : 0, borderBottom: variant === 'line' ? '2px solid #e2e8f0' : 'none', backgroundColor: variant === 'pill' ? '#f1f5f9' : 'transparent', borderRadius: variant === 'pill' ? 8 : 0, padding: variant === 'pill' ? 4 : 0 }}>
          {['Tab 1', 'Tab 2', 'Tab 3'].map((t, i) => {
            const active = i === 0;
            return (
              <div key={t} style={{ padding: `6px ${px}px`, fontSize: fs, fontWeight: active ? 600 : 400, color: active ? (variant === 'pill' ? style.textColor : style.backgroundColor) : '#64748b', backgroundColor: active && variant === 'pill' ? style.backgroundColor : 'transparent', borderRadius: variant === 'pill' ? 6 : 0, borderBottom: active && variant === 'line' ? `2px solid ${style.backgroundColor}` : 'none', marginBottom: active && variant === 'line' ? -2 : 0 }}>{t}</div>
            );
          })}
        </div>
      </div>
    );
  }
  return <div style={{ ...base, minWidth: 100, justifyContent: 'center' }}>{comp.name}</div>;
}

// ===== Style fields =====
type StyleField = { key: keyof VariantStyle; label: string; type: 'color' | 'range'; min?: number; max?: number; step?: number };

const STYLE_FIELDS: StyleField[] = [
  { key: 'backgroundColor', label: '背景色',   type: 'color' },
  { key: 'textColor',       label: 'テキスト色', type: 'color' },
  { key: 'borderColor',     label: 'ボーダー色', type: 'color' },
  { key: 'borderWidth',     label: 'ボーダー幅', type: 'range', min: 0, max: 4,   step: 0.5 },
  { key: 'borderRadius',    label: '角丸',       type: 'range', min: 0, max: 32,  step: 1 },
  { key: 'fontWeight',      label: 'ウェイト',   type: 'range', min: 100, max: 900, step: 100 },
  { key: 'shadowBlur',      label: 'シャドウ',   type: 'range', min: 0, max: 40,  step: 2 },
];

function rgbToHex(r: number, g: number, b: number): string {
  const h = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function extractPalette(colorData: ColorVariableData | null): { label: string; hex: string }[] {
  if (!colorData) return [];
  return colorData.semantic.variables.map(v => ({
    label: v.name,
    hex: rgbToHex(v.value.r, v.value.g, v.value.b),
  }));
}

// ===== SizeEditor =====

function SizeEditor({ comp, onSizeChange }: { comp: ComponentConfig; onSizeChange: Props['onSizeChange'] }) {
  const isAvatar = comp.id === 'avatar' || comp.id === 'checkbox';
  const fields: { key: keyof SizeConfig; label: string; min: number; max: number }[] = isAvatar
    ? [{ key: 'fixedSize', label: 'サイズ (px)', min: 12, max: 120 }]
    : [
        { key: 'paddingX',     label: 'Padding X', min: 0,  max: 48 },
        { key: 'paddingY',     label: 'Padding Y', min: 0,  max: 24 },
        { key: 'fontSize',     label: 'Font Size', min: 10, max: 24 },
        { key: 'borderRadius', label: '角丸',       min: 0,  max: 32 },
      ];

  return (
    <div className="size-editor">
      <div className="size-table">
        {/* Header */}
        <div className="size-row size-header">
          <div className="size-cell size-name-cell">サイズ</div>
          {fields.map(f => <div key={String(f.key)} className="size-cell">{f.label}</div>)}
        </div>
        {/* Rows */}
        {comp.sizeConfigs.map(size => (
          <div key={size.name} className={`size-row ${size.enabled ? 'enabled' : 'disabled'}`}>
            <div className="size-cell size-name-cell">
              <button
                className={`size-toggle ${size.enabled ? 'on' : 'off'}`}
                onClick={() => onSizeChange(comp.id, size.name, 'enabled', !size.enabled)}
              >
                <span className="size-toggle-dot" />
              </button>
              <span className="size-name-label">{size.name}</span>
            </div>
            {fields.map(f => (
              <div key={String(f.key)} className="size-cell">
                <input
                  type="number"
                  min={f.min} max={f.max}
                  value={Number(size[f.key as keyof SizeConfig] ?? 0)}
                  onChange={e => onSizeChange(comp.id, size.name, f.key, Number(e.target.value))}
                  className="size-input"
                  disabled={!size.enabled}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Property Editor =====

const LAYER_ICONS: Record<string, string> = {
  'icon-left': '◀ Icon', 'icon-right': 'Icon ▶', 'icon-only': '⬡', 'label': 'T',
  'helper-text': 'T↓', 'image': '🖼', 'footer': '▬', 'status-dot': '●',
  'close-btn': '✕', 'description': 'T₂',
};

function PropertyEditor({ comp, onPropertyChange }: { comp: ComponentConfig; onPropertyChange: Props['onPropertyChange'] }) {
  if (comp.componentProperties.length === 0) {
    return <div className="empty-props">このコンポーネントに設定可能なプロパティはありません。</div>;
  }

  return (
    <div className="prop-editor">
      {comp.componentProperties.map(prop => (
        <div key={prop.id} className={`prop-row ${prop.enabled ? 'enabled' : 'disabled'}`}>
          <button
            className={`prop-toggle ${prop.enabled ? 'on' : 'off'}`}
            onClick={() => onPropertyChange(comp.id, prop.id, 'enabled', !prop.enabled)}
            title={prop.enabled ? '無効にする' : '有効にする'}
          >
            <span className="size-toggle-dot" />
          </button>

          <div className="prop-layer-badge">{LAYER_ICONS[prop.layer] ?? prop.layer}</div>

          <div className="prop-info">
            <span className="prop-label">{prop.label}</span>
            <span className="prop-desc">{prop.description}</span>
          </div>

          {prop.type === 'BOOLEAN' && (
            <div className="prop-default">
              <span className="prop-default-label">デフォルト</span>
              <button
                className={`prop-bool-btn ${prop.defaultValue === true ? 'true' : 'false'}`}
                onClick={() => onPropertyChange(comp.id, prop.id, 'defaultValue', !prop.defaultValue)}
                disabled={!prop.enabled}
              >
                {prop.defaultValue ? 'ON' : 'OFF'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ===== Main =====

export default function ComponentPanel({ comp, onStyleChange, onSizeChange, onPropertyChange, onDocChange, onToggle, onAdd, colorData }: Props) {
  const [activeVariant, setActiveVariant] = useState(comp.variants[0] ?? 'default');
  const [detailTab, setDetailTab] = useState<DetailTab>('style');
  const [paletteField, setPaletteField] = useState<keyof VariantStyle | null>(null);

  const style = comp.styleMap[activeVariant] ?? defaultStyle();
  const palette = useMemo(() => extractPalette(colorData), [colorData]);
  const enabledSizes = comp.hasSizes ? comp.sizeConfigs.filter(s => s.enabled) : [];
  const previewSize = enabledSizes[Math.floor(enabledSizes.length / 2)] ?? comp.sizeConfigs[0];

  // When comp changes, reset to first variant
  const prevId = React.useRef(comp.id);
  if (prevId.current !== comp.id) {
    prevId.current = comp.id;
  }

  const handleColorFromPalette = useCallback((hex: string) => {
    if (!paletteField) return;
    onStyleChange(comp.id, activeVariant, paletteField, hex);
    setPaletteField(null);
  }, [paletteField, comp.id, activeVariant, onStyleChange]);

  const variantCount = comp.variants.length;
  const sizeCount = enabledSizes.length;
  const totalNodes = variantCount * (comp.hasSizes ? sizeCount : 1);

  return (
    <div className="panel-pair">
      {/* ===== Detail column ===== */}
      <div className="detail-col">
        <div className="panel-header">
          <div className="panel-title">
            <div
              className={`comp-toggle-check ${comp.selected ? 'checked' : ''}`}
              onClick={() => onToggle(comp.id)}
            />
            <div>
              <div className="panel-name">{comp.name}</div>
              <div className="panel-sub">
                {variantCount}バリアント
                {comp.hasSizes && ` · ${sizeCount}サイズ`}
                {` · ${totalNodes}ノード`}
              </div>
            </div>
          </div>
          <button className="btn btn-add" onClick={() => onAdd(comp)} disabled={!comp.selected}>
            追加
          </button>
        </div>

        {/* Variant selector */}
        <div className="variant-selector-bar">
          {comp.variants.map(v => (
            <button
              key={v}
              className={`variant-pill ${activeVariant === v ? 'active' : ''}`}
              style={activeVariant === v ? { borderColor: style.backgroundColor, color: style.backgroundColor } : {}}
              onClick={() => setActiveVariant(v)}
            >
              <div className="vp-dot" style={{ backgroundColor: comp.styleMap[v]?.backgroundColor ?? '#ccc' }} />
              {v}
            </button>
          ))}
        </div>

        {/* Detail tabs */}
        <div className="detail-tabs">
          <button className={`detail-tab ${detailTab === 'style' ? 'active' : ''}`} onClick={() => setDetailTab('style')}>
            スタイル
          </button>
          {comp.hasSizes && (
            <button className={`detail-tab ${detailTab === 'sizes' ? 'active' : ''}`} onClick={() => setDetailTab('sizes')}>
              サイズ<span className="detail-tab-badge">{sizeCount}</span>
            </button>
          )}
          {comp.componentProperties.length > 0 && (
            <button className={`detail-tab ${detailTab === 'properties' ? 'active' : ''}`} onClick={() => setDetailTab('properties')}>
              プロパティ
              <span className="detail-tab-badge">{comp.componentProperties.filter(p => p.enabled).length}</span>
            </button>
          )}
          <button className={`detail-tab ${detailTab === 'doc' ? 'active' : ''}`} onClick={() => setDetailTab('doc')}>
            ドキュメント
          </button>
        </div>

        <div className="detail-body">
          {detailTab === 'style' && (
            <div className="field-group">
              <div className="style-fields-grid">
                {STYLE_FIELDS.map(field => (
                  <div key={field.key} className="sf-row">
                    <span className="sf-label">{field.label}</span>
                    {field.type === 'color' ? (
                      <div className="sf-color-wrap">
                        <input
                          type="color"
                          value={String(style[field.key]).startsWith('rgba') || String(style[field.key]) === 'transparent' ? '#888888' : String(style[field.key])}
                          onChange={e => onStyleChange(comp.id, activeVariant, field.key, e.target.value)}
                          className="sf-cp"
                        />
                        <input
                          type="text"
                          value={String(style[field.key])}
                          onChange={e => onStyleChange(comp.id, activeVariant, field.key, e.target.value)}
                          className="sf-ct"
                        />
                        {palette.length > 0 && (
                          <button className="sf-palette-btn" onClick={() => setPaletteField(field.key)} title="パレットから選択">⬡</button>
                        )}
                      </div>
                    ) : (
                      <div className="sf-range-wrap">
                        <input
                          type="range"
                          min={field.min} max={field.max} step={field.step}
                          value={Number(style[field.key])}
                          onChange={e => onStyleChange(comp.id, activeVariant, field.key, Number(e.target.value))}
                          className="sf-range"
                        />
                        <span className="sf-val">{Number(style[field.key])}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {detailTab === 'sizes' && comp.hasSizes && (
            <SizeEditor comp={comp} onSizeChange={onSizeChange} />
          )}

          {detailTab === 'properties' && (
            <PropertyEditor comp={comp} onPropertyChange={onPropertyChange} />
          )}

          {detailTab === 'doc' && (
            <div className="doc-editor">
              <div className="doc-field">
                <label className="doc-label">Definition</label>
                <textarea
                  className="doc-textarea"
                  rows={3}
                  value={comp.definition}
                  onChange={e => onDocChange(comp.id, 'definition', e.target.value)}
                  placeholder="Describe what this component is and what it does."
                />
              </div>
              <div className="doc-field">
                <label className="doc-label">Usage Examples <span className="doc-hint">(one per line)</span></label>
                <textarea
                  className="doc-textarea"
                  rows={4}
                  value={comp.usageExamples}
                  onChange={e => onDocChange(comp.id, 'usageExamples', e.target.value)}
                  placeholder="Submit a form&#10;Open a modal"
                />
              </div>
              <div className="doc-field">
                <label className="doc-label">Usage Conditions <span className="doc-hint">(one per line)</span></label>
                <textarea
                  className="doc-textarea"
                  rows={4}
                  value={comp.usageConditions}
                  onChange={e => onDocChange(comp.id, 'usageConditions', e.target.value)}
                  placeholder="Use when an explicit action is needed&#10;Use instead of a text link"
                />
              </div>
              <div className="doc-field doc-field--do">
                <label className="doc-label doc-label--do">✓ Good <span className="doc-hint">(one per line)</span></label>
                <textarea
                  className="doc-textarea doc-textarea--do"
                  rows={4}
                  value={comp.doExample}
                  onChange={e => onDocChange(comp.id, 'doExample', e.target.value)}
                  placeholder="Use clear, action-oriented labels&#10;Pair an icon with a label"
                />
              </div>
              <div className="doc-field doc-field--dont">
                <label className="doc-label doc-label--dont">✕ Not Good <span className="doc-hint">(one per line)</span></label>
                <textarea
                  className="doc-textarea doc-textarea--dont"
                  rows={4}
                  value={comp.dontExample}
                  onChange={e => onDocChange(comp.id, 'dontExample', e.target.value)}
                  placeholder="Don't use vague labels like OK&#10;Don't place two primary buttons side by side"
                />
              </div>
              <div className="doc-field">
                <label className="doc-label">Accessibility <span className="doc-hint">(one per line)</span></label>
                <textarea
                  className="doc-textarea"
                  rows={4}
                  value={comp.accessibility}
                  onChange={e => onDocChange(comp.id, 'accessibility', e.target.value)}
                  placeholder="Use <button> element, never <div>&#10;Keyboard: Enter / Space to activate"
                />
              </div>
              <div className="doc-field">
                <label className="doc-label">States <span className="doc-hint">(one per line)</span></label>
                <textarea
                  className="doc-textarea"
                  rows={4}
                  value={comp.states}
                  onChange={e => onDocChange(comp.id, 'states', e.target.value)}
                  placeholder="default: base style&#10;hover: darken bg by 8%&#10;focus: 2px outline&#10;disabled: opacity 0.4"
                />
              </div>
              <div className="doc-field">
                <label className="doc-label">Related Components <span className="doc-hint">(one per line)</span></label>
                <textarea
                  className="doc-textarea"
                  rows={3}
                  value={comp.relatedComponents}
                  onChange={e => onDocChange(comp.id, 'relatedComponents', e.target.value)}
                  placeholder="Icon Button — icon-only variant&#10;Link — for navigation actions"
                />
              </div>
            </div>
          )}
        </div>

        {/* Palette picker */}
        {paletteField && (
          <div className="palette-inline">
            <div className="palette-inline-header">
              <span>{paletteField}</span>
              <button onClick={() => setPaletteField(null)}>✕</button>
            </div>
            <div className="palette-inline-list">
              {palette.map((entry, i) => (
                <button key={i} className="pi-entry" onClick={() => handleColorFromPalette(entry.hex)}>
                  <div className="pi-swatch" style={{ backgroundColor: entry.hex }} />
                  <span className="pi-label">{entry.label}</span>
                  <span className="pi-hex">{entry.hex}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== Preview column ===== */}
      <div className="preview-col">
        <div className="preview-header">プレビュー — {activeVariant}</div>
        <div className="preview-body comp-preview-body">

          {/* Main preview (active variant, mid size) */}
          <div className="comp-preview-main">
            <ComponentPreview comp={comp} variant={activeVariant} style={style} size={previewSize} />
          </div>

          {/* Size progression (only if hasSizes) */}
          {comp.hasSizes && enabledSizes.length > 1 && (
            <div className="size-preview-section">
              <div className="cpa-label">サイズ比較</div>
              <div className="size-preview-list">
                {enabledSizes.map(sz => (
                  <div key={sz.name} className="size-preview-row">
                    <span className="spw-label">{sz.name}</span>
                    <div className="spw-comp">
                      <ComponentPreview comp={comp} variant={activeVariant} style={style} size={sz} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All variants grid */}
          <div className="comp-preview-all">
            <div className="cpa-label">全バリアント</div>
            <div className="cpa-grid">
              {comp.variants.map(v => (
                <div
                  key={v}
                  className={`cpa-item ${activeVariant === v ? 'active' : ''}`}
                  onClick={() => setActiveVariant(v)}
                >
                  <div className="cpa-preview">
                    <ComponentPreview comp={comp} variant={v} style={comp.styleMap[v] ?? defaultStyle()} size={previewSize} />
                  </div>
                  <div className="cpa-name">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
