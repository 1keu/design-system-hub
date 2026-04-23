export type RGB = { r: number; g: number; b: number };
export type RGBA = RGB & { a: number };

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface PrimitiveColors {
  [colorName: string]: ColorScale;
}

export interface SystemColors {
  primary: { [shade: string]: string };
  secondary: { [shade: string]: string };
  neutral: { [shade: string]: string };
  accent: { [shade: string]: string };
}

export interface SemanticColors {
  success: { DEFAULT: string; light: string; dark: string; bg: string; text: string };
  error: { DEFAULT: string; light: string; dark: string; bg: string; text: string };
  warning: { DEFAULT: string; light: string; dark: string; bg: string; text: string };
  info: { DEFAULT: string; light: string; dark: string; bg: string; text: string };
  'text/primary': string;
  'text/secondary': string;
  'text/disabled': string;
  'text/inverse': string;
  'bg/default': string;
  'bg/subtle': string;
  'bg/overlay': string;
  'border/default': string;
  'border/strong': string;
}

export interface TypographyConfig {
  fontFamily: { sans: string; serif: string; mono: string };
  fontSize: { [key: string]: { size: number; lineHeight: number; letterSpacing: number } };
  fontWeight: { [key: string]: number };
}

export interface VariantStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  fontSize: number;
  fontWeight: number;
  shadowColor: string;
  shadowBlur: number;
}

export type ComponentStyleMap = Record<string, VariantStyle>;

export interface SizeConfig {
  name: string;       // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  enabled: boolean;
  paddingX: number;
  paddingY: number;
  fontSize: number;
  borderRadius: number;
  iconSize?: number;  // avatar / icon-only components
  fixedSize?: number; // avatar diameter
}

export type ComponentPropertyType = 'BOOLEAN' | 'TEXT';
export type ComponentPropertyLayer = 'icon-left' | 'icon-right' | 'icon-only' | 'label' | 'helper-text' | 'image' | 'footer' | 'status-dot' | 'close-btn' | 'description';

export interface ComponentProperty {
  id: string;
  label: string;
  type: ComponentPropertyType;
  defaultValue: boolean | string;
  enabled: boolean;
  layer: ComponentPropertyLayer;
  description: string;
}

export interface ComponentConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  definition: string;
  usageExamples: string;
  usageConditions: string;
  doExample: string;
  dontExample: string;
  accessibility: string;
  states: string;
  relatedComponents: string;
  props: ComponentProp[];
  variants: string[];
  selected: boolean;
  styleMap: ComponentStyleMap;
  hasSizes: boolean;
  sizeConfigs: SizeConfig[];
  componentProperties: ComponentProperty[];
}

export interface ComponentProp {
  name: string;
  type: 'string' | 'boolean' | 'enum' | 'number';
  values?: string[];
  defaultValue?: string | boolean | number;
  required: boolean;
}

export type PluginMessage =
  | { type: 'add-color-variables'; data: ColorVariableData }
  | { type: 'add-typography-variables'; data: TypographyVariableData }
  | { type: 'generate-components'; data: ComponentGenerateData }
  | { type: 'export-md'; data: ExportData }
  | { type: 'export-storybook'; data: ExportData }
  | { type: 'notify'; message: string; error?: boolean }
  | { type: 'close' };

export interface ColorVariableData {
  primitive: { collection: string; variables: VariableEntry[] };
  system: { collection: string; variables: VariableEntry[] };
  semantic: { collection: string; variables: VariableEntry[] };
}

export interface VariableEntry {
  name: string;
  value: RGB;
  description?: string;
}

export interface TypographyVariableData {
  collection: string;
  variables: TypographyVariableEntry[];
}

export interface TypographyVariableEntry {
  name: string;
  value: string | number;
  type: 'STRING' | 'FLOAT';
}

export interface ComponentGenerateData {
  components: ComponentConfig[];
  spacing: number;
  includeVariants: boolean;
}

export interface ExportData {
  colors?: ColorVariableData;
  typography?: TypographyVariableData;
  components?: ComponentConfig[];
}

export interface FigmaExport {
  version: '1.0';
  exportedAt: string;
  source: 'plugin' | 'webapp';
  colors: ColorVariableData | null;
  typography: TypographyVariableData | null;
  components: ComponentConfig[];
}

export interface SyncRecord {
  id: string;
  design_system_id: string;
  colors: ColorVariableData | null;
  typography: TypographyVariableData | null;
  components: ComponentConfig[];
  updated_at: string;
}

// Phase 2: Workspace → Project 3層構造
// User は複数の Workspace に所属できる（フリーランサー・副業想定）

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Workspace {
  id: string;
  name: string;
  slug: string;           // URL-friendly name (例: acme-corp)
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string | null;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectState {
  projectId: string;
  colors: ColorVariableData | null;
  typography: TypographyVariableData | null;
  components: ComponentConfig[];
  updatedAt: string;
}

// Billing
export type Plan = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';

export interface Subscription {
  id: string;
  workspaceId: string;
  plan: Plan;
  status: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

// プランごとの制限値（フロントの制限チェックに使う）
export const PLAN_LIMITS: Record<Plan, { projects: number; members: number; sso: boolean }> = {
  free:       { projects: 1,        members: 3,         sso: false },
  pro:        { projects: Infinity, members: Infinity,  sso: false },
  enterprise: { projects: Infinity, members: Infinity,  sso: true  },
};
