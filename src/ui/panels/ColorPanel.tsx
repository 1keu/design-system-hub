import React, { useState, useCallback } from 'react';
import { ColorInput, generateColorVariableData, generateColorScale, rgbToHexDisplay } from '../utils/colorGenerator';
import { ColorVariableData } from '../../shared/types';

interface Props {
  data: ColorVariableData | null;
  onDataChange: (data: ColorVariableData) => void;
  onAdd: (data: ColorVariableData) => void;
}

const PRESETS: { name: string; colors: ColorInput[] }[] = [
  {
    name: 'Indigo',
    colors: [
      { name: 'indigo', hex: '#6366f1', role: 'primary' },
      { name: 'violet', hex: '#8b5cf6', role: 'secondary' },
      { name: 'cyan', hex: '#06b6d4', role: 'accent' },
      { name: 'slate', hex: '#64748b', role: 'neutral' },
      { name: 'green', hex: '#22c55e', role: 'custom' },
      { name: 'red', hex: '#ef4444', role: 'custom' },
      { name: 'amber', hex: '#f59e0b', role: 'custom' },
    ],
  },
  {
    name: 'Blue',
    colors: [
      { name: 'blue', hex: '#3b82f6', role: 'primary' },
      { name: 'sky', hex: '#0ea5e9', role: 'secondary' },
      { name: 'rose', hex: '#f43f5e', role: 'accent' },
      { name: 'gray', hex: '#6b7280', role: 'neutral' },
      { name: 'green', hex: '#16a34a', role: 'custom' },
      { name: 'red', hex: '#dc2626', role: 'custom' },
      { name: 'yellow', hex: '#ca8a04', role: 'custom' },
    ],
  },
  {
    name: 'Purple',
    colors: [
      { name: 'purple', hex: '#a855f7', role: 'primary' },
      { name: 'pink', hex: '#ec4899', role: 'secondary' },
      { name: 'orange', hex: '#f97316', role: 'accent' },
      { name: 'zinc', hex: '#71717a', role: 'neutral' },
      { name: 'emerald', hex: '#10b981', role: 'custom' },
      { name: 'red', hex: '#f87171', role: 'custom' },
      { name: 'yellow', hex: '#fbbf24', role: 'custom' },
    ],
  },
  {
    name: 'Teal',
    colors: [
      { name: 'teal', hex: '#14b8a6', role: 'primary' },
      { name: 'cyan', hex: '#22d3ee', role: 'secondary' },
      { name: 'amber', hex: '#f59e0b', role: 'accent' },
      { name: 'stone', hex: '#78716c', role: 'neutral' },
      { name: 'green', hex: '#4ade80', role: 'custom' },
      { name: 'red', hex: '#f87171', role: 'custom' },
      { name: 'yellow', hex: '#facc15', role: 'custom' },
    ],
  },
];

const ROLES = ['primary', 'secondary', 'accent', 'neutral', 'custom'] as const;
const ROLE_LABELS: Record<string, string> = { primary: 'Primary', secondary: 'Secondary', accent: 'Accent', neutral: 'Neutral', custom: 'Custom' };

const DEFAULT_COLORS = PRESETS[0].colors;

