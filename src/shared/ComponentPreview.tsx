import React from 'react';
import { ComponentConfig, VariantStyle, SizeConfig, ComponentProperty } from './types';

export function hasLayer(comp: ComponentConfig, layer: ComponentProperty['layer']): boolean {
  return comp.componentProperties.some(p => p.layer === layer && p.enabled && p.defaultValue === true);
}

export function ComponentPreview({ comp, variant, style, size }: {
  comp: ComponentConfig;
  variant: string;
  style: VariantStyle;
  size?: SizeConfig;
}) {
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
    const showLabel = !iconOnly;
    const labelText = showLabel ? variant.charAt(0).toUpperCase() + variant.slice(1) : null;
    return (
      <button style={{ ...base, cursor: 'default' }}>
        {showLeft  && iconBox(style.textColor, fs)}
        {iconOnly  ? iconBox(style.textColor, fs) : labelText}
        {showRight && iconBox(style.textColor, fs)}
      </button>
    );
  }
  if (comp.id === 'input') {
    const isUnder    = variant === 'underlined';
    const showLabel  = hasLayer(comp, 'label');
    const showLeft   = hasLayer(comp, 'icon-left');
    const showRight  = hasLayer(comp, 'icon-right');
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
    const statusIcon: Record<string, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    return (
      <span style={base}>
        {showLeading && iconBox(style.textColor, fs - 1)}
        {(statusIcon[variant] ? `${statusIcon[variant]} ` : '') + variant.charAt(0).toUpperCase() + variant.slice(1)}
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
          AB
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
          <div style={{ width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
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
