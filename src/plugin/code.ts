import { PluginMessage, VariableEntry, TypographyVariableEntry, ComponentConfig, VariantStyle, SizeConfig, ComponentProperty } from '../shared/types';

figma.showUI(__html__, { width: 780, height: 640, title: 'Design System Generator' });

figma.ui.onmessage = async (msg: PluginMessage) => {
  try {
    switch (msg.type) {
      case 'add-color-variables':
        await addColorVariables(msg.data);
        figma.ui.postMessage({ type: 'notify', message: 'カラー変数を追加しました！' });
        break;
      case 'add-typography-variables':
        await addTypographyVariables(msg.data);
        figma.ui.postMessage({ type: 'notify', message: 'タイポグラフィ変数を追加しました！' });
        break;
      case 'generate-components':
        await generateComponents(msg.data.components, msg.data.spacing);
        figma.ui.postMessage({ type: 'notify', message: 'コンポーネントを生成しました！' });
        break;
      case 'get-selection':
        figma.ui.postMessage({ type: 'selection-info', data: getSelectionInfo() });
        break;
      case 'close':
        figma.closePlugin();
        break;
    }
  } catch (e) {
    const err = e as Error;
    figma.ui.postMessage({ type: 'notify', message: `エラー: ${err.message}`, error: true });
  }
};

function getSelectionInfo() {
  return figma.currentPage.selection.map(node => {
    const variants:  Record<string, string[]> = {};
    const booleans:  Record<string, boolean>  = {};
    const texts:     Record<string, string>   = {};

    if (node.type === 'COMPONENT_SET' || node.type === 'COMPONENT') {
      const defs = (node as ComponentSetNode | ComponentNode).componentPropertyDefinitions ?? {};
      for (const [key, def] of Object.entries(defs)) {
        if (def.type === 'VARIANT')  variants[key] = (def as { type: 'VARIANT'; variantOptions: string[] }).variantOptions ?? [];
        if (def.type === 'BOOLEAN')  booleans[key] = (def as { type: 'BOOLEAN'; defaultValue: boolean }).defaultValue;
        if (def.type === 'TEXT')     texts[key]    = String((def as { type: 'TEXT'; defaultValue: string }).defaultValue ?? '');
      }
    }

    return {
      nodeType:    node.type,
      name:        node.name,
      description: (node as SceneNode & { description?: string }).description ?? '',
      variants,
      booleans,
      texts,
      childCount:  'children' in node ? (node as ChildrenMixin).children.length : 0,
    };
  });
}

// ===== Variables =====

async function getOrCreateCollection(name: string): Promise<VariableCollection> {
  const found = figma.variables.getLocalVariableCollections().find(c => c.name === name);
  return found ?? figma.variables.createVariableCollection(name);
}

async function addColorVariables(data: {
  primitive: { collection: string; variables: VariableEntry[] };
  system:    { collection: string; variables: VariableEntry[] };
  semantic:  { collection: string; variables: VariableEntry[] };
}) {
  for (const group of [data.primitive, data.system, data.semantic]) {
    const col = await getOrCreateCollection(group.collection);
    const modeId = col.defaultModeId;
    for (const entry of group.variables) {
      const existing = figma.variables.getLocalVariables('COLOR')
        .find(v => v.name === entry.name && v.variableCollectionId === col.id);
      const variable = existing ?? figma.variables.createVariable(entry.name, col, 'COLOR');
      variable.setValueForMode(modeId, entry.value);
      if (entry.description) variable.description = entry.description;
    }
  }
}

async function addTypographyVariables(data: { collection: string; variables: TypographyVariableEntry[] }) {
  const col = await getOrCreateCollection(data.collection);
  const modeId = col.defaultModeId;
  for (const entry of data.variables) {
    const t = entry.type === 'FLOAT' ? 'FLOAT' : 'STRING';
    const existing = figma.variables.getLocalVariables(t)
      .find(v => v.name === entry.name && v.variableCollectionId === col.id);
    const variable = existing ?? figma.variables.createVariable(entry.name, col, t);
    variable.setValueForMode(modeId, entry.value);
  }
}

// ===== Color utils =====