export default function ColorPanel({ data, onDataChange, onAdd }: Props) {
  const [colors, setColors] = useState<ColorInput[]>(DEFAULT_COLORS);
  const [activePreset, setActivePreset] = useState('Indigo');
  const [expanded, setExpanded] = useState(false);

  const generate = useCallback((cols: ColorInput[]) => {
    const d = generateColorVariableData(cols);
    onDataChange(d);
    return d;
  }, [onDataChange]);

  const applyPreset = useCallback((preset: typeof PRESETS[0]) => {
    setColors(preset.colors);
    setActivePreset(preset.name);
    generate(preset.colors);
  }, [generate]);

  const updateColor = useCallback((index: number, field: keyof ColorInput, value: string) => {
    setColors(prev => {
      const next = prev.map((c, i) => i === index ? { ...c, [field]: value } : c);
      generate(next);
      return next;
    });
    setActivePreset('');
  }, [generate]);

  const addColor = useCallback(() => {
    setColors(prev => {
      const next = [...prev, { name: `color${prev.length + 1}`, hex: '#6366f1', role: 'custom' as const }];
      generate(next);
      return next;
    });
  }, [generate]);

  const removeColor = useCallback((index: number) => {
    setColors(prev => {
      const next = prev.filter((_, i) => i !== index);
      generate(next);
      return next;
    });
  }, [generate]);

  const currentData = data ?? generate(colors);
  const totalVars = currentData.primitive.variables.length + currentData.system.variables.length + currentData.semantic.variables.length;

  return (
    <div className="panel-pair">
      {/* Detail column */}
      <div className="detail-col">
        <div className="panel-header">
          <div className="panel-title">
            <span>🎨</span>
            <div>
              <div className="panel-name">カラーシステム</div>
              <div className="panel-sub">{totalVars}変数 · 3コレクション</div>
            </div>
          </div>
          <button className="btn btn-add" onClick={() => onAdd(currentData)}>
            Figmaに追加
          </button>
        </div>

        <div className="detail-body">
          {/* Presets */}
          <div className="field-group">
            <div className="field-label">プリセット</div>
            <div className="preset-row">
              {PRESETS.map(p => (
                <button
                  key={p.name}
                  className={`preset-chip ${activePreset === p.name ? 'active' : ''}`}
                  onClick={() => applyPreset(p)}
                >
                  <div className="preset-dots">
                    {p.colors.slice(0, 4).map((c, i) => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: c.hex }} />
                    ))}
                  </div>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom colors toggle */}
          <button className="expand-toggle" onClick={() => setExpanded(e => !e)}>
            <span>{expanded ? '▾' : '▸'}</span>
            カスタムカラーを編集
          </button>

          {expanded && (
            <div className="field-group">
              <div className="color-edit-list">
                {colors.map((color, i) => (
                  <div key={i} className="color-edit-row">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={e => updateColor(i, 'hex', e.target.value)}
                      className="cp-swatch"
                    />
                    <input
                      type="text"
                      value={color.name}
                      onChange={e => updateColor(i, 'name', e.target.value)}
                      className="cp-name"
                      placeholder="name"
                    />
                    <select
                      value={color.role}
                      onChange={e => updateColor(i, 'role', e.target.value)}
                      className="cp-role"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                    <button className="cp-remove" onClick={() => removeColor(i)}>×</button>
                  </div>
                ))}
              </div>
              <button className="btn-text-add" onClick={addColor}>＋ カラーを追加</button>
            </div>
          )}

          {/* What will be generated */}
          <div className="gen-summary">
            <div className="gen-item">
              <span className="gen-dot" style={{ backgroundColor: '#6366f1' }} />
              <span>Primitive — {currentData.primitive.variables.length}変数</span>
            </div>
            <div className="gen-item">
              <span className="gen-dot" style={{ backgroundColor: '#8b5cf6' }} />
              <span>System — {currentData.system.variables.length}変数</span>
            </div>
            <div className="gen-item">
              <span className="gen-dot" style={{ backgroundColor: '#06b6d4' }} />
              <span>Semantic — {currentData.semantic.variables.length}変数</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview column */}
      <div className="preview-col">
        <div className="preview-header">プレビュー</div>
        <div className="preview-body color-preview-body">
          {colors.map(color => {
            const scale = generateColorScale(color.hex, color.name);
            return (
              <div key={color.name} className="color-preview-row">
                <div className="cp-row-name">{color.name}</div>
                <div className="cp-row-scale">
                  {scale.map(({ shade, hex }) => (
                    <div
                      key={shade}
                      className="cp-scale-cell"
                      style={{ backgroundColor: hex }}
                      title={`${color.name}-${shade}: ${hex}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <div className="semantic-preview">
            <div className="sp-label">Semantic</div>
            <div className="sp-grid">
              {[
                { label: 'success', bg: '#dcfce7', text: '#166534' },
                { label: 'error', bg: '#fee2e2', text: '#991b1b' },
                { label: 'warning', bg: '#fef9c3', text: '#854d0e' },
                { label: 'info', bg: '#dbeafe', text: '#1e40af' },
              ].map(s => (
                <div key={s.label} className="sp-chip" style={{ backgroundColor: s.bg, color: s.text }}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
