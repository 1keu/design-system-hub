import { ComponentConfig, ComponentProperty, ComponentStyleMap, SizeConfig, VariantStyle } from './types';

function defaultStyle(overrides: Partial<VariantStyle> = {}): VariantStyle {
  return { backgroundColor: '#6366f1', textColor: '#ffffff', borderColor: 'transparent', borderWidth: 0, borderRadius: 8, paddingX: 16, paddingY: 8, fontSize: 14, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0, ...overrides };
}

const VARIANT_DEFAULTS: Record<string, Record<string, Partial<VariantStyle>>> = {
  button: {
    primary:   { backgroundColor: '#6366f1', textColor: '#ffffff', borderColor: 'transparent', borderWidth: 0, borderRadius: 8, paddingX: 16, paddingY: 8, fontSize: 14, fontWeight: 600, shadowColor: 'rgba(99,102,241,0.3)', shadowBlur: 8 },
    secondary: { backgroundColor: '#f1f5f9', textColor: '#334155', borderColor: 'transparent', borderWidth: 0, borderRadius: 8, paddingX: 16, paddingY: 8, fontSize: 14, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0 },
    outline:   { backgroundColor: 'transparent', textColor: '#6366f1', borderColor: '#6366f1', borderWidth: 1.5, borderRadius: 8, paddingX: 16, paddingY: 8, fontSize: 14, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0 },
    ghost:     { backgroundColor: 'transparent', textColor: '#6366f1', borderColor: 'transparent', borderWidth: 0, borderRadius: 8, paddingX: 16, paddingY: 8, fontSize: 14, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0 },
    danger:    { backgroundColor: '#ef4444', textColor: '#ffffff', borderColor: 'transparent', borderWidth: 0, borderRadius: 8, paddingX: 16, paddingY: 8, fontSize: 14, fontWeight: 600, shadowColor: 'rgba(239,68,68,0.3)', shadowBlur: 8 },
  },
  input: {
    default:    { backgroundColor: '#ffffff', textColor: '#1e293b', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 8, paddingX: 12, paddingY: 9, fontSize: 14, fontWeight: 400, shadowColor: 'transparent', shadowBlur: 0 },
    filled:     { backgroundColor: '#f1f5f9', textColor: '#1e293b', borderColor: 'transparent', borderWidth: 0, borderRadius: 8, paddingX: 12, paddingY: 9, fontSize: 14, fontWeight: 400, shadowColor: 'transparent', shadowBlur: 0 },
    outlined:   { backgroundColor: '#ffffff', textColor: '#1e293b', borderColor: '#6366f1', borderWidth: 1.5, borderRadius: 8, paddingX: 12, paddingY: 9, fontSize: 14, fontWeight: 400, shadowColor: 'transparent', shadowBlur: 0 },
    underlined: { backgroundColor: 'transparent', textColor: '#1e293b', borderColor: '#6366f1', borderWidth: 0, borderRadius: 0, paddingX: 0, paddingY: 8, fontSize: 14, fontWeight: 400, shadowColor: 'transparent', shadowBlur: 0 },
  },
  badge: {
    default:   { backgroundColor: '#f1f5f9', textColor: '#475569', borderColor: 'transparent', borderWidth: 0, borderRadius: 20, paddingX: 10, paddingY: 3, fontSize: 11, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0 },
    primary:   { backgroundColor: '#eef2ff', textColor: '#4338ca', borderColor: 'transparent', borderWidth: 0, borderRadius: 20, paddingX: 10, paddingY: 3, fontSize: 11, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0 },
    secondary: { backgroundColor: '#f8fafc', textColor: '#64748b', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 20, paddingX: 10, paddingY: 3, fontSize: 11, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0 },
    success:   { backgroundColor: '#dcfce7', textColor: '#166534', borderColor: 'transparent', borderWidth: 0, borderRadius: 20, paddingX: 10, paddingY: 3, fontSize: 11, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0 },
    warning:   { backgroundColor: '#fef9c3', textColor: '#854d0e', borderColor: 'transparent', borderWidth: 0, borderRadius: 20, paddingX: 10, paddingY: 3, fontSize: 11, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0 },
    error:     { backgroundColor: '#fee2e2', textColor: '#991b1b', borderColor: 'transparent', borderWidth: 0, borderRadius: 20, paddingX: 10, paddingY: 3, fontSize: 11, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0 },
    info:      { backgroundColor: '#dbeafe', textColor: '#1e40af', borderColor: 'transparent', borderWidth: 0, borderRadius: 20, paddingX: 10, paddingY: 3, fontSize: 11, fontWeight: 600, shadowColor: 'transparent', shadowBlur: 0 },
  },
  card: {
    elevated:  { backgroundColor: '#ffffff', textColor: '#1e293b', borderColor: 'transparent', borderWidth: 0, borderRadius: 12, paddingX: 20, paddingY: 16, fontSize: 14, fontWeight: 400, shadowColor: 'rgba(0,0,0,0.08)', shadowBlur: 16 },
    outlined:  { backgroundColor: '#ffffff', textColor: '#1e293b', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 12, paddingX: 20, paddingY: 16, fontSize: 14, fontWeight: 400, shadowColor: 'transparent', shadowBlur: 0 },
    filled:    { backgroundColor: '#f8fafc', textColor: '#1e293b', borderColor: 'transparent', borderWidth: 0, borderRadius: 12, paddingX: 20, paddingY: 16, fontSize: 14, fontWeight: 400, shadowColor: 'transparent', shadowBlur: 0 },
  },
};