function hexToRgb(hex: string): RGB {
  const c = hex.replace('#', '');
  if (c.length !== 6) return { r: 0.5, g: 0.5, b: 0.5 };
  return { r: parseInt(c.slice(0,2),16)/255, g: parseInt(c.slice(2,4),16)/255, b: parseInt(c.slice(4,6),16)/255 };
}

function parseColor(v: string): RGB {
  if (v === 'transparent') return { r: 1, g: 1, b: 1 };
  if (v.startsWith('#')) return hexToRgb(v);
  const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) return { r: +m[1]/255, g: +m[2]/255, b: +m[3]/255 };
  return { r: 0.5, g: 0.5, b: 0.5 };
}

function parseAlpha(v: string): number {
  if (v === 'transparent') return 0;
  const m = v.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
  return m ? parseFloat(m[1]) : 1;
}

function fontStyleForWeight(w: number): string {
  if (w >= 700) return 'Bold';
  if (w >= 600) return 'Semi Bold';
  if (w >= 500) return 'Medium';
  return 'Regular';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function loadFonts() {
  await Promise.all([
    figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Medium' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Bold' }),
  ]);
}

// ===== Layer name constants (used to find layers after combineAsVariants) =====

const LAYER_NAME: Record<ComponentProperty['layer'], string> = {
  'icon-left':   'Left Icon',
  'icon-right':  'Right Icon',
  'icon-only':   'Icon Only',
  'label':       'Label',
  'helper-text': 'Helper Text',
  'image':       'Image',
  'footer':      'Footer',
  'status-dot':  'Status Dot',
  'close-btn':   'Close Button',
  'description': 'Description',
};

// ===== Phase 1: Build visual component node =====
// Creates all layers with consistent names. No component properties yet.

