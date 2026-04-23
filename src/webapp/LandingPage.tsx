import React, { useState } from 'react';

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

export default function LandingPage({ onEnterApp }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  function openModal() { setShowModal(true); setSubmitted(false); setEmail(''); setError(''); }
  function closeModal() { setShowModal(false); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('正しいメールアドレスを入力してください');
      return;
    }
    saveEmail(trimmed);
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
        <div className="lp-hero-inner">
          <div className="lp-badge">Currently in private beta</div>
          <h1 className="lp-h1">
            デザインシステムを、<br />チーム全員の言語に。
          </h1>
          <p className="lp-subhead">
            FigmaのコンポーネントをインポートしUI設計をトークン・バリアント・ドキュメントとして構造化。<br />
            デザイナーも、エンジニアも、AIも、同じデザインシステムを参照できる。
          </p>
          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={openModal}>
              始める →
            </button>
            <p className="lp-hero-note">まずはウェイティングリストへ。公開時にお知らせします。</p>
          </div>
        </div>

        {/* Hero visual */}
        <div className="lp-hero-visual">
          <div className="lp-mockup">
            <div className="lp-mockup-bar">
              <span className="lp-mockup-dot" />
              <span className="lp-mockup-dot" />
              <span className="lp-mockup-dot" />
              <span className="lp-mockup-url">design-system-hub.app</span>
            </div>
            <div className="lp-mockup-body">
              <div className="lp-mockup-sidebar">
                {['Button', 'Input', 'Badge', 'Avatar', 'Modal'].map(name => (
                  <div key={name} className={`lp-mockup-item${name === 'Button' ? ' active' : ''}`}>{name}</div>
                ))}
              </div>
              <div className="lp-mockup-content">
                <div className="lp-mockup-title">Button</div>
                <div className="lp-mockup-variants">
                  {['primary', 'secondary', 'danger', 'ghost'].map(v => (
                    <div key={v} className={`lp-mockup-chip lp-mockup-chip--${v}`}>{v}</div>
                  ))}
                </div>
                <div className="lp-mockup-tokens">
                  <div className="lp-mockup-token"><span className="lp-token-swatch" style={{ background: '#2563EB' }} />color.accent</div>
                  <div className="lp-mockup-token"><span className="lp-token-swatch" style={{ background: '#EDEAF4' }} />color.text.1</div>
                  <div className="lp-mockup-token"><span className="lp-token-swatch lp-token-swatch--radius" />radius.sm — 4px</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="lp-features">
        <div className="lp-section-inner">
          <p className="lp-section-eyebrow">Features</p>
          <h2 className="lp-h2">なぜ Design System Hub か</h2>

          <div className="lp-feature-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-icon">⇄</div>
              <h3 className="lp-feature-title">Figmaから直接インポート</h3>
              <p className="lp-feature-desc">
                Figmaのコンポーネントセット・変数をそのままインポート。バリアント、サイズ、スタイル情報を引き継いで即座に管理できる。ゼロから定義し直す必要はない。
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">◎</div>
              <h3 className="lp-feature-title">AIが読めるデザインシステム</h3>
              <p className="lp-feature-desc">
                APIトークンで接続すれば、AIエージェントがデザインシステムを直接参照して実装できる。Figmaは画像ベースでAIが読めない。このHubはトークン・バリアント・プロパティが構造化されたデータとして扱える。
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">⊙</div>
              <h3 className="lp-feature-title">チーム全員のSSoT</h3>
              <p className="lp-feature-desc">
                デザイナーだけでなく、PdMもエンジニアもブラウザで同じデザインシステムを参照・ドキュメント確認できる。Storybookを別途立てる必要がなく、コンポーネントの定義・使い方・Do&Don'tを一か所で管理。
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon">▣</div>
              <h3 className="lp-feature-title">バリアントをリアルタイムで確認</h3>
              <p className="lp-feature-desc">
                全コンポーネントを全バリアント・全サイズでギャラリー表示。実装前にコンポーネントの見え方・使い分けをチームで視覚的に確認・共有できる。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="lp-how">
        <div className="lp-section-inner">
          <p className="lp-section-eyebrow">How it works</p>
          <h2 className="lp-h2">3ステップで始められる</h2>

          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">01</div>
              <h3 className="lp-step-title">FigmaからインポートまたはゼロからUI設計を定義</h3>
              <p className="lp-step-desc">
                Figma Pluginを使ってコンポーネントをインポート、またはWebアプリ上でテンプレートを選んで空の状態から構築。アカウント不要ですぐ使える。
              </p>
            </div>
            <div className="lp-step-arrow">→</div>
            <div className="lp-step">
              <div className="lp-step-num">02</div>
              <h3 className="lp-step-title">バリアント・トークン・ドキュメントを整える</h3>
              <p className="lp-step-desc">
                バリアント、サイズ、カラートークン、タイポグラフィ、Do&Don'tなどをHubで一元管理。FigmaとHubが自動的に同期される。
              </p>
            </div>
            <div className="lp-step-arrow">→</div>
            <div className="lp-step">
              <div className="lp-step-num">03</div>
              <h3 className="lp-step-title">チームとAIに共有する</h3>
              <p className="lp-step-desc">
                チームはブラウザで参照。AIエージェントはAPIトークンで接続してデザインシステムを直接参照しながら実装できる。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA section ===== */}
      <section className="lp-cta-section">
        <div className="lp-section-inner lp-cta-inner">
          <h2 className="lp-h2">まずはウェイティングリストへ</h2>
          <p className="lp-cta-desc">
            公開時にメールでお知らせします。フィードバックをいただける方も歓迎です。
          </p>
          <button className="lp-btn-primary lp-btn-large" onClick={openModal}>
            ウェイティングリストに登録する
          </button>
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
                  公開時にメールでお知らせします。<br />登録後に使えるようになるわけではありません。
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
                <p className="lp-modal-desc">ウェイティングリストに登録しました。<br />公開時にご連絡します。</p>
                <button className="lp-btn-primary" onClick={closeModal}>閉じる</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
