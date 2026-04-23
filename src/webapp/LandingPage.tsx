import React, { useState, useEffect, useRef } from 'react';

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

          {/* Floating UI cards */}
          <div className="lp-hero-visual lp-anim lp-anim--3">
            {/* Main card: Gallery */}
            <div className="lp-card lp-card--main">
              <div className="lp-card-titlebar">
                <span className="lp-card-dot" /><span className="lp-card-dot" /><span className="lp-card-dot" />
                <span className="lp-card-label">Button — Variants</span>
              </div>
              <div className="lp-card-body">
                <div className="lp-card-row">
                  {['primary', 'outline', 'ghost', 'danger'].map(v => (
                    <div key={v} className={`lp-card-chip lp-card-chip--${v}`}>{v}</div>
                  ))}
                </div>
                <div className="lp-card-sizes">
                  {['xs', 'sm', 'md', 'lg'].map((s, i) => (
                    <div key={s} className="lp-card-size-row">
                      <span className="lp-card-size-label">{s}</span>
                      <div className="lp-card-size-bar" style={{ width: `${40 + i * 24}px`, height: `${16 + i * 4}px` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating card: Tokens */}
            <div className="lp-card lp-card--tokens">
              <div className="lp-card-token-title">Color Tokens</div>
              {[
                { name: 'color.accent', hex: '#2563EB', swatch: '#2563EB' },
                { name: 'color.text.1', hex: '#EDEAF4', swatch: '#EDEAF4' },
                { name: 'color.surface.1', hex: '#13131A', swatch: '#13131A' },
              ].map(t => (
                <div key={t.name} className="lp-card-token-row">
                  <span className="lp-card-token-swatch" style={{ background: t.swatch }} />
                  <span className="lp-card-token-name">{t.name}</span>
                  <span className="lp-card-token-hex">{t.hex}</span>
                </div>
              ))}
            </div>

            {/* Floating card: AI status */}
            <div className="lp-card lp-card--ai">
              <div className="lp-card-ai-icon">◎</div>
              <div className="lp-card-ai-text">
                <div className="lp-card-ai-title">AI Connected</div>
                <div className="lp-card-ai-sub">API token active</div>
              </div>
              <div className="lp-card-ai-pulse" />
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