async function buildComponentVisual(
  comp: ComponentConfig,
  variant: string,
  style: VariantStyle,
  size: SizeConfig,
  variantName: string,
): Promise<ComponentNode> {
  const node = figma.createComponent();
  node.name = variantName;

  const textColor = parseColor(style.textColor);
  const isFixed = size.fixedSize != null;
  const fs = size.fontSize;

  // ---- Layout ----
  if (isFixed) {
    const d = size.fixedSize!;
    node.resize(d, d);
    node.layoutMode = 'NONE';
  } else {
    node.layoutMode = 'HORIZONTAL';
    node.primaryAxisAlignItems = 'CENTER';
    node.counterAxisAlignItems = 'CENTER';
    node.primaryAxisSizingMode = 'AUTO';
    node.counterAxisSizingMode = 'AUTO';
    node.itemSpacing = 6;
    node.paddingLeft   = size.paddingX;
    node.paddingRight  = size.paddingX;
    node.paddingTop    = size.paddingY;
    node.paddingBottom = size.paddingY;
  }

  // ---- Border radius ----
  if (comp.id === 'avatar' && variant === 'circle') {
    node.cornerRadius = 9999;
  } else if (comp.id === 'avatar' && variant === 'rounded') {
    node.cornerRadius = (size.fixedSize ?? 40) * 0.2;
  } else {
    node.cornerRadius = size.borderRadius;
  }

  // ---- Background ----
  const bgAlpha = parseAlpha(style.backgroundColor);
  node.fills = bgAlpha === 0 ? [] : [{ type: 'SOLID', color: parseColor(style.backgroundColor), opacity: bgAlpha }];

  // ---- Border ----
  if (style.borderWidth > 0 && style.borderColor !== 'transparent') {
    node.strokes = [{ type: 'SOLID', color: parseColor(style.borderColor) }];
    node.strokeWeight = style.borderWidth;
    node.strokeAlign = 'INSIDE';
  }

  // ---- Shadow ----
  if (style.shadowBlur > 0 && style.shadowColor !== 'transparent') {
    const sc = parseColor(style.shadowColor);
    const sa = parseAlpha(style.shadowColor);
    node.effects = [{
      type: 'DROP_SHADOW',
      color: { ...sc, a: sa > 0 ? sa : 0.2 },
      offset: { x: 0, y: 4 },
      radius: style.shadowBlur,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL',
    }];
  }

  const enabledLayers = comp.componentProperties
    .filter(p => p.enabled)
    .map(p => p.layer);

  // ---- Children for non-fixed components ----
  if (!isFixed) {
    // Left Icon
    if (enabledLayers.includes('icon-left')) {
      const icon = figma.createFrame();
      icon.name = LAYER_NAME['icon-left'];
      icon.resize(fs, fs);
      icon.cornerRadius = 3;
      icon.fills = [{ type: 'SOLID', color: textColor, opacity: 0.45 }];
      const prop = comp.componentProperties.find(p => p.layer === 'icon-left')!;
      icon.visible = prop.defaultValue as boolean;
      node.appendChild(icon);
    }

    // Label
    const labelProp = comp.componentProperties.find(p => p.layer === 'label' && p.enabled);
    const iconOnlyProp = comp.componentProperties.find(p => p.layer === 'icon-only' && p.enabled);
    const isIconOnly = iconOnlyProp ? (iconOnlyProp.defaultValue as boolean) : false;

    if (!isIconOnly) {
      const text = figma.createText();
      text.name = LAYER_NAME['label'];
      text.fontName = { family: 'Inter', style: fontStyleForWeight(style.fontWeight) };
      text.characters = comp.id === 'badge' ? capitalize(variant) : comp.name;
      text.fontSize = fs;
      text.fills = [{ type: 'SOLID', color: textColor }];
      if (labelProp) text.visible = labelProp.defaultValue as boolean;
      node.appendChild(text);
    }

    // Icon Only placeholder
    if (iconOnlyProp) {
      const icon = figma.createFrame();
      icon.name = LAYER_NAME['icon-only'];
      icon.resize(fs, fs);
      icon.cornerRadius = 3;
      icon.fills = [{ type: 'SOLID', color: textColor, opacity: 0.45 }];
      icon.visible = iconOnlyProp.defaultValue as boolean;
      node.appendChild(icon);
    }

    // Right Icon
    if (enabledLayers.includes('icon-right')) {
      const icon = figma.createFrame();
      icon.name = LAYER_NAME['icon-right'];
      icon.resize(fs, fs);
      icon.cornerRadius = 3;
      icon.fills = [{ type: 'SOLID', color: textColor, opacity: 0.45 }];
      const prop = comp.componentProperties.find(p => p.layer === 'icon-right')!;
      icon.visible = prop.defaultValue as boolean;
      node.appendChild(icon);
    }

    // Description (Toast)
    if (enabledLayers.includes('description')) {
      const desc = figma.createText();
      desc.name = LAYER_NAME['description'];
      desc.fontName = { family: 'Inter', style: 'Regular' };
      desc.characters = 'Description';
      desc.fontSize = Math.max(fs - 2, 10);
      desc.fills = [{ type: 'SOLID', color: textColor, opacity: 0.7 }];
      const prop = comp.componentProperties.find(p => p.layer === 'description')!;
      desc.visible = prop.defaultValue as boolean;
      node.appendChild(desc);
    }

    // Helper Text (Input)
    if (enabledLayers.includes('helper-text')) {
      const helper = figma.createText();
      helper.name = LAYER_NAME['helper-text'];
      helper.fontName = { family: 'Inter', style: 'Regular' };
      helper.characters = 'Helper text';
      helper.fontSize = Math.max(fs - 3, 9);
      helper.fills = [{ type: 'SOLID', color: textColor, opacity: 0.5 }];
      const prop = comp.componentProperties.find(p => p.layer === 'helper-text')!;
      helper.visible = prop.defaultValue as boolean;
      node.appendChild(helper);
    }

    // Close Button
    if (enabledLayers.includes('close-btn')) {
      const close = figma.createText();
      close.name = LAYER_NAME['close-btn'];
      close.fontName = { family: 'Inter', style: 'Regular' };
      close.characters = '✕';
      close.fontSize = fs - 1;
      close.fills = [{ type: 'SOLID', color: textColor, opacity: 0.45 }];
      const prop = comp.componentProperties.find(p => p.layer === 'close-btn')!;
      close.visible = prop.defaultValue as boolean;
      node.appendChild(close);
    }

  } else {
    // ---- Fixed-size components (avatar, checkbox) ----
    const initials = comp.id === 'avatar' ? 'AB' : (variant === 'primary' ? '✓' : '');
    if (initials) {
      const text = figma.createText();
      text.name = LAYER_NAME['label'];
      text.fontName = { family: 'Inter', style: 'Semi Bold' };
      text.characters = initials;
      text.fontSize = fs;
      text.fills = [{ type: 'SOLID', color: textColor }];
      text.textAlignHorizontal = 'CENTER';
      text.textAlignVertical = 'CENTER';
      const d = size.fixedSize!;
      text.x = (d - text.width) / 2;
      text.y = (d - text.height) / 2;
      node.appendChild(text);
    }

    // Status Dot (Avatar)
    if (enabledLayers.includes('status-dot')) {
      const d = size.fixedSize!;
      const dotSize = Math.max(Math.round(d * 0.25), 6);
      const dot = figma.createEllipse();
      dot.name = LAYER_NAME['status-dot'];
      dot.resize(dotSize, dotSize);
      dot.x = d - dotSize;
      dot.y = d - dotSize;
      dot.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.77, b: 0.37 } }];
      dot.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      dot.strokeWeight = 2;
      const prop = comp.componentProperties.find(p => p.layer === 'status-dot')!;
      dot.visible = prop.defaultValue as boolean;
      node.appendChild(dot);
    }
  }

  return node;
}

