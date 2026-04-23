import React, { useState } from 'react';
import { Session } from '../../shared/supabaseClient';

interface Props {
  supabaseUrl: string;
  supabaseKey: string;
  onAuth: (session: Session) => void;
  onClose: () => void;
}

type Mode = 'login' | 'signup';

export default function AuthModal({ supabaseUrl, supabaseKey, onAuth, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { initSupabase } = await import('../../shared/supabaseClient');
      const sb = initSupabase(supabaseUrl, supabaseKey);

      if (mode === 'signup') {
        const { error: err } = await sb.auth.signUp({ email, password });
        if (err) throw err;
        setSent(true);
      } else {
        const { data, error: err } = await sb.auth.signInWithPassword({ email, password });
        if (err) throw err;
        if (data.session) onAuth(data.session);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-header">
          <h2>{mode === 'login' ? 'ログイン' : 'アカウント作成'}</h2>
          <button className="auth-close" onClick={onClose}>✕</button>
        </div>

        {sent ? (
          <div className="auth-sent">
            <p>確認メールを送信しました。</p>
            <p>メールのリンクをクリックしてアカウントを有効化してください。</p>
            <button className="btn-primary" onClick={onClose}>閉じる</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <div className="auth-field">
              <label>パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="8文字以上"
                required
                minLength={8}
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウント作成'}
            </button>
            <button
              type="button"
              className="auth-switch"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            >
              {mode === 'login' ? 'アカウントを作成する' : 'ログインする'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
