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
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const FEATURES = [
  {
    num: '01',
    title: 'Import directly from Figma',
    desc: 'Use the Figma Plugin to import component sets and variables as-is. Variants, sizes, and style information are carried over so you can start managing them immediately — no need to redefine everything from scratch.',
  },
  {
    num: '02',
    title: 'A design system AI can read',
    desc: 'Connect via API token and AI agents can reference your design system directly to implement components. Figma components appear to AI as images only. Hub exposes tokens and variants as structured, machine-readable data.',
  },
  {
    num: '03',
    title: 'A single source of truth for the whole team',
    desc: 'Designers, PMs, and engineers all reference the same design system in the browser. Manage component definitions, usage guidelines, and Do & Don\'ts in one place. No need to run a separate Storybook.',
  },
  {
    num: '04',
    title: 'Browse every variant in a gallery',
    desc: 'View all components across every variant and size in a gallery layout. Visually confirm and share how components look and when to use each one — before implementation begins.',
  },
];

export default function LandingPage({ onEnterApp }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const featuresRef = useReveal();
  const howRef      = useReveal();
  const ctaRef      = useReveal();

  function openModal()  { setShowModal(true); setSubmitted(false); setEmail(''); setError(''); }
  function closeModal() { setShowModal(false); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = email.trim();
    if (!t || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
      setError('Please enter a valid email address.');
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
          <button className="lp-header-cta" onClick={openModal}>
            Join the waitlist
          </button>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="lp-hero">
        <div className="lp-hero-inner">

          {/* Left: Text */}
          <div className="lp-hero-text">
            <p className="lp-overline">Private Beta</p>

            <h1 className="lp-h1">
              One design system<br />
              for your team<br />
              <em className="lp-h1-em">and your AI.</em>
            </h1>

            <p className="lp-subhead">
              Import Figma components and structure your UI as tokens, variants, and docs.
              Designers, engineers, and AI agents all reference the same design system.
            </p>

            <div className="lp-hero-actions">
              <button className="lp-btn-primary" onClick={openModal}>
                Get started →
              </button>
              <p className="lp-hero-note">We'll notify you by email when we launch.</p>
            </div>
          </div>

          {/* Right: Product mockup */}
          <div className="lp-hero-visual">
            <div className="lp-gallery-mock">
              <div className="lp-gm-bar">
                <span className="lp-gm-dot" /><span className="lp-gm-dot" /><span className="lp-gm-dot" />
                <span className="lp-gm-url">design-system-hub.app</span>
              </div>
              <div className="lp-gm-appbar">
                <span className="lp-gm-logo">◈ Design System Hub</span>
                <div className="lp-gm-tabs">
                  {['Gallery', 'Colors', 'Typography'].map((t, i) => (
                    <span key={t} className={`lp-gm-tab${i === 0 ? ' active' : ''}`}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="lp-gm-body">
                <div className="lp-gm-section">
                  <div className="lp-gm-section-header">
                    <span className="lp-gm-dot-color" style={{ background: '#2563EB' }} />
                    <span className="lp-gm-section-name">Button</span>
                    <span className="lp-gm-section-tag">Form</span>
                  </div>
                  <div className="lp-gm-variants">
                    {(['primary','outline','ghost','danger'] as const).map((v, vi) => (
                      <div key={v} className="lp-gm-variant-group">
                        <span className="lp-gm-vlabel">{v}</span>
                        <div className="lp-gm-comp-row">
                          {['xs','sm','md','lg'].map((s, si) => (
                            <button key={s} className={`lp-c-btn lp-c-btn--${v}`} style={{ padding: `${4+si*3}px ${10+si*4}px`, fontSize: `${10+si}px` }}>{s}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lp-gm-section">
                  <div className="lp-gm-section-header">
                    <span className="lp-gm-dot-color" style={{ background: '#22C55E' }} />
                    <span className="lp-gm-section-name">Badge</span>
                    <span className="lp-gm-section-tag">Display</span>
                  </div>
                  <div className="lp-gm-badge-row">
                    {(['blue','green','amber','red','grey'] as const).map(c => (
                      <span key={c} className={`lp-c-badge lp-c-badge--${c}`}>{c}</span>
                    ))}
                  </div>
                </div>
                <div className="lp-gm-section lp-gm-section--last">
                  <div className="lp-gm-section-header">
                    <span className="lp-gm-dot-color" style={{ background: '#F59E0B' }} />
                    <span className="lp-gm-section-name">Input</span>
                    <span className="lp-gm-section-tag">Form</span>
                  </div>
                  <div className="lp-gm-input-row">
                    {[
                      { label: 'default', mod: '', text: 'Search components...' },
                      { label: 'focus',   mod: 'lp-c-input--focus', text: 'design-system-hub' },
                      { label: 'error',   mod: 'lp-c-input--error', text: 'Invalid value' },
                    ].map(({ label, mod, text }) => (
                      <div key={label} className="lp-c-input-wrap">
                        <span className="lp-c-input-label">{label}</span>
                        <div className={`lp-c-input ${mod}`}>{text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="lp-features">
        <div className="lp-section-inner" ref={featuresRef}>
          <p className="lp-eyebrow reveal-child">Features</p>
          <div className="lp-feature-list">
            {FEATURES.map((f, i) => (
              <div
                key={f.num}
                className="lp-feature-item reveal-child"
                style={{ '--reveal-delay': `${i * 60}ms` } as React.CSSProperties}
              >
                <span className="lp-feature-num">{f.num}</span>
                <div className="lp-feature-body">
                  <h3 className="lp-feature-title">{f.title}</h3>
                  <p className="lp-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="lp-how">
        <div className="lp-section-inner" ref={howRef}>
          <p className="lp-eyebrow reveal-child">How it works</p>
          <h2 className="lp-h2 reveal-child">Up and running in three steps</h2>
          <div className="lp-steps">
            {[
              {
                num: '1',
                title: 'Import from Figma or define from scratch',
                desc: 'Use the Figma Plugin to import components, or pick a template in the web app and build from an empty state.',
              },
              {
                num: '2',
                title: 'Organize variants, tokens, and docs',
                desc: 'Manage variants, sizes, color tokens, typography, and Do & Don\'ts in Hub. Figma and Hub stay in sync automatically.',
              },
              {
                num: '3',
                title: 'Share with your team and AI',
                desc: 'Teams browse in the browser. AI agents connect via API token and reference your design system directly while implementing.',
              },
            ].map((s, i) => (
              <div
                key={s.num}
                className="lp-step reveal-child"
                style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}
              >
                <span className="lp-step-num">{s.num}</span>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="lp-cta-section">
        <div className="lp-section-inner" ref={ctaRef}>
          <div className="lp-cta-inner reveal-child">
            <h2 className="lp-cta-heading">Join the waitlist</h2>
            <p className="lp-cta-desc">
              We'll reach out when we launch. Early feedback is very welcome.
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
                <h2 className="lp-modal-title">You're on the list</h2>
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