// ===== Phase 3: Bind component properties after combineAsVariants =====
// Walk each ComponentNode in the set, find layers by name, attach properties.

function applyComponentProperties(set: ComponentSetNode, comp: ComponentConfig) {
  const enabledProps = comp.componentProperties.filter(p => p.enabled);
  if (enabledProps.length === 0) return;

  // Register each property on the ComponentSet (not on individual variants)
  const propKeyMap: Record<string, string> = {};
  for (const prop of enabledProps) {
    const key = set.addComponentProperty(prop.label, 'BOOLEAN', prop.defaultValue as boolean);
    propKeyMap[prop.layer] = key;
  }

  // Bind each layer in every variant to the corresponding property key
  for (const child of set.children) {
    if (child.type !== 'COMPONENT') continue;
    const compNode = child as ComponentNode;

    for (const prop of enabledProps) {
      const key = propKeyMap[prop.layer];
      if (!key) continue;
      const layerName = LAYER_NAME[prop.layer];
      const layer = compNode.findOne(n => n.name === layerName);
      if (!layer) continue;

      if ('componentPropertyReferences' in layer) {
        (layer as SceneNode & { componentPropertyReferences: Record<string, string> })
          .componentPropertyReferences = { visible: key };
      }
    }
  }
}

// ===== Guideline frame builder =====

