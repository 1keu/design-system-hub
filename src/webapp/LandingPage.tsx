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

/* Intersection Observer for scroll-reveal */
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

const TICKER_ITEMS = [
  'Figma Import', 'AI-Readable Structure', 'Team SSoT',
  'Token Management', 'Variant Gallery', 'Real-time Sync',
  'Color Tokens', 'Typography Scale', 'Do & Don\'t Docs',
  'Component Properties', 'Size Variants', 'Export to Figma',
];

export default function LandingPage({ onEnterApp }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const featuresRef  = useReveal();
  const howRef       = useReveal();
  const ctaRef       = useReveal();

  function openModal()  { setShowModal(true); setSubmitted(false); setEmail(''); setError(''); }
  function closeModal() { setShowModal(false); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = email.trim();
    if (!t || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
      setError('正しいメールアドレスを入力してください');
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
            ウェイティングリストに登録
          </button>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="lp-hero">
        {/* Background grid */}
        <div className="lp-hero-grid" aria-hidden />
        <div className="lp-hero-glow lp-hero-glow--1" aria-hidden />
        <div className="lp-hero-glow lp-hero-glow--2" aria-hidden />

        <div className="lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-badge lp-anim lp-anim--1">
              <span className="lp-badge-dot" />
              Private Beta
            </div>

            <h1 className="lp-h1 lp-anim lp-anim--2">
              デザインシステムを、<br />
              <em className="lp-h1-accent">チーム全員とAI</em><br />
              の言語にする。
            </h1>

            <p className="lp-subhead lp-anim lp-anim--3">
              FigmaのコンポーネントをインポートしUI設計をトークン・バリアント・ドキュメントとして構造化。
              デザイナーも、エンジニアも、AIエージェントも、同じデザインシステムを参照できる。
            </p>

            <div className="lp-hero-actions lp-anim lp-anim--4">
              <button className="lp-btn-primary lp-btn-large" onClick={openModal}>
                始める →
              </button>
              <p className="lp-hero-note">公開時にメールでお知らせします</p>
            </div>
          </div>

          {/* Component gallery mockup */}
          <div className="lp-hero-visual lp-anim lp-anim--3">
            <div className="lp-gallery-mock">
              {/* Browser chrome */}
              <div className="lp-gm-bar">
                <span className="lp-gm-dot" /><span className="lp-gm-dot" /><span className="lp-gm-dot" />
                <span className="lp-gm-url">design-system-hub.app</span>
              </div>

              {/* App header strip */}
              <div className="lp-gm-appbar">
                <span className="lp-gm-logo">◈ Design System Hub</span>
                <div className="lp-gm-tabs">
                  {['Gallery', 'Colors', 'Typography'].map((t, i) => (
                    <span key={t} className={`lp-gm-tab${i === 0 ? ' active' : ''}`}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Gallery body */}
              <div className="lp-gm-body">

                {/* Button section */}
                <div className="lp-gm-section">
                  <div className="lp-gm-section-header">
                    <span className="lp-gm-dot-color" style={{ background: '#2563EB' }} />
                    <span className="lp-gm-section-name">Button</span>
                    <span className="lp-gm-section-tag">Form</span>
                  </div>
                  <div className="lp-gm-variants">
                    {/* Variant chips label row */}
                    <div className="lp-gm-variant-group">
                      <span className="lp-gm-vlabel">primary</span>
                      <div className="lp-gm-comp-row">
                        {['xs','sm','md','lg'].map((s,i) => (
                          <button key={s} className="lp-c-btn lp-c-btn--primary" style={{ padding: `${4+i*3}px ${10+i*4}px`, fontSize: `${10+i}px` }}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div className="lp-gm-variant-group">
                      <span className="lp-gm-vlabel">outline</span>
                      <div className="lp-gm-comp-row">
                        {['xs','sm','md','lg'].map((s,i) => (
                          <button key={s} className="lp-c-btn lp-c-btn--outline" style={{ padding: `${4+i*3}px ${10+i*4}px`, fontSize: `${10+i}px` }}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div className="lp-gm-variant-group">
                      <span className="lp-gm-vlabel">ghost</span>
                      <div className="lp-gm-comp-row">
                        {['xs','sm','md','lg'].map((s,i) => (
                          <button key={s} className="lp-c-btn lp-c-btn--ghost" style={{ padding: `${4+i*3}px ${10+i*4}px`, fontSize: `${10+i}px` }}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div className="lp-gm-variant-group">
                      <span className="lp-gm-vlabel">danger</span>
                      <div className="lp-gm-comp-row">
                        {['xs','sm','md','lg'].map((s,i) => (
                          <button key={s} className="lp-c-btn lp-c-btn--danger" style={{ padding: `${4+i*3}px ${10+i*4}px`, fontSize: `${10+i}px` }}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge section */}
                <div className="lp-gm-section">
                  <div className="lp-gm-section-header">
                    <span className="lp-gm-dot-color" style={{ background: '#22C55E' }} />
                    <span className="lp-gm-section-name">Badge</span>
                    <span className="lp-gm-section-tag">Display</span>
                  </div>
                  <div className="lp-gm-badge-row">
                    <span className="lp-c-badge lp-c-badge--blue">New</span>
                    <span className="lp-c-badge lp-c-badge--green">Stable</span>
                    <span className="lp-c-badge lp-c-badge--amber">Beta</span>
                    <span className="lp-c-badge lp-c-badge--red">Deprecated</span>
                    <span className="lp-c-badge lp-c-badge--grey">Draft</span>
                  </div>
                </div>

                {/* Input section */}
                <div className="lp-gm-section lp-gm-section--last">
                  <div className="lp-gm-section-header">
                    <span className="lp-gm-dot-color" style={{ background: '#F59E0B' }} />
                    <span className="lp-gm-section-name">Input</span>
                    <span className="lp-gm-section-tag">Form</span>
                  </div>
                  <div className="lp-gm-input-row">
                    <div className="lp-c-input-wrap">
                      <span className="lp-c-input-label">default</span>
                      <div className="lp-c-input">Search components...</div>
                    </div>
                    <div className="lp-c-input-wrap">
                      <span className="lp-c-input-label">focus</span>
                      <div className="lp-c-input lp-c-input--focus">design-system-hub</div>
                    </div>
                    <div className="lp-c-input-wrap">
                      <span className="lp-c-input-label">error</span>
                      <div className="lp-c-input lp-c-input--error">Invalid value</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Ticker ===== */}
      <div className="lp-ticker" aria-hidden>
        <div className="lp-ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="lp-ticker-item">
              <span className="lp-ticker-dot">·</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ===== Features ===== */}
      <section className="lp-features">
        <div className="lp-section-inner" ref={featuresRef}>
          <div className="lp-features-header reveal-child">
            <p className="lp-eyebrow">Features</p>
            <h2 className="lp-h2">なぜ Design System Hub か</h2>
          </div>

          <div className="lp-feature-grid">
            {[
              {
                num: '01',
                icon: '⇄',
                title: 'Figmaから直接インポート',
                desc: 'Figmaのコンポーネントセット・変数をそのままインポート。バリアント、サイズ、スタイル情報を引き継いで即座に管理できる。ゼロから定義し直す必要はない。',
                accent: false,
              },
              {
                num: '02',
                icon: '◎',
                title: 'AIが読めるデザインシステム',
                desc: 'APIトークンで接続すれば、AIエージェントがデザインシステムを直接参照して実装できる。Figmaは画像ベースでAIが読めない。HubはトークンとVariantが構造化されたデータとして扱える。',
                accent: true,
              },
              {
                num: '03',
                icon: '⊙',
                title: 'チーム全員のSSoT',
                desc: 'デザイナーだけでなく、PdMもエンジニアもブラウザで同じデザインシステムを参照・確認できる。コンポーネントの定義・使い方・Do&Don\'tを一か所で管理。Storybookを別途立てる必要がなくなる。',
                accent: false,
              },
              {
                num: '04',
                icon: '▣',
                title: 'バリアントをリアルタイムで確認',
                desc: '全コンポーネントを全バリアント・全サイズでギャラリー表示。実装前にコンポーネントの見え方・使い分けをチームで視覚的に確認・共有できる。',
                accent: false,
              },
            ].map((f, i) => (
              <div
                key={f.num}
                className={`lp-feature-card reveal-child${f.accent ? ' lp-feature-card--accent' : ''}`}
                style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}
              >
                <div className="lp-feature-num">{f.num}</div>
                <div className="lp-feature-icon">{f.icon}</div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="lp-how">
        <div className="lp-section-inner" ref={howRef}>
          <div className="reveal-child">
            <p className="lp-eyebrow">How it works</p>
            <h2 className="lp-h2">3ステップで始められる</h2>
          </div>

          <div className="lp-steps">
            {[
              {
                num: '01',
                title: 'FigmaからインポートまたはゼロからUI設計を定義',
                desc: 'Figma Pluginを使ってコンポーネントをインポート、またはWebアプリ上でテンプレートを選んで空の状態から構築。アカウント不要ですぐ使える。',
              },
              {
                num: '02',
                title: 'バリアント・トークン・ドキュメントを整える',
                desc: 'バリアント、サイズ、カラートークン、タイポグラフィ、Do&Don\'tなどをHubで一元管理。FigmaとHubが自動的に同期される。',
              },
              {
                num: '03',
                title: 'チームとAIに共有する',
                desc: 'チームはブラウザで参照。AIエージェントはAPIトークンで接続してデザインシステムを直接参照しながら実装できる。',
              },
            ].map((s, i) => (
              <div
                key={s.num}
                className="lp-step reveal-child"
                style={{ '--reveal-delay': `${i * 120}ms` } as React.CSSProperties}
              >
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-line" aria-hidden />
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA section ===== */}
      <section className="lp-cta-section">
        <div className="lp-section-inner" ref={ctaRef}>
          <div className="lp-cta-inner reveal-child">
            <div className="lp-cta-glow" aria-hidden />
            <p className="lp-eyebrow">Early Access</p>
            <h2 className="lp-cta-heading">
              まずはウェイティングリストへ
            </h2>
            <p className="lp-cta-desc">
              公開時にメールでお知らせします。フィードバックをいただける方も歓迎です。
            </p>
            <button className="lp-btn-primary lp-btn-large" onClick={openModal}>
              ウェイティングリストに登録する
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
          <p className="lp-footer-copy">© 2026 Design System Hub. All rights reserved.</p>
        </div>
      </footer>

      {/* ===== Waitinglist Modal ===== */}
      {showModal && (
        <div className="lp-modal-backdrop" onClick={closeModal}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            {!submitted ? (
              <>
                <div className="lp-modal-header">
                  <h2 className="lp-modal-title">ウェイティングリストに登録</h2>
                  <button className="lp-modal-close" onClick={closeModal} aria-label="閉じる">✕</button>
                </div>
                <p className="lp-modal-desc">
                  公開時にメールでお知らせします。登録後すぐに使えるわけではありません。
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
                  <button className="lp-btn-primary lp-modal-submit" type="submit">
                    登録する
                  </button>
                </form>
              </>
            ) : (
              <div className="lp-modal-success">
                <div className="lp-modal-success-icon">✓</div>
                <h2 className="lp-modal-title">登録完了</h2>
                <p className="lp-modal-desc">ウェイティングリストに登録しました。公開時にご連絡します。</p>
                <button className="lp-btn-primary" onClick={closeModal}>閉じる</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
