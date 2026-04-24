import React, { useState, useEffect, useRef } from 'react';
import './landing.css';

interface Props {
  onEnterApp: () => void;
}

const WAITINGLIST_KEY = 'design-system-hub-waitinglist';

function saveEmail(email: string) {
  try {
    const raw = localStorage.getItem(WAITINGLIST_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(email)) list.push(email);
    localStorage.setItem(WAITINGLIST_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const DEMO_BUTTON = {
  name: 'Button', cat: 'Actions',
  tokens: [
    { group: 'Color — primary', items: [
      { key: 'color.bg.primary',       value: '#0C0C11' },
      { key: 'color.text.primary',     value: '#FFFFFF'  },
      { key: 'color.bg.primary.hover', value: '#2A2A38' },
    ]},
    { group: 'Color — outline', items: [
      { key: 'color.bg.outline',     value: 'transparent' },
      { key: 'color.border.outline', value: '#0C0C11'     },
      { key: 'color.text.outline',   value: '#0C0C11'     },
    ]},
    { group: 'Color — ghost', items: [
      { key: 'color.text.ghost',     value: '#9896A8' },
      { key: 'color.bg.ghost.hover', value: '#F4F3F8' },
    ]},
    { group: 'Color — danger', items: [
      { key: 'color.bg.danger',     value: '#FEE2E2' },
      { key: 'color.text.danger',   value: '#991B1B' },
      { key: 'color.border.danger', value: '#FECACA' },
    ]},
    { group: 'Shape', items: [
      { key: 'radius',       value: '4px' },
      { key: 'border.width', value: '1px' },
    ]},
    { group: 'Spacing', items: [
      { key: 'padding.xs', value: '4px 10px'  },
      { key: 'padding.sm', value: '6px 12px'  },
      { key: 'padding.md', value: '8px 16px'  },
      { key: 'padding.lg', value: '10px 20px' },
    ]},
    { group: 'Typography', items: [
      { key: 'font.size.md', value: '13px' },
      { key: 'font.weight',  value: '500'  },
      { key: 'line.height',  value: '1'    },
    ]},
    { group: 'State', items: [
      { key: 'opacity.disabled', value: '0.4'         },
      { key: 'cursor.disabled',  value: 'not-allowed' },
    ]},
  ],
  guideline: 'Use for the primary action on a page. A button communicates that an action will occur when pressed. It should be clear, direct, and predictable.',
  dos: [
    'Use for the primary action on a page',
    'Keep labels short and action-oriented',
    'Pair with a secondary action when needed',
    'Ensure sufficient contrast in all variants',
    'Use loading state for async actions',
  ],
  donts: [
    'Don\'t use more than one primary button per view',
    'Don\'t use for navigation — use links instead',
    'Don\'t disable without showing why',
    'Don\'t use danger variant for standard actions',
    'Don\'t truncate button labels',
  ],
  a11y: 'Ensure the button has a descriptive accessible label. Use aria-disabled instead of disabled when you still need the element focusable.',
};

const SIDEBAR_COMPONENTS = [
  { name: 'Button',    cat: 'Actions', color: '#2563EB', active: true  },
  { name: 'Input',     cat: 'Forms',   color: '#16A34A', active: false },
  { name: 'Badge',     cat: 'Status',  color: '#D97706', active: false },
  { name: 'Modal',     cat: 'Overlay', color: '#9333EA', active: false },
  { name: 'Card',      cat: 'Layout',  color: '#0891B2', active: false },
];

const GALLERY_BUTTON_VARIANTS = [
  { label: 'primary', bg: '#0C0C11',    color: '#fff',     border: 'transparent' },
  { label: 'outline', bg: 'transparent', color: '#0C0C11', border: '#0C0C11'     },
  { label: 'ghost',   bg: 'transparent', color: '#9896A8', border: 'transparent' },
  { label: 'danger',  bg: '#FEE2E2',    color: '#991B1B',  border: '#FECACA'     },
];

const COMPARISON = [
  { feature: 'AI readable',            figma: false, storybook: 'partial' },
  { feature: 'Single source of truth', figma: false, storybook: false     },
  { feature: 'Tokens + docs together', figma: false, storybook: 'partial' },
  { feature: 'Two-way sync',           figma: false, storybook: false     },
  { feature: 'Designer + dev + AI',    figma: false, storybook: 'partial' },
];

const CAPABILITIES = [
  {
    dir: 'Figma → Hub',
    label: 'Import',
    desc: 'Import components from Figma. Variants, tokens, and structure are carried over automatically.',
  },
  {
    dir: 'Code → Hub',
    label: 'Sync',
    desc: 'Sync your system from your codebase via REST API. Keep Hub up to date as your code evolves.',
  },
  {
    dir: 'Hub → Figma',
    label: 'Push',
    desc: 'Push updated definitions back to Figma. Designers always work from the latest source.',
  },
  {
    dir: 'Hub → Code / AI',
    label: 'Consume',
    desc: 'Connect an API token to Cursor, Copilot, or Claude. AI implements directly from your system.',
  },
];

const CREATION = [
  {
    icon: '◻',
    label: 'From scratch',
    desc: 'Build your system in the browser. Choose a template or start blank — no account required.',
  },
  {
    icon: '⬡',
    label: 'From Figma',
    desc: 'Install the Figma Plugin and import existing components. Variants and tokens come over automatically.',
  },
  {
    icon: '{ }',
    label: 'From code',
    desc: 'Push components from your codebase via REST API. Bring your existing system into Hub.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'What is Design System Hub?',
    a: 'Design System Hub is a web app that centralizes your design system — components, tokens, variants, and usage guidelines — in a format both humans and AI tools can read and use.',
  },
  {
    q: 'How is Hub different from Figma Variables?',
    a: 'Figma Variables manage tokens inside Figma. Hub goes further: it stores component structure, variants, guidelines, and Do & Don\'ts alongside your tokens, and exposes everything via API so AI tools and engineers can reference your system directly.',
  },
  {
    q: 'How is Hub different from Storybook?',
    a: 'Storybook documents components in code. Hub sits between design and code — it connects to both Figma and your codebase, keeps them in sync, and provides a structured, machine-readable format that AI agents can consume.',
  },
  {
    q: 'Does it work without Figma?',
    a: 'Yes. You can build your design system entirely in Hub, or import from your codebase via API. Figma integration is optional.',
  },
  {
    q: 'How do I connect Hub to my AI coding tool?',
    a: 'Generate an API token in Hub and add it to your AI tool\'s config (e.g., .cursor/mcp.json for Cursor). The AI can then reference your exact component definitions while implementing.',
  },
  {
    q: 'Will there be a paid plan?',
    a: 'Hub is free during private beta. Team plans with real-time sync and collaboration features are planned for after launch.',
  },
];

export default function LandingPage({ onEnterApp }: Props) {
  const [showModal,   setShowModal]   = useState(false);
  const [email,       setEmail]       = useState('');
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState('');
  const [demoTab,     setDemoTab]     = useState<'preview' | 'tokens' | 'guidelines'>('preview');
  const [prevVariant, setPrevVariant] = useState<'primary' | 'outline' | 'ghost' | 'danger'>('primary');
  const [prevSize,    setPrevSize]    = useState<'xs' | 'sm' | 'md' | 'lg'>('md');
  const [prevDisabled, setPrevDisabled] = useState(false);
  const [prevLoading,  setPrevLoading]  = useState(false);
  const [openFaq,     setOpenFaq]     = useState<number | null>(null);

  const demoRef         = useReveal();
  const comparisonRef   = useReveal();
  const diagramRef      = useReveal();
  const capabilitiesRef = useReveal();
  const creationRef     = useReveal();
  const faqRef          = useReveal();
  const ctaRef          = useReveal();

  function openModal()  { setShowModal(true); setSubmitted(false); setEmail(''); setError(''); }
  function closeModal() { setShowModal(false); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = email.trim();
    if (!t || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
      setError('Enter a valid email address.');
      return;
    }
    saveEmail(t);
    setSubmitted(true);
  }

  return (
    <div className="lp-root">

      {/* ===== Header ===== */}
      <header className="lp-header">
        <div className="lp-header-inner">
          <div className="lp-logo">
            <span className="lp-logo-mark">◈</span>
            <span className="lp-logo-name">Design System Hub</span>
          </div>
          <nav className="lp-nav">
            <a href="#demo"         className="lp-nav-link">Demo</a>
            <a href="#capabilities" className="lp-nav-link">Capabilities</a>
            <a href="#faq"          className="lp-nav-link">FAQ</a>
          </nav>
          <button className="lp-header-cta" onClick={openModal}>Join waitlist</button>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="lp-hero">
        <div className="lp-hero-inner">

          {/* Left: text */}
          <div className="lp-hero-text" style={{ animation: 'lp-fade-up 0.5s ease forwards' }}>
            <p className="lp-overline">PRIVATE BETA — REV.01</p>
            <h1 className="lp-h1">
              Figma and code,<br />
              <em className="lp-h1-em">unified.</em>
            </h1>
            <p className="lp-subhead">
              A design system your AI can read.<br />
              One source of truth for your team and your tools.
            </p>
            <ul className="lp-hero-bullets">
              <li>Tokens, variants, and docs — in one place</li>
              <li>Built for humans and AI</li>
            </ul>
            <div className="lp-hero-actions">
              <button className="lp-btn-primary" onClick={openModal}>Join the waitlist →</button>
              <p className="lp-hero-note">We'll notify you when we launch.</p>
            </div>
          </div>

          {/* Right: product mockup */}
          <div className="lp-hero-mock" style={{ animation: 'lp-fade-up 0.5s 0.12s ease both' }}>
            <div className="lp-product-wrap">
              <span className="lp-corner lp-corner--tl" />
              <span className="lp-corner lp-corner--tr" />
              <span className="lp-corner lp-corner--bl" />
              <span className="lp-corner lp-corner--br" />
              <div className="lp-chrome">
                <div className="lp-chrome-dots">
                  <span className="lp-chrome-dot" style={{ background: '#FC5F58' }} />
                  <span className="lp-chrome-dot" style={{ background: '#FDBC2C' }} />
                  <span className="lp-chrome-dot" style={{ background: '#33C748' }} />
                </div>
                <span className="lp-chrome-url">design-system-hub.app</span>
              </div>
              <div className="lp-product-ui">
                <div className="lp-app-topbar">
                  <span className="lp-app-logo">◈ Design System Hub</span>
                  <div className="lp-app-tabs">
                    {['Gallery', 'Colors', 'Typography'].map((t, i) => (
                      <span key={t} className={`lp-app-tab${i === 0 ? ' active' : ''}`}>{t}</span>
                    ))}
                  </div>
                  <button className="lp-app-add-btn">+ Add component</button>
                </div>
                <div className="lp-app-body">
                  <div className="lp-app-sidebar">
                    <div className="lp-sidebar-group">
                      <p className="lp-sidebar-section-label">COMPONENTS</p>
                      {SIDEBAR_COMPONENTS.map(c => (
                        <div key={c.name} className={`lp-sidebar-item${c.active ? ' active' : ''}`}>
                          <span className="lp-sidebar-dot" style={{ background: c.color }} />
                          <span className="lp-sidebar-name">{c.name}</span>
                          <span className="lp-sidebar-cat">{c.cat}</span>
                        </div>
                      ))}
                    </div>
                    <div className="lp-sidebar-group">
                      <p className="lp-sidebar-section-label">TOKENS</p>
                      <div className="lp-sidebar-item">
                        <span className="lp-sidebar-token-icon">■</span>
                        <span className="lp-sidebar-name">Colors</span>
                      </div>
                      <div className="lp-sidebar-item">
                        <span className="lp-sidebar-token-icon">T</span>
                        <span className="lp-sidebar-name">Typography</span>
                      </div>
                    </div>
                  </div>
                  <div className="lp-app-gallery">
                    <div className="lp-gallery-card">
                      <div className="lp-gallery-card-header">
                        <span className="lp-gallery-dot" style={{ background: '#2563EB' }} />
                        <span className="lp-gallery-comp-name">Button</span>
                        <span className="lp-gallery-comp-cat">Actions</span>
                        <div className="lp-gallery-card-actions">
                          <span className="lp-gallery-action-btn">Edit</span>
                          <span className="lp-gallery-action-btn">Export</span>
                        </div>
                      </div>
                      <div className="lp-gallery-variants">
                        {GALLERY_BUTTON_VARIANTS.map(v => (
                          <div key={v.label} className="lp-gallery-variant-row">
                            <span className="lp-gallery-vlabel">{v.label}</span>
                            <div className="lp-gallery-comp-row">
                              {(['xs','sm','md','lg'] as const).map((s, si) => (
                                <button key={s} className="lp-mock-btn" style={{
                                  background: v.bg, color: v.color, borderColor: v.border,
                                  padding: `${3+si*2}px ${8+si*3}px`, fontSize: `${9+si}px`,
                                }}>{s}</button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===== Demo ===== */}
      <section className="lp-demo-section" id="demo">
        <div className="lp-section-inner" ref={demoRef}>
          <div className="lp-demo-header reveal-child">
            <p className="lp-eyebrow">// DEMO</p>
            <h2 className="lp-h2">See your system in one place.</h2>
            <p className="lp-demo-subhead">Everything stays in sync.</p>
          </div>

          <div className="lp-demo-card reveal-child">
            <div className="lp-chrome">
              <div className="lp-chrome-dots">
                <span className="lp-chrome-dot" style={{ background: '#FC5F58' }} />
                <span className="lp-chrome-dot" style={{ background: '#FDBC2C' }} />
                <span className="lp-chrome-dot" style={{ background: '#33C748' }} />
              </div>
              <span className="lp-chrome-url">design-system-hub.app/components/button</span>
            </div>
            <div className="lp-demo-detail">
              <div className="lp-demo-detail-header">
                <span className="lp-demo-detail-name">{DEMO_BUTTON.name}</span>
                <span className="lp-demo-detail-cat">{DEMO_BUTTON.cat}</span>
              </div>
              <div className="lp-demo-tabs">
                {(['preview', 'tokens', 'guidelines'] as const).map(t => (
                  <button
                    key={t}
                    className={`lp-demo-tab${demoTab === t ? ' active' : ''}`}
                    onClick={() => setDemoTab(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <div className="lp-demo-tab-body" key={demoTab}>

                {demoTab === 'preview' && (
                  <div className="lp-demo-preview">
                    <div className="lp-demo-stage">
                      <button
                        className="lp-demo-live-btn"
                        disabled={prevDisabled}
                        style={{
                          ...({
                            primary: { background: '#0C0C11', color: '#fff',      border: '1px solid transparent' },
                            outline: { background: 'transparent', color: '#0C0C11', border: '1px solid #0C0C11' },
                            ghost:   { background: 'transparent', color: '#9896A8', border: '1px solid transparent' },
                            danger:  { background: '#FEE2E2',     color: '#991B1B', border: '1px solid #FECACA' },
                          } as const)[prevVariant],
                          ...({
                            xs: { padding: '4px 10px',  fontSize: '11px' },
                            sm: { padding: '6px 12px',  fontSize: '12px' },
                            md: { padding: '8px 16px',  fontSize: '13px' },
                            lg: { padding: '10px 20px', fontSize: '14px' },
                          } as const)[prevSize],
                          opacity: prevDisabled ? 0.4 : 1,
                        }}
                      >
                        {prevLoading ? '...' : 'Button'}
                      </button>
                    </div>
                    <div className="lp-demo-controls">
                      <div className="lp-demo-control-row">
                        <span className="lp-demo-control-label">variant</span>
                        <div className="lp-demo-control-options">
                          {(['primary','outline','ghost','danger'] as const).map(v => (
                            <button key={v}
                              className={`lp-demo-option${prevVariant === v ? ' active' : ''}`}
                              onClick={() => setPrevVariant(v)}
                            >{v}</button>
                          ))}
                        </div>
                      </div>
                      <div className="lp-demo-control-row">
                        <span className="lp-demo-control-label">size</span>
                        <div className="lp-demo-control-options">
                          {(['xs','sm','md','lg'] as const).map(s => (
                            <button key={s}
                              className={`lp-demo-option${prevSize === s ? ' active' : ''}`}
                              onClick={() => setPrevSize(s)}
                            >{s}</button>
                          ))}
                        </div>
                      </div>
                      <div className="lp-demo-control-row">
                        <span className="lp-demo-control-label">disabled</span>
                        <button
                          className={`lp-demo-toggle${prevDisabled ? ' active' : ''}`}
                          onClick={() => setPrevDisabled(v => !v)}
                        >
                          <span className="lp-demo-toggle-knob" />
                        </button>
                      </div>
                      <div className="lp-demo-control-row">
                        <span className="lp-demo-control-label">loading</span>
                        <button
                          className={`lp-demo-toggle${prevLoading ? ' active' : ''}`}
                          onClick={() => setPrevLoading(v => !v)}
                        >
                          <span className="lp-demo-toggle-knob" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {demoTab === 'tokens' && (
                  <div className="lp-demo-tokens">
                    {DEMO_BUTTON.tokens.map(g => (
                      <div key={g.group} className="lp-demo-token-group">
                        <p className="lp-demo-token-group-label">{g.group}</p>
                        {g.items.map(item => (
                          <div key={item.key} className="lp-demo-token-row">
                            <span className="lp-demo-token-key">{item.key}</span>
                            <span className="lp-demo-token-value">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {demoTab === 'guidelines' && (
                  <div className="lp-demo-guidelines">
                    <p className="lp-demo-guideline-text">{DEMO_BUTTON.guideline}</p>
                    <div className="lp-demo-dos-donts">
                      <div className="lp-demo-dos">
                        <p className="lp-demo-dos-label">Do</p>
                        <ul className="lp-demo-list">
                          {DEMO_BUTTON.dos.map(d => <li key={d}>{d}</li>)}
                        </ul>
                      </div>
                      <div className="lp-demo-donts">
                        <p className="lp-demo-donts-label">Don't</p>
                        <ul className="lp-demo-list">
                          {DEMO_BUTTON.donts.map(d => <li key={d}>{d}</li>)}
                        </ul>
                      </div>
                    </div>
                    <p className="lp-demo-a11y">{DEMO_BUTTON.a11y}</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Comparison ===== */}
      <section className="lp-comparison">
        <div className="lp-section-inner" ref={comparisonRef}>
          <p className="lp-eyebrow reveal-child">// COMPARISON</p>
          <h2 className="lp-h2 reveal-child">Why not just Figma or Storybook?</h2>
          <div className="lp-comparison-wrap reveal-child">
            <table className="lp-comparison-table">
              <thead>
                <tr>
                  <th className="lp-cmp-th-feature"></th>
                  <th className="lp-cmp-th">Figma</th>
                  <th className="lp-cmp-th">Storybook</th>
                  <th className="lp-cmp-th lp-cmp-th--hub">Hub</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(row => (
                  <tr key={row.feature} className="lp-cmp-row">
                    <td className="lp-cmp-feature">{row.feature}</td>
                    <td className="lp-cmp-cell">
                      <span className={row.figma === false ? 'lp-cmp-no' : 'lp-cmp-partial'}>
                        {row.figma === false ? '✕' : '△'}
                      </span>
                    </td>
                    <td className="lp-cmp-cell">
                      <span className={row.storybook === false ? 'lp-cmp-no' : 'lp-cmp-partial'}>
                        {row.storybook === false ? '✕' : '△'}
                      </span>
                    </td>
                    <td className="lp-cmp-cell lp-cmp-cell--hub">
                      <span className="lp-cmp-yes">✓</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== Diagram ===== */}
      <section className="lp-diagram">
        <div className="lp-section-inner" ref={diagramRef}>
          <p className="lp-eyebrow reveal-child">// ARCHITECTURE</p>
          <h2 className="lp-h2 reveal-child">One source for everything.</h2>
          <p className="lp-diagram-sub reveal-child">Everything flows through a single system.</p>
          <div className="lp-diagram-flow reveal-child">
            <div className="lp-diagram-node">
              <span className="lp-diagram-node-icon">⬡</span>
              <span className="lp-diagram-node-label">Figma</span>
              <span className="lp-diagram-node-desc">Design canvas</span>
            </div>
            <div className="lp-diagram-connector">
              <span className="lp-diagram-arrow">→</span>
              <span className="lp-diagram-arrow">←</span>
            </div>
            <div className="lp-diagram-node lp-diagram-node--hub">
              <span className="lp-diagram-node-icon">◈</span>
              <span className="lp-diagram-node-label">Hub</span>
              <span className="lp-diagram-node-desc">Single source of truth</span>
            </div>
            <div className="lp-diagram-connector">
              <span className="lp-diagram-arrow">→</span>
              <span className="lp-diagram-arrow">←</span>
            </div>
            <div className="lp-diagram-node">
              <span className="lp-diagram-node-icon">✦</span>
              <span className="lp-diagram-node-label">Code / AI</span>
              <span className="lp-diagram-node-desc">Implementation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Capabilities ===== */}
      <section className="lp-capabilities" id="capabilities">
        <div className="lp-section-inner" ref={capabilitiesRef}>
          <p className="lp-eyebrow reveal-child">// CAPABILITIES</p>
          <h2 className="lp-h2 reveal-child">Connect everything.</h2>
          <div className="lp-cap-grid">
            {CAPABILITIES.map((c, i) => (
              <div
                key={c.dir}
                className="lp-cap-card reveal-child"
                style={{ '--reveal-delay': `${i * 60}ms` } as React.CSSProperties}
              >
                <p className="lp-cap-dir">{c.dir}</p>
                <p className="lp-cap-label">{c.label}</p>
                <p className="lp-cap-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Creation ===== */}
      <section className="lp-creation">
        <div className="lp-section-inner" ref={creationRef}>
          <p className="lp-eyebrow reveal-child">// GETTING STARTED</p>
          <h2 className="lp-h2 reveal-child">Start anywhere.</h2>
          <div className="lp-creation-grid">
            {CREATION.map((c, i) => (
              <div
                key={c.label}
                className="lp-creation-card reveal-child"
                style={{ '--reveal-delay': `${i * 60}ms` } as React.CSSProperties}
              >
                <span className="lp-creation-icon">{c.icon}</span>
                <p className="lp-creation-label">{c.label}</p>
                <p className="lp-creation-desc">{c.desc}</p>
              </div>
            ))}
          </div>
          <p className="lp-creation-note reveal-child">New or existing — both work.</p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="lp-faq" id="faq">
        <div className="lp-section-inner" ref={faqRef}>
          <p className="lp-eyebrow reveal-child">// FAQ</p>
          <h2 className="lp-h2 reveal-child">Common questions.</h2>
          <div className="lp-faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="lp-faq-item reveal-child"
                style={{ '--reveal-delay': `${i * 40}ms` } as React.CSSProperties}
              >
                <button
                  className={`lp-faq-q${openFaq === i ? ' open' : ''}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="lp-faq-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="lp-faq-q-text">{item.q}</span>
                  <span className="lp-faq-toggle">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="lp-faq-a">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="lp-cta-section">
        <div className="lp-section-inner" ref={ctaRef}>
          <div className="lp-cta-inner reveal-child">
            <p className="lp-eyebrow">// WAITLIST</p>
            <h2 className="lp-cta-heading">Make your design system readable.</h2>
            <p className="lp-cta-desc">
              A single source of truth for your team and your AI.
            </p>
            <button className="lp-btn-primary" onClick={openModal}>
              Join the waitlist →
            </button>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-logo">
            <span className="lp-logo-mark">◈</span>
            <span className="lp-logo-name">Design System Hub</span>
          </div>
          <p className="lp-footer-copy">© 2026 Design System Hub</p>
        </div>
      </footer>

      {/* ===== Modal ===== */}
      {showModal && (
        <div className="lp-modal-backdrop" onClick={closeModal}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            {!submitted ? (
              <>
                <div className="lp-modal-header">
                  <h2 className="lp-modal-title">Join the waitlist</h2>
                  <button className="lp-modal-close" onClick={closeModal} aria-label="Close">✕</button>
                </div>
                <p className="lp-modal-desc">
                  We'll notify you when we launch. You won't have immediate access after signing up.
                </p>
                <form className="lp-modal-form" onSubmit={handleSubmit}>
                  <input
                    className="lp-modal-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    autoFocus
                  />
                  {error && <p className="lp-modal-error">{error}</p>}
                  <button className="lp-btn-primary lp-modal-submit" type="submit">Sign up</button>
                </form>
              </>
            ) : (
              <div className="lp-modal-success">
                <div className="lp-modal-success-icon">✓</div>
                <h2 className="lp-modal-title">You're on the list.</h2>
                <p className="lp-modal-desc">We'll reach out when we launch.</p>
                <button className="lp-btn-primary" onClick={closeModal}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