async function buildGuidelineFrame(comp: ComponentConfig, set: ComponentSetNode): Promise<FrameNode> {
  const frameWidth = Math.max(set.width + 32, 300);

  const frame = figma.createFrame();
  frame.name = `${comp.name} / Guideline`;
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'FIXED';
  frame.resize(frameWidth, 100);
  frame.itemSpacing = 8;
  frame.paddingLeft = 16;
  frame.paddingRight = 16;
  frame.paddingTop = 16;
  frame.paddingBottom = 16;
  frame.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.98, b: 1.0 } }];
  frame.strokes = [{ type: 'SOLID', color: { r: 0.78, g: 0.86, b: 0.96 } }];
  frame.strokeWeight = 1;
  frame.cornerRadius = 8;

  const dark  = { r: 0.10, g: 0.12, b: 0.22 };
  const muted = { r: 0.40, g: 0.44, b: 0.58 };
  const accent = { r: 0.24, g: 0.40, b: 0.80 };

  function addText(chars: string, bold = false, size = 11, color = dark): TextNode {
    const t = figma.createText();
    t.fontName = { family: 'Inter', style: bold ? 'Bold' : 'Regular' };
    t.characters = chars || ' ';
    t.fontSize = size;
    t.fills = [{ type: 'SOLID', color }];
    t.layoutAlign = 'STRETCH';
    t.textAutoResize = 'HEIGHT';
    frame.appendChild(t);
    return t;
  }

  function addDivider() {
    const d = figma.createFrame();
    d.name = '---';
    d.layoutAlign = 'STRETCH';
    d.resize(frameWidth - 32, 1);
    d.fills = [{ type: 'SOLID', color: { r: 0.82, g: 0.88, b: 0.96 } }];
    frame.appendChild(d);
  }

  // ── Header ──
  addText(comp.name, true, 15, accent);
  addText(`Category: ${comp.category}`, false, 11, muted);
  addText(comp.description, false, 11);

  // ── Variants ──
  addDivider();
  addText('Variants', true, 12);

  // ComponentSet をそのままセクション内に移動
  frame.appendChild(set);

  // ── Definition ──
  if (comp.definition) {
    addDivider();
    addText('Definition', true, 12);
    addText(comp.definition, false, 11);
  }

  // ── Usage Examples ──
  if (comp.usageExamples) {
    addDivider();
    addText('Usage Examples', true, 12);
    for (const line of comp.usageExamples.split('\n').filter(l => l.trim())) {
      addText(`  • ${line.trim()}`, false, 11, muted);
    }
  }

  // ── Usage Conditions ──
  if (comp.usageConditions) {
    addDivider();
    addText('Usage Conditions', true, 12);
    for (const line of comp.usageConditions.split('\n').filter(l => l.trim())) {
      addText(`  • ${line.trim()}`, false, 11, muted);
    }
  }

  // ── Good / Not Good ──
  const green = { r: 0.09, g: 0.64, b: 0.37 };
  const red   = { r: 0.87, g: 0.15, b: 0.15 };

  if (comp.doExample || comp.dontExample) {
    addDivider();
    addText('Do & Don\'t', true, 12);
  }

  if (comp.doExample) {
    addText('✓  Good', true, 11, green);
    for (const line of comp.doExample.split('\n').filter(l => l.trim())) {
      addText(`  ${line.trim()}`, false, 11, green);
    }
  }

  if (comp.dontExample) {
    addText('✕  Not Good', true, 11, red);
    for (const line of comp.dontExample.split('\n').filter(l => l.trim())) {
      addText(`  ${line.trim()}`, false, 11, red);
    }
  }

  // ── Accessibility ──
  if (comp.accessibility) {
    addDivider();
    addText('Accessibility', true, 12);
    for (const line of comp.accessibility.split('\n').filter(l => l.trim())) {
      addText(`  • ${line.trim()}`, false, 11, muted);
    }
  }

  // ── States ──
  if (comp.states) {
    addDivider();
    addText('States', true, 12);
    for (const line of comp.states.split('\n').filter(l => l.trim())) {
      const [key, ...rest] = line.split(':');
      const val = rest.join(':').trim();
      addText(val ? `  ${key.trim()}: ${val}` : `  ${key.trim()}`, false, 11, muted);
    }
  }

  // ── Related Components ──
  if (comp.relatedComponents) {
    addDivider();
    addText('Related Components', true, 12);
    for (const line of comp.relatedComponents.split('\n').filter(l => l.trim())) {
      addText(`  • ${line.trim()}`, false, 11, muted);
    }
  }

  // ── Sizes ──
  if (comp.hasSizes) {
    addDivider();
    addText('Sizes', true, 12);
    for (const sz of comp.sizeConfigs.filter(s => s.enabled)) {
      const detail = sz.fixedSize != null
        ? `fixed=${sz.fixedSize}px`
        : `px=${sz.paddingX}/${sz.paddingY}  fs=${sz.fontSize}  radius=${sz.borderRadius}`;
      addText(`  • ${sz.name}: ${detail}`, false, 10, muted);
    }
  }

  // ── Component Properties ──
  const enabledProps = comp.componentProperties.filter(p => p.enabled);
  if (enabledProps.length > 0) {
    addDivider();
    addText('Component Properties', true, 12);
    for (const p of enabledProps) {
      const def = p.type === 'BOOLEAN' ? (p.defaultValue ? 'ON' : 'OFF') : String(p.defaultValue);
      addText(`  • ${p.label}  [${p.layer}]  default:${def}`, false, 10, muted);
      if (p.description) addText(`    ${p.description}`, false, 10, muted);
    }
  }

  // ── Props ──
  if (comp.props.length > 0) {
    addDivider();
    addText('Props', true, 12);
    for (const p of comp.props) {
      const typeStr = p.values ? p.values.join(' | ') : p.type;
      const req = p.required ? '  *required' : '';
      const def = p.defaultValue !== undefined ? `  default=${p.defaultValue}` : '';
      addText(`  • ${p.name}  (${typeStr})${req}${def}`, false, 10, muted);
    }
  }

  return frame;
}