function buildStyleMap(compId: string, variants: string[]): ComponentStyleMap {
  const defs = VARIANT_DEFAULTS[compId] ?? {};
  return Object.fromEntries(variants.map(v => [v, defaultStyle(defs[v] ?? {})]));
}

export const DEFAULT_SIZES: Record<string, SizeConfig[]> = {
  button: [
    { name: 'xs', enabled: true,  paddingX: 8,  paddingY: 3,  fontSize: 11, borderRadius: 5 },
    { name: 'sm', enabled: true,  paddingX: 12, paddingY: 5,  fontSize: 12, borderRadius: 6 },
    { name: 'md', enabled: true,  paddingX: 16, paddingY: 8,  fontSize: 14, borderRadius: 8 },
    { name: 'lg', enabled: true,  paddingX: 20, paddingY: 10, fontSize: 15, borderRadius: 8 },
    { name: 'xl', enabled: false, paddingX: 24, paddingY: 12, fontSize: 16, borderRadius: 10 },
  ],
  input: [
    { name: 'sm', enabled: true,  paddingX: 10, paddingY: 6,  fontSize: 12, borderRadius: 6 },
    { name: 'md', enabled: true,  paddingX: 12, paddingY: 9,  fontSize: 14, borderRadius: 8 },
    { name: 'lg', enabled: true,  paddingX: 14, paddingY: 11, fontSize: 16, borderRadius: 8 },
  ],
  badge: [
    { name: 'sm', enabled: true,  paddingX: 7,  paddingY: 2,  fontSize: 10, borderRadius: 20 },
    { name: 'md', enabled: true,  paddingX: 10, paddingY: 3,  fontSize: 11, borderRadius: 20 },
    { name: 'lg', enabled: false, paddingX: 12, paddingY: 4,  fontSize: 13, borderRadius: 20 },
  ],
  avatar: [
    { name: 'xs', enabled: true,  paddingX: 0, paddingY: 0, fontSize: 10, borderRadius: 999, fixedSize: 24 },
    { name: 'sm', enabled: true,  paddingX: 0, paddingY: 0, fontSize: 12, borderRadius: 999, fixedSize: 32 },
    { name: 'md', enabled: true,  paddingX: 0, paddingY: 0, fontSize: 15, borderRadius: 999, fixedSize: 40 },
    { name: 'lg', enabled: true,  paddingX: 0, paddingY: 0, fontSize: 18, borderRadius: 999, fixedSize: 48 },
    { name: 'xl', enabled: false, paddingX: 0, paddingY: 0, fontSize: 22, borderRadius: 999, fixedSize: 64 },
    { name: '2xl',enabled: false, paddingX: 0, paddingY: 0, fontSize: 28, borderRadius: 999, fixedSize: 80 },
  ],
  checkbox: [
    { name: 'sm', enabled: true,  paddingX: 0, paddingY: 0, fontSize: 12, borderRadius: 3, fixedSize: 14 },
    { name: 'md', enabled: true,  paddingX: 0, paddingY: 0, fontSize: 14, borderRadius: 4, fixedSize: 18 },
    { name: 'lg', enabled: false, paddingX: 0, paddingY: 0, fontSize: 16, borderRadius: 5, fixedSize: 22 },
  ],
};

