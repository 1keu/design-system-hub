import React from 'react';
import { VariantStyle } from '../../shared/types';

interface Props {
  style: VariantStyle;
  onChange: (field: keyof VariantStyle, value: string | number) => void;
}

const STYLE_FIELDS: { key: keyof VariantStyle; label: string; type: 'color' | 'range'; min?: number; max?: number; step?: number }[] = [
  { key: 'backgroundColor', label: '背景色',   type: 'color' },
  { key: 'textColor',       label: 'テキスト色', type: 'color' },
  { key: 'borderColor',     label: 'ボーダー色', type: 'color' },
  { key: 'borderWidth',     label: 'ボーダー幅', type: 'range', min: 0, max: 4,   step: 0.5 },
  { key: 'borderRadius',    label: '角丸',       type: 'range', min: 0, max: 32,  step: 1 },
  { key: 'fontWeight',      label: 'ウェイト',   type: 'range', min: 100, max: 900, step: 100 },
  { key: 'shadowBlur',      label: 'シャドウ',   type: 'range', min: 0, max: 40,  step: 2 },
];

export default function ConfigStyleTab({ style, onChange }: Props) {
  return (
    <div className="cfg-style-fields">
      {STYLE_FIELDS.map(field => (
        <div key={field.key} className="cfg-sf-row">
          <span className="cfg-sf-label">{field.label}</span>
          {field.type === 'color' ? (
            <div className="cfg-sf-color-wrap">
              <input
                type="color"
                value={
                  String(style[field.key]).startsWith('rgba') || String(style[field.key]) === 'transparent'
                    ? '#888888'
                    : String(style[field.key])
                }
                onChange={e => onChange(field.key, e.target.value)}
                className="cfg-sf-cp"
              />
              <input
                type="text"
                value={String(style[field.key])}
                onChange={e => onChange(field.key, e.target.value)}
                className="cfg-sf-ct"
              />
            </div>
          ) : (
            <div className="cfg-sf-range-wrap">
              <input
                type="range"
                min={field.min} max={field.max} step={field.step}
                value={Number(style[field.key])}
                onChange={e => onChange(field.key, Number(e.target.value))}
                className="cfg-sf-range"
              />
              <span className="cfg-sf-val">{Number(style[field.key])}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