// ===== Main generator =====

async function generateComponents(components: ComponentConfig[], spacing: number) {
  await loadFonts();
  const page = figma.currentPage;
  const created: SceneNode[] = [];
  let x = 0;

  for (const comp of components.filter(c => c.selected)) {
    const sizes = comp.hasSizes
      ? comp.sizeConfigs.filter(s => s.enabled)
      : [{ name: 'default', enabled: true, paddingX: 16, paddingY: 8, fontSize: 14, borderRadius: 8 } as SizeConfig];

    if (sizes.length === 0) continue;

    // Phase 1: Build visual nodes
    const nodes: ComponentNode[] = [];
    const multiSize = comp.hasSizes && sizes.length > 1;

    for (const variant of comp.variants) {
      const style = comp.styleMap[variant];
      if (!style) continue;
      for (const size of sizes) {
        // Variant name format: "Variant=Primary, Size=MD"
        const variantPart = `Variant=${capitalize(variant)}`;
        const sizePart = multiSize ? `, Size=${size.name.toUpperCase()}` : '';
        const name = variantPart + sizePart;
        const node = await buildComponentVisual(comp, variant, style, size, name);
        page.appendChild(node);
        nodes.push(node);
      }
    }

    if (nodes.length === 0) continue;

    // Phase 2: Combine as variants → always creates a ComponentSet
    let set: ComponentSetNode;
    try {
      set = figma.combineAsVariants(nodes, page);
    } catch (e) {
      nodes.forEach(n => { try { n.remove(); } catch (_) {} });
      throw new Error(`combineAsVariants失敗 (${comp.name}): ${(e as Error).message}`);
    }
    set.name = comp.name;

    // Phase 3: Bind component properties (boolean toggles for icons, labels, etc.)
    try {
      applyComponentProperties(set, comp);
    } catch (e) {
      // Properties failed but ComponentSet exists — log and continue
      figma.notify(`プロパティ設定スキップ (${comp.name}): ${(e as Error).message}`, { error: true });
    }

    // Phase 4: Style the ComponentSet frame
    set.layoutMode            = 'HORIZONTAL';
    set.layoutWrap            = 'WRAP';
    set.primaryAxisSizingMode = 'AUTO';
    set.counterAxisSizingMode = 'AUTO';
    set.primaryAxisAlignItems = 'MIN';
    set.counterAxisAlignItems = 'MIN';
    set.itemSpacing           = 16;
    set.counterAxisSpacing    = 16;
    set.paddingLeft           = 20;
    set.paddingRight          = 20;
    set.paddingTop            = 20;
    set.paddingBottom         = 20;
    set.fills    = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.99 } }];
    set.strokes  = [{ type: 'SOLID', color: { r: 0.86, g: 0.86, b: 0.92 } }];
    set.strokeWeight = 1;
    set.cornerRadius = 12;

    // Phase 5: Build guideline frame — ComponentSet は内部の Variants セクションに移動される
    try {
      const guide = await buildGuidelineFrame(comp, set);
      page.appendChild(guide);
      guide.x = x;
      guide.y = 0;
      created.push(guide);
      x += guide.width + spacing;
    } catch (e) {
      // ガイドライン生成失敗時はフォールバックとして ComponentSet を単独配置
      set.x = x;
      set.y = 0;
      created.push(set);
      x += set.width + spacing;
      figma.notify(`ガイドライン生成スキップ (${comp.name}): ${(e as Error).message}`, { error: true });
    }
  }

  if (created.length > 0) {
    figma.viewport.scrollAndZoomIntoView(created);
  }
}