const NO_SIZES: SizeConfig[] = [
  { name: 'default', enabled: true, paddingX: 16, paddingY: 8, fontSize: 14, borderRadius: 8 },
];

export function getSizes(id: string): SizeConfig[] {
  return DEFAULT_SIZES[id] ?? NO_SIZES;
}

export const COMP_PROPERTIES: Record<string, ComponentProperty[]> = {
  button: [
    { id: 'leftIcon',   label: '左アイコン',   type: 'BOOLEAN', defaultValue: false, enabled: true,  layer: 'icon-left',   description: 'ボタン左側のアイコン' },
    { id: 'rightIcon',  label: '右アイコン',   type: 'BOOLEAN', defaultValue: false, enabled: true,  layer: 'icon-right',  description: 'ボタン右側のアイコン' },
    { id: 'iconOnly',   label: 'アイコンのみ', type: 'BOOLEAN', defaultValue: false, enabled: true,  layer: 'icon-only',   description: 'テキストを非表示にしアイコンのみ表示' },
    { id: 'showLabel',  label: 'ラベル表示',   type: 'BOOLEAN', defaultValue: true,  enabled: true,  layer: 'label',       description: 'ボタンテキストの表示/非表示' },
  ],
  input: [
    { id: 'showLabel',  label: 'ラベル表示',   type: 'BOOLEAN', defaultValue: true,  enabled: true,  layer: 'label',       description: '入力欄上部のラベルテキスト' },
    { id: 'leftIcon',   label: '左アイコン',   type: 'BOOLEAN', defaultValue: false, enabled: true,  layer: 'icon-left',   description: '入力欄左側のアイコン' },
    { id: 'rightIcon',  label: '右アイコン',   type: 'BOOLEAN', defaultValue: false, enabled: true,  layer: 'icon-right',  description: '入力欄右側のアイコン（クリア等）' },
    { id: 'helperText', label: 'ヘルパーテキスト', type: 'BOOLEAN', defaultValue: false, enabled: true, layer: 'helper-text', description: '入力欄下部の補助テキスト' },
  ],
  badge: [
    { id: 'leadingIcon', label: '先頭アイコン', type: 'BOOLEAN', defaultValue: false, enabled: true, layer: 'icon-left', description: 'バッジ左側のアイコン' },
    { id: 'showLabel',   label: 'ラベル表示',   type: 'BOOLEAN', defaultValue: true,  enabled: true, layer: 'label',     description: 'バッジテキストの表示/非表示' },
  ],
  avatar: [
    { id: 'statusDot', label: 'ステータスドット', type: 'BOOLEAN', defaultValue: false, enabled: true, layer: 'status-dot', description: 'オンライン状態などを示すドット' },
  ],
  card: [
    { id: 'showImage',  label: '画像エリア', type: 'BOOLEAN', defaultValue: true,  enabled: true, layer: 'image',    description: 'カード上部の画像スペース' },
    { id: 'showFooter', label: 'フッター',   type: 'BOOLEAN', defaultValue: false, enabled: true, layer: 'footer',   description: 'カード下部のフッターエリア' },
    { id: 'closeBtn',   label: '閉じるボタン', type: 'BOOLEAN', defaultValue: false, enabled: true, layer: 'close-btn', description: '右上の閉じるボタン' },
  ],
  modal: [
    { id: 'showLabel',  label: 'タイトル表示', type: 'BOOLEAN', defaultValue: true,  enabled: true, layer: 'label',    description: 'モーダルタイトルの表示/非表示' },
    { id: 'closeBtn',   label: '閉じるボタン', type: 'BOOLEAN', defaultValue: true,  enabled: true, layer: 'close-btn', description: '右上の閉じるボタン' },
    { id: 'showFooter', label: 'フッター',     type: 'BOOLEAN', defaultValue: true,  enabled: true, layer: 'footer',   description: 'アクションボタンのフッターエリア' },
  ],
  toast: [
    { id: 'leadingIcon',  label: 'アイコン',    type: 'BOOLEAN', defaultValue: true,  enabled: true, layer: 'icon-left',    description: 'トースト左側のアイコン' },
    { id: 'description',  label: '詳細テキスト', type: 'BOOLEAN', defaultValue: true,  enabled: true, layer: 'description',  description: 'タイトル下の補足テキスト' },
    { id: 'closeBtn',     label: '閉じるボタン', type: 'BOOLEAN', defaultValue: true,  enabled: true, layer: 'close-btn',    description: '右側の閉じるボタン' },
  ],
  checkbox: [
    { id: 'showLabel', label: 'ラベル表示', type: 'BOOLEAN', defaultValue: true, enabled: true, layer: 'label', description: 'チェックボックス横のラベルテキスト' },
  ],
  tabs: [],
};

