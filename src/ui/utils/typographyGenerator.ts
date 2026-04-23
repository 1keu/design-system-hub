import { TypographyVariableData } from '../../shared/types';

export interface TypographyInput {
  sansFont: string;
  serifFont: string;
  monoFont: string;
  baseSize: number;
  scaleRatio: 'minor-second' | 'major-second' | 'minor-third' | 'major-third' | 'perfect-fourth' | 'golden-ratio';
}

const SCALE_RATIOS = {
  'minor-second': 1.067,
  'major-second': 1.125,
  'minor-third': 1.2,
  'major-third': 1.25,
  'perfect-fourth': 1.333,
  'golden-ratio': 1.618,
};

const SIZE_STEPS: { name: string; steps: number; lineHeightMultiplier: number }[] = [
  { name: 'xs', steps: -2, lineHeightMultiplier: 1.5 },
  { name: 'sm', steps: -1, lineHeightMultiplier: 1.5 },
  { name: 'base', steps: 0, lineHeightMultiplier: 1.5 },
  { name: 'md', steps: 1, lineHeightMultiplier: 1.4 },
  { name: 'lg', steps: 2, lineHeightMultiplier: 1.35 },
  { name: 'xl', steps: 3, lineHeightMultiplier: 1.3 },
  { name: '2xl', steps: 4, lineHeightMultiplier: 1.25 },
  { name: '3xl', steps: 5, lineHeightMultiplier: 1.2 },
  { name: '4xl', steps: 6, lineHeightMultiplier: 1.15 },
  { name: '5xl', steps: 7, lineHeightMultiplier: 1.1 },
];

export function generateTypographyVariableData(input: TypographyInput): TypographyVariableData {
  const ratio = SCALE_RATIOS[input.scaleRatio];
  const variables: TypographyVariableData['variables'] = [];

  // Font families
  variables.push({ name: 'font/family/sans', value: input.sansFont, type: 'STRING' });
  variables.push({ name: 'font/family/serif', value: input.serifFont, type: 'STRING' });
  variables.push({ name: 'font/family/mono', value: input.monoFont, type: 'STRING' });

  // Font sizes
  for (const step of SIZE_STEPS) {
    const size = Math.round(input.baseSize * Math.pow(ratio, step.steps) * 10) / 10;
    const lineHeight = Math.round(size * step.lineHeightMultiplier * 10) / 10;
    variables.push({ name: `font/size/${step.name}`, value: size, type: 'FLOAT' });
    variables.push({ name: `font/line-height/${step.name}`, value: lineHeight, type: 'FLOAT' });
  }

  // Font weights
  const weights: { name: string; value: number }[] = [
    { name: 'thin', value: 100 },
    { name: 'extralight', value: 200 },
    { name: 'light', value: 300 },
    { name: 'regular', value: 400 },
    { name: 'medium', value: 500 },
    { name: 'semibold', value: 600 },
    { name: 'bold', value: 700 },
    { name: 'extrabold', value: 800 },
    { name: 'black', value: 900 },
  ];

  for (const w of weights) {
    variables.push({ name: `font/weight/${w.name}`, value: w.value, type: 'FLOAT' });
  }

  // Letter spacing
  const letterSpacings: { name: string; value: number }[] = [
    { name: 'tighter', value: -0.05 },
    { name: 'tight', value: -0.025 },
    { name: 'normal', value: 0 },
    { name: 'wide', value: 0.025 },
    { name: 'wider', value: 0.05 },
    { name: 'widest', value: 0.1 },
  ];

  for (const ls of letterSpacings) {
    variables.push({ name: `font/letter-spacing/${ls.name}`, value: ls.value, type: 'FLOAT' });
  }

  // Spacing (as part of typography system)
  const spacingBase = input.baseSize;
  const spacingSteps: { name: string; multiplier: number }[] = [
    { name: '1', multiplier: 0.25 },
    { name: '2', multiplier: 0.5 },
    { name: '3', multiplier: 0.75 },
    { name: '4', multiplier: 1 },
    { name: '5', multiplier: 1.25 },
    { name: '6', multiplier: 1.5 },
    { name: '8', multiplier: 2 },
    { name: '10', multiplier: 2.5 },
    { name: '12', multiplier: 3 },
    { name: '16', multiplier: 4 },
    { name: '20', multiplier: 5 },
    { name: '24', multiplier: 6 },
  ];

  for (const sp of spacingSteps) {
    variables.push({
      name: `spacing/${sp.name}`,
      value: Math.round(spacingBase * sp.multiplier * 10) / 10,
      type: 'FLOAT',
    });
  }

  return { collection: '📐 Typography & Spacing', variables };
}

export function getSizePreview(input: TypographyInput): { name: string; size: number }[] {
  const ratio = SCALE_RATIOS[input.scaleRatio];
  return SIZE_STEPS.map(step => ({
    name: step.name,
    size: Math.round(input.baseSize * Math.pow(ratio, step.steps) * 10) / 10,
  }));
}
