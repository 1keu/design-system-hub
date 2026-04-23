import React from 'react';
import { ComponentProperty } from '../../shared/types';

interface Props {
  properties: ComponentProperty[];
  onChange: (propId: string, field: keyof ComponentProperty, value: boolean | string) => void;
}

const LAYER_ICONS: Record<string, string> = {
  'icon-left': '◀ Icon', 'icon-right': 'Icon ▶', 'icon-only': '⬡', 'label': 'T',
  'helper-text': 'T↓', 'image': '🖼', 'footer': '▬', 'status-dot': '●',
  'close-btn': '✕', 'description': 'T₂',
};

export default function ConfigPropertiesTab({ properties, onChange }: Props) {
  return (
    <div className="cfg-props">
      {properties.map(prop => (
        <div key={prop.id} className={`cfg-prop-row ${prop.enabled ? '' : 'disabled'}`}>
          <button
            className={`cfg-size-toggle ${prop.enabled ? 'on' : 'off'}`}
            onClick={() => onChange(prop.id, 'enabled', !prop.enabled)}
          >
            <span className="cfg-toggle-dot" />
          </button>
          <div className="cfg-prop-badge">{LAYER_ICONS[prop.layer] ?? prop.layer}</div>
          <div className="cfg-prop-info">
            <span className="cfg-prop-label">{prop.label}</span>
            <span className="cfg-prop-desc">{prop.description}</span>
          </div>
          {prop.type === 'BOOLEAN' && (
            <button
              className={`cfg-bool-btn ${prop.defaultValue === true ? 'true' : 'false'}`}
              onClick={() => onChange(prop.id, 'defaultValue', !prop.defaultValue)}
              disabled={!prop.enabled}
            >
              {prop.defaultValue ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