const COMP_DOCS: Record<string, { definition: string; usageExamples: string; usageConditions: string; doExample: string; dontExample: string; accessibility: string; states: string; relatedComponents: string }> = {
  button: {
    definition: 'An interactive element that triggers a user action. Executes a process on click or tap.',
    usageExamples: 'Submit or cancel a form\nOpen or close a modal or drawer\nDestructive actions such as delete or confirm (danger variant)\nTrigger page navigation',
    usageConditions: 'Use when an explicit, clickable action is required\nReduce visual weight by variant priority: primary > secondary > outline > ghost\nRestrict danger to irreversible operations only\nAlways add a tooltip when showing an icon-only button',
    doExample: 'Use clear, action-oriented labels: "Save", "Delete", "Submit"\nUse primary for the single most important action on the screen\nPair an icon with a label to clarify the action type',
    dontExample: 'Don\'t use vague labels like "Click here" or "OK"\nDon\'t place two primary buttons side by side\nDon\'t use danger for safe or reversible actions',
    accessibility: 'Use <button> element, never <div> or <span>\nKeyboard: Enter / Space to activate\nProvide aria-label for icon-only buttons\nUse aria-disabled="true" to keep button focusable when inactive\nFor loading state, set aria-busy="true"',
    states: 'default: base style\nhover: darken bg by 8%\nfocus: 2px outline, 2px offset, accent color\nactive / pressed: scale 0.97\ndisabled: opacity 0.4, cursor not-allowed\nloading: spinner visible, click blocked',
    relatedComponents: 'Icon Button — icon-only variant for toolbars\nLink — for navigation, not operations\nFAB — primary floating action on mobile',
  },
  input: {
    definition: 'A form control that allows users to enter text. Supports label, placeholder, and validation messaging.',
    usageExamples: 'Name, email, or other basic information entry\nSearch field\nPassword input (combined with type=password)',
    usageConditions: 'Always show a visible label for accessibility\nDisplay error messages via the helper-text slot on validation failure\nRestrict underlined variant to compact search bars or tight spaces',
    doExample: 'Always associate a label with the input\nShow a helper message when the field has specific formatting requirements\nUse the outlined variant to highlight the active focused field',
    dontExample: 'Don\'t hide the label and rely on placeholder text alone\nDon\'t stack helper-text and error messages at the same time\nDon\'t use underlined in a dense form with many fields',
    accessibility: 'Always link label via htmlFor / aria-labelledby\nUse aria-describedby to connect helper-text or error message\nMark required fields with aria-required="true"\nSet aria-invalid="true" on validation failure',
    states: 'default: neutral border\nfocus: accent border + subtle ring shadow\nerror: red border, error message in helper-text\ndisabled: bg-subtle, opacity 0.5, cursor not-allowed\nread-only: no border change, cursor default',
    relatedComponents: 'Textarea — multi-line text input\nSelect — dropdown option picker\nCheckbox — boolean toggle\nSearch Input — specialized with search icon and clear button',
  },
  badge: {
    definition: 'A small label component that displays supplementary information such as status, category, or count.',
    usageExamples: 'Unread count indicator\nStatus display: success, error, warning, info\nTag or category label',
    usageConditions: 'Use as supplementary information, never as a replacement for body text\nMatch the variant to its semantic meaning (success, warning, error, info)\nLimit text to 1–3 words; avoid long strings',
    doExample: 'Use semantic variants: success for positive, error for failures\nKeep badge text concise: "New", "Beta", "3"\nPlace badges adjacent to the element they describe',
    dontExample: 'Don\'t use badge for primary content or headings\nDon\'t place multiple badges of the same variant in a row without context\nDon\'t use long sentences inside a badge',
    accessibility: 'Use role="status" for dynamically updated counts\nDo not rely on color alone — pair with text or icon\nFor count badges, use aria-label: e.g., aria-label="3 unread messages"',
    states: 'Badges are generally static — no interactive states\nFor clickable tag badges: hover and focus styles required',
    relatedComponents: 'Tag — interactive, removable version of Badge\nToast — for temporary status messages\nChip — for filter selection with remove action',
  },
  avatar: {
    definition: 'A visual representation of a user or entity. Displays a profile image, initials, or placeholder.',
    usageExamples: 'User profile image in a header or nav\nPost or comment author indicator\nMember list or participant row',
    usageConditions: 'Fall back to initials when the image cannot be loaded\nUse status-dot to indicate online or active state\nMatch the avatar size to its context: large for profile pages, small for inline lists',
    doExample: 'Always provide an alt text or aria-label for accessibility\nUse status-dot to show presence in real-time collaboration features\nScale down to xs/sm for dense data tables',
    dontExample: 'Don\'t show a broken image icon — always fall back to initials\nDon\'t use avatar as a generic icon placeholder unrelated to a user\nDon\'t mix circle and square variants in the same list',
    accessibility: 'Provide alt attribute for image avatars\nFor decorative avatars set alt=""\nStatus dot: include aria-label for presence (e.g., "Online")',
    states: 'default: image or initials shown\nimage error: fallback to initials\nhover (interactive): subtle overlay or scale\nfocus: 2px outline for keyboard navigation',
    relatedComponents: 'Avatar Group — stacked overlapping avatars\nUser Card — avatar with name and role detail\nStatus Dot — presence indicator used alongside Avatar',
  },
  card: {
    definition: 'A container component that groups related content. Holds an image, title, description, and actions.',
    usageExamples: 'Product or article listing grid\nDashboard widget\nUser profile summary',
    usageConditions: 'One card, one topic — avoid mixing unrelated content\nUse elevated to visually lift the card; use outlined for flat UI surfaces\nRecommend 16:9 or 1:1 aspect ratio for card images',
    doExample: 'Keep card content focused on a single subject\nUse elevated cards on light backgrounds to create hierarchy\nInclude a clear primary action (e.g., "View details") in the footer',
    dontExample: 'Don\'t overload a card with too many actions or data points\nDon\'t use elevated and outlined variants in the same card grid\nDon\'t place cards inside other cards',
    accessibility: 'Use <article> or <section> for semantic grouping\nEnsure all interactive elements inside are keyboard accessible\nProvide a unique, descriptive heading inside each card',
    states: 'default: base style\nhover (clickable card): shadow increase or border highlight\nfocus: 2px outline on the primary interactive element\ndisabled: opacity 0.5, pointer-events none',
    relatedComponents: 'List Item — inline alternative for dense data\nModal — expanded detail view triggered from a card\nBanner — full-width informational container',
  },
  modal: {
    definition: 'An overlay dialog that interrupts the page flow to capture user attention for a confirmation or input.',
    usageExamples: 'Confirmation dialog for delete or submit\nDetail view or expanded content\nInline form input',
    usageConditions: 'Use only when important confirmation or input is required\nAvoid stacking multiple modals\nAllow dismissal via Esc key or overlay click',
    doExample: 'Keep modal content focused on a single task\nAlways include a clear close button\nUse a descriptive title that explains the action required',
    dontExample: 'Don\'t open a modal from another modal\nDon\'t use modals for non-critical notifications — use Toast instead\nDon\'t make modal content scrollable unless absolutely necessary',
    accessibility: 'role="dialog" aria-modal="true"\nTrap focus inside while modal is open\naria-labelledby pointing to the modal title\nClose on Esc key\nReturn focus to trigger element on close',
    states: 'closed: not rendered\nopening: fade-in + scale-up animation\nopen: visible, backdrop active\nclosing: fade-out animation',
    relatedComponents: 'Drawer — slides in from edge, less disruptive\nPopover — lightweight non-blocking overlay\nToast — for non-blocking notifications\nAlert Dialog — for critical destructive confirmations',
  },
  toast: {
    definition: 'A feedback component that temporarily displays the result of an action or a system notification at the edge of the screen.',
    usageExamples: 'Save success or failure notification\nAPI error alert\nAsync process completion notification',
    usageConditions: 'Auto-dismiss after 3–5 seconds as default\nError toasts should require manual dismissal\nLimit simultaneous toasts to 3 at most',
    doExample: 'Keep toast messages short and actionable\nUse success for confirmations and error for failures\nPosition toasts consistently (bottom-right or top-right)',
    dontExample: 'Don\'t use toast for critical errors that require immediate action — use modal instead\nDon\'t auto-dismiss error toasts\nDon\'t display more than 3 toasts at the same time',
    accessibility: 'role="alert" for errors, role="status" for success/info\nAnnounced by screen readers automatically via live region\nDo not place required interactive content inside auto-dismiss toasts',
    states: 'entering: slide in from edge\nvisible: fully opaque\nexiting: fade out\npersistent (error): no auto-dismiss, close button required',
    relatedComponents: 'Modal — for critical confirmations requiring user action\nAlert — inline persistent status message\nSnackbar — similar pattern, typically bottom-center with action button',
  },
  checkbox: {
    definition: 'An input control that allows users to select any number of options from a set.',
    usageExamples: 'Agreement to terms and conditions\nMultiple option selection (e.g., notification settings)\nBulk selection of list items',
    usageConditions: 'Can also be used for a single boolean toggle\nUse instead of a radio button when multiple selections are allowed\nAlways show a label and keep the click target large',
    doExample: 'Group related checkboxes under a clear heading\nPre-check sensible defaults where applicable\nUse indeterminate state for partial parent selection',
    dontExample: 'Don\'t use a checkbox for mutually exclusive options — use radio instead\nDon\'t hide the label and use only an icon\nDon\'t disable without explaining why in the UI',
    accessibility: 'Use <input type="checkbox"> or role="checkbox"\nautomatic aria-checked state management\nGroup with <fieldset> + <legend>\nIndeterminate: aria-checked="mixed"',
    states: 'unchecked: empty box\nchecked: filled with checkmark\nindeterminate: dash / partial fill\nfocus: 2px outline\ndisabled: opacity 0.4, cursor not-allowed',
    relatedComponents: 'Radio — single selection from a group\nSwitch / Toggle — binary on/off control\nCheckbox Group — multiple checkboxes with select-all',
  },
  tabs: {
    definition: 'A navigation component that switches between related content views within the same context.',
    usageExamples: 'Category switching in a settings screen\nSection switching on a detail page\nView switching on a dashboard',
    usageConditions: 'Keep tab count between 2 and 7\nClearly indicate the active tab\nConsider horizontal scrolling on mobile',
    doExample: 'Use short, descriptive labels (1–2 words per tab)\nKeep content within each tab closely related\nHighlight the selected tab with strong visual contrast',
    dontExample: 'Don\'t use tabs when only one section has content\nDon\'t nest tabs inside tabs\nDon\'t use tabs as a substitute for page-level navigation',
    accessibility: 'role="tablist" on container, role="tab" on each tab\nActive tab: aria-selected="true"\nPanel: role="tabpanel", aria-labelledby pointing to its tab\nKeyboard: arrow keys to navigate between tabs',
    states: 'default: unselected\nactive: highlighted indicator\nhover: subtle bg change\nfocus: 2px outline on focused tab\ndisabled: muted, pointer-events none',
    relatedComponents: 'Segmented Control — compact view/filter switcher\nAccordion — vertical alternative for collapsible sections\nStepper — sequential step-by-step navigation',
  },
};

