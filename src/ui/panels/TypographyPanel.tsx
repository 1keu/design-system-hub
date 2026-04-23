import React, { useState, useCallback } from 'react';
import { TypographyInput, generateTypographyVariableData, getSizePreview } from '../utils/typographyGenerator';
import { TypographyVariableData } from '../../shared/types';

interface Props {
  data: TypographyVariableData | null;
  onDataChange: (data: TypographyVariableData) => void;
  onAdd: (data: TypographyVariableData) => void;
}

const SCALE_OPTIONS: { value: TypographyInput['scaleRatio']; label: string; short: string }[] = [
  { value: 'minor-second', label: 'Minor 2nd', short: '×1.067' },
  { value: 'major-second', label: 'Major 2nd', short: '×1.125' },
  { value: 'minor-third', label: 'Minor 3rd', short: '×1.200' },
  { value: 'major-third', label: 'Major 3rd', short: '×1.250' },
  { value: 'perfect-fourth', label: 'Perfect 4th', short: '×1.333' },
  { value: 'golden-ratio', label: 'Golden Ratio', short: '×1.618' },
];

const SANS_FONTS = ['Inter', 'Roboto', 'Open Sans', 'Noto Sans JP', 'Poppins', 'DM Sans', 'Plus Jakarta Sans'];
const SERIF_FONTS = ['Merriweather', 'Playfair Display', 'Lora', 'Noto Serif JP', 'Source Serif 4'];
const MONO_FONTS = ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Roboto Mono'];

const DEFAULT_INPUT: TypographyInput = {
  sansFont: 'Inter',
  serifFont: 'Merriweather',
  monoFont: 'JetBrains Mono',
  baseSize: 16,
  scaleRatio: 'major-third',
};

export default function TypographyPanel({ data, onDataChange, onAdd }: Props) {
  const [input, setInput] = useState<TypographyInput>(DEFAULT_INPUT);

  const update = useCallback(<K extends keyof TypographyInput>(key: K, value: TypographyInput[K]) => {
    setInput(prev => {
      const next = { ...prev, [key]: value };
      onDataChange(generateTypographyVariableData(next));
      return next;
    });
  }, [onDataChange]);

  const currentData = data ?? generateTypographyVariableData(input);
  const preview = getSizePreview(input);

  return (
    <div className="panel-pair">
      {/* Detail column */}
      <div className="detail-col">
        <div className="panel-header">
          <div className="panel-title">
            <span>📐</span>
            <div>
              <div className="panel-name">タイポグラフィ</div>
              <div className="panel-sub">{currentData.variables.length}変数 · 1コレクション</div>
            </div>
          </div>
          <button className="btn btn-add" onClick={() => onAdd(currentData)}>
            Figmaに追加
          </button>
        </div>

        <div className="detail-body">
          <div className="field-group">
            <div className="field-label">フォントファミリー</div>
            <div className="font-fields">
              <div className="font-field">
                <label>Sans</label>
                <select value={input.sansFont} onChange={e => update('sansFont', e.target.value)} className="select-sm">
                  {SANS_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="font-field">
                <label>Serif</label>
                <select value={input.serifFont} onChange={e => update('serifFont', e.target.value)} className="select-sm">
                  {SERIF_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="font-field">
                <label>Mono</label>
                <select value={input.monoFont} onChange={e => update('monoFont', e.target.value)} className="select-sm">
                  {MONO_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="field-group">
            <div className="field-label">ベースサイズ — {input.baseSize}px</div>
            <input
              type="range" min={12} max={20} step={1}
              value={input.baseSize}
              onChange={e => update('baseSize', Number(e.target.value))}
              className="range-full"
            />
          </div>

          <div className="field-group">
            <div className="field-label">スケール比率</div>
            <div className="scale-chips">
              {SCALE_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={`scale-chip ${input.scaleRatio === o.value ? 'active' : ''}`}
                  onClick={() => update('scaleRatio', o.value)}
                >
                  <span>{o.label}</span>
                  <span className="scale-chip-ratio">{o.short}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview column */}
      <div className="preview-col">
        <div className="preview-header">プレビュー</div>
        <div className="preview-body typo-preview-body">
          {preview.map(({ name, size }) => (
            <div key={name} className="typo-prev-row">
              <span className="typo-prev-name">{name}</span>
              <span className="typo-prev-size">{size}px</span>
              <span
                className="typo-prev-sample"
                style={{ fontSize: Math.min(size, 36), fontFamily: input.sansFont, lineHeight: 1 }}
              >
                Aa
              </span>
            </div>
          ))}

          <div className="typo-weight-row">
            {[300, 400, 500, 600, 700].map(w => (
              <div key={w} className="typo-weight-item" style={{ fontWeight: w, fontFamily: input.sansFont }}>
                {w}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
