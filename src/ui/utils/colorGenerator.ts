import { RGB, ColorVariableData } from '../../shared/types';

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const SHADE_LIGHTNESS: { [key: string]: number } = {
  '50': 97,
  '100': 94,
  '200': 86,
  '300': 76,
  '400': 64,
  '500': 52,
  '600': 42,
  '700': 34,
  '800': 26,
  '900': 18,
  '950': 12,
};

export function generateColorScale(hex: string, name: string): { shade: string; hex: string; rgb: RGB }[] {
  const rgb = hexToRgb(hex);
  const [h, s] = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return Object.entries(SHADE_LIGHTNESS).map(([shade, lightness]) => {
    const adjustedS = shade === '50' ? Math.min(s * 0.3, 20) :
                      shade === '100' ? Math.min(s * 0.5, 40) :
                      shade === '950' ? s * 0.6 : s;
    const newRgb = hslToRgb(h, adjustedS, lightness);
    return {
      shade,
      hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
      rgb: newRgb,
    };
  });
}

export interface ColorInput {
  name: string;
  hex: string;
  role: 'primary' | 'secondary' | 'accent' | 'neutral' | 'custom';
}

export function generateColorVariableData(inputs: ColorInput[]): ColorVariableData {
  const primitiveVars: ColorVariableData['primitive']['variables'] = [];
  const systemVars: ColorVariableData['system']['variables'] = [];
  const semanticVars: ColorVariableData['semantic']['variables'] = [];

  const roleMap: { [key: string]: string } = {};

  for (const input of inputs) {
    const scale = generateColorScale(input.hex, input.name);

    for (const { shade, rgb } of scale) {
      primitiveVars.push({
        name: `${input.name}/${shade}`,
        value: rgb,
        description: `Primitive color: ${input.name}-${shade}`,
      });
    }

    if (input.role !== 'custom') {
      roleMap[input.role] = input.name;
      const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
      for (const shade of shades) {
        const found = scale.find(s => s.shade === shade);
        if (found) {
          systemVars.push({
            name: `${input.role}/${shade}`,
            value: found.rgb,
            description: `System color: ${input.role}-${shade} (from ${input.name})`,
          });
        }
      }
    }
  }

  const primaryInput = inputs.find(i => i.role === 'primary');
  const neutralInput = inputs.find(i => i.role === 'neutral');
  const successInput = inputs.find(i => i.name.toLowerCase().includes('green')) ??
                       inputs.find(i => i.role === 'accent');
  const errorInput = inputs.find(i => i.name.toLowerCase().includes('red'));
  const warningInput = inputs.find(i => i.name.toLowerCase().includes('yellow') || i.name.toLowerCase().includes('orange'));
  const infoInput = primaryInput ?? inputs[0];

  const getShade = (input: ColorInput | undefined, shade: string): RGB => {
    if (!input) return hexToRgb('#6366f1');
    const scale = generateColorScale(input.hex, input.name);
    return scale.find(s => s.shade === shade)?.rgb ?? hexToRgb(input.hex);
  };

  const semanticDefs: { name: string; inputFn: () => RGB; description: string }[] = [
    { name: 'success/DEFAULT', inputFn: () => getShade(successInput, '500'), description: 'Success default' },
    { name: 'success/light', inputFn: () => getShade(successInput, '300'), description: 'Success light' },
    { name: 'success/dark', inputFn: () => getShade(successInput, '700'), description: 'Success dark' },
    { name: 'success/bg', inputFn: () => getShade(successInput, '50'), description: 'Success background' },
    { name: 'success/text', inputFn: () => getShade(successInput, '800'), description: 'Success text' },

    { name: 'error/DEFAULT', inputFn: () => getShade(errorInput, '500'), description: 'Error default' },
    { name: 'error/light', inputFn: () => getShade(errorInput, '300'), description: 'Error light' },
    { name: 'error/dark', inputFn: () => getShade(errorInput, '700'), description: 'Error dark' },
    { name: 'error/bg', inputFn: () => getShade(errorInput, '50'), description: 'Error background' },
    { name: 'error/text', inputFn: () => getShade(errorInput, '800'), description: 'Error text' },

    { name: 'warning/DEFAULT', inputFn: () => getShade(warningInput, '500'), description: 'Warning default' },
    { name: 'warning/light', inputFn: () => getShade(warningInput, '300'), description: 'Warning light' },
    { name: 'warning/dark', inputFn: () => getShade(warningInput, '700'), description: 'Warning dark' },
    { name: 'warning/bg', inputFn: () => getShade(warningInput, '50'), description: 'Warning background' },
    { name: 'warning/text', inputFn: () => getShade(warningInput, '800'), description: 'Warning text' },

    { name: 'info/DEFAULT', inputFn: () => getShade(infoInput, '500'), description: 'Info default' },
    { name: 'info/light', inputFn: () => getShade(infoInput, '300'), description: 'Info light' },
    { name: 'info/dark', inputFn: () => getShade(infoInput, '700'), description: 'Info dark' },
    { name: 'info/bg', inputFn: () => getShade(infoInput, '50'), description: 'Info background' },
    { name: 'info/text', inputFn: () => getShade(infoInput, '800'), description: 'Info text' },

    { name: 'text/primary', inputFn: () => getShade(neutralInput, '900'), description: 'Primary text' },
    { name: 'text/secondary', inputFn: () => getShade(neutralInput, '600'), description: 'Secondary text' },
    { name: 'text/disabled', inputFn: () => getShade(neutralInput, '400'), description: 'Disabled text' },
    { name: 'text/inverse', inputFn: () => ({ r: 1, g: 1, b: 1 }), description: 'Inverse text (white)' },

    { name: 'bg/default', inputFn: () => ({ r: 1, g: 1, b: 1 }), description: 'Default background' },
    { name: 'bg/subtle', inputFn: () => getShade(neutralInput, '50'), description: 'Subtle background' },
    { name: 'bg/overlay', inputFn: () => getShade(neutralInput, '100'), description: 'Overlay background' },

    { name: 'border/default', inputFn: () => getShade(neutralInput, '200'), description: 'Default border' },
    { name: 'border/strong', inputFn: () => getShade(neutralInput, '400'), description: 'Strong border' },
  ];

  for (const def of semanticDefs) {
    semanticVars.push({
      name: def.name,
      value: def.inputFn(),
      description: def.description,
    });
  }

  return {
    primitive: { collection: '🎨 Primitive Colors', variables: primitiveVars },
    system: { collection: '🔧 System Colors', variables: systemVars },
    semantic: { collection: '✨ Semantic Colors', variables: semanticVars },
  };
}

export function rgbToHexDisplay(rgb: RGB): string {
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}