export const INITIAL_COMPONENTS: ComponentConfig[] = [
  { id: 'button',   name: 'Button',   category: 'Actions',     description: 'ボタン',           ...COMP_DOCS.button,   selected: true,  variants: ['primary','secondary','outline','ghost','danger'],                     styleMap: buildStyleMap('button',   ['primary','secondary','outline','ghost','danger']),                    hasSizes: true,  sizeConfigs: getSizes('button'),   componentProperties: COMP_PROPERTIES.button,   props: [] },
  { id: 'input',    name: 'Input',    category: 'Forms',        description: 'テキスト入力',     ...COMP_DOCS.input,    selected: true,  variants: ['default','filled','outlined','underlined'],                           styleMap: buildStyleMap('input',    ['default','filled','outlined','underlined']),                         hasSizes: true,  sizeConfigs: getSizes('input'),    componentProperties: COMP_PROPERTIES.input,    props: [] },
  { id: 'badge',    name: 'Badge',    category: 'Data Display', description: 'バッジ',           ...COMP_DOCS.badge,    selected: true,  variants: ['default','primary','secondary','success','warning','error','info'],    styleMap: buildStyleMap('badge',    ['default','primary','secondary','success','warning','error','info']), hasSizes: true,  sizeConfigs: getSizes('badge'),    componentProperties: COMP_PROPERTIES.badge,    props: [] },
  { id: 'avatar',   name: 'Avatar',   category: 'Data Display', description: 'アバター',         ...COMP_DOCS.avatar,   selected: true,  variants: ['circle','rounded','square'],                                          styleMap: buildStyleMap('avatar',   ['circle','rounded','square']),                                         hasSizes: true,  sizeConfigs: getSizes('avatar'),   componentProperties: COMP_PROPERTIES.avatar,   props: [] },
  { id: 'card',     name: 'Card',     category: 'Layout',       description: 'カード',           ...COMP_DOCS.card,     selected: true,  variants: ['elevated','outlined','filled'],                                       styleMap: buildStyleMap('card',     ['elevated','outlined','filled']),                                       hasSizes: false, sizeConfigs: getSizes('card'),     componentProperties: COMP_PROPERTIES.card,     props: [] },
  { id: 'modal',    name: 'Modal',    category: 'Overlays',     description: 'モーダル',         ...COMP_DOCS.modal,    selected: false, variants: ['default','fullscreen'],                                               styleMap: buildStyleMap('modal',    ['default','fullscreen']),                                               hasSizes: false, sizeConfigs: getSizes('modal'),    componentProperties: COMP_PROPERTIES.modal,    props: [] },
  { id: 'toast',    name: 'Toast',    category: 'Feedback',     description: 'トースト通知',     ...COMP_DOCS.toast,    selected: false, variants: ['success','error','warning','info','default'],                         styleMap: buildStyleMap('toast',    ['success','error','warning','info','default']),                         hasSizes: false, sizeConfigs: getSizes('toast'),    componentProperties: COMP_PROPERTIES.toast,    props: [] },
  { id: 'checkbox', name: 'Checkbox', category: 'Forms',        description: 'チェックボックス', ...COMP_DOCS.checkbox,  selected: false, variants: ['default','primary'],                                                  styleMap: buildStyleMap('checkbox', ['default','primary']),                                                  hasSizes: true,  sizeConfigs: getSizes('checkbox'), componentProperties: COMP_PROPERTIES.checkbox, props: [] },
  { id: 'tabs',     name: 'Tabs',     category: 'Navigation',   description: 'タブ',             ...COMP_DOCS.tabs,     selected: false, variants: ['line','enclosed','pill'],                                             styleMap: buildStyleMap('tabs',     ['line','enclosed','pill']),                                             hasSizes: false, sizeConfigs: getSizes('tabs'),     componentProperties: COMP_PROPERTIES.tabs,     props: [] },
];
