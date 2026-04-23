import React from 'react';
import { SizeConfig } from '../../shared/types';

interface Props {
  compId: string;
  sizeConfigs: SizeConfig[];
  onSizeChange: (sizeName: string, field: keyof SizeConfig, value: number | boolean) => void;
}

export default function ConfigSizesTab({ compId, sizeConfigs, onSizeChange }: Props) {
  const isAvatarLike = compId === 'avatar' || compId === 'checkbox';
  const fields: { key: keyof SizeConfig; label: string; min: number; max: number }[] = isAvatarLike
    ? [{ key: 'fixedSize', label: 'サイズ (px)', min: 12, max: 120 }]
    : [
        { key: 'paddingX',     label: 'Padding X', min: 0,  max: 48 },
        { key: 'paddingY',     label: 'Padding Y', min: 0,  max: 24 },
        { key: 'fontSize',     label: 'Font Size', min: 10, max: 24 },
        { key: 'borderRadius', label: '角丸',       min: 0,  max: 32 },
      ];

  return (
    <div className="cfg-size-table">
      <div className="cfg-size-header">
        <div className="cfg-size-name-cell">サイズ</div>
        {fields.map(f => <div key={String(f.key)} className="cfg-size-cell">{f.label}</div>)}
      </div>
      {sizeConfigs.map(size => (
        <div key={size.name} className={`cfg-size-row ${size.enabled ? '' : 'disabled'}`}>
          <div className="cfg-size-name-cell">
            <button
              className={`cfg-size-toggle ${size.enabled ? 'on' : 'off'}`}
              onClick={() => onSizeChange(size.name, 'enabled', !size.enabled)}
            >
              <span className="cfg-toggle-dot" />
            </button>
            <span>{size.name}</span>
          </div>
          {fields.map(f => (
            <div key={String(f.key)} className="cfg-size-cell">
              <input
                type="number"
                min={f.min} max={f.max}
                value={Number(size[f.key as keyof SizeConfig] ?? 0)}
                onChange={e => onSizeChange(size.name, f.key, Number(e.target.value))}
                className="cfg-size-input"
                disabled={!size.enabled}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
