# Product Phases（暫定）

_最終更新: 2026-04-23_

---

## 全体像

```
Web App上で空の状態からデザインシステムを構築できる
        +
Figmaに出力したい場合はPluginでキャンバスに生成できる
        +
アカウントを作ればPdM・エンジニアも含めたチームで同期できる
```

---

## Phase 1 — Web Appでデザインシステムを作れる

**テーマ**: ブラウザだけでデザインシステムを構築・確認・エクスポートできる

### Web App（メイン）

- **空の状態からスタート** — 最初は何もない。「+追加」ボタンで始める
- **テンプレートから選択** — Button / Input / Badge / Avatar / Card / Modal / Toast / Checkbox / Tabs
- **コンポーネント設定** — バリアント / サイズ / プロパティ / ドキュメント
- **Storybookライクなギャラリー** — 追加したコンポーネントを全バリアント・サイズでリアルタイムプレビュー
- **カラートークン設定** — プリミティブ / システム / セマンティック
- **タイポグラフィ設定** — フォント・スケール・スペーシング
- **localStorageで自動保存** — ログインなしでも状態を保持
- **.figma.json エクスポート** — PluginでFigmaに生成するためのファイル
- **Markdown エクスポート** — ドキュメント・仕様のダウンロード

### Plugin（サブ）

- コンポーネントの設定・追加（バリアント / サイズ / プロパティ）
- ドキュメント編集（Definition / Usage / Do&Don't / Accessibility / States / Related）
- Figmaキャンバスへの生成（ComponentSet・変数）
- .figma.json インポート（Web AppからDLしたファイルを取り込む）
- Markdown エクスポート

**価値**: Web AppはStorybookのようにコンポーネントを確認しながら設計できる場所。Figmaで管理したい場合はエクスポートしてPluginで反映できる。アカウントなしで使えるのでハードルが低い。

---

## Phase 2 — ログイン同期でチームが繋がる

**テーマ**: Plugin + Web Appが同じアカウントで同期し、チーム全員が使えるようになる

### ページ構成・ルーティング

**未ログインユーザーの動線**

```
/ (ランディングページ)
  ├── [新規登録] → /signup
  └── [ログイン]  → /login
        ↓ 認証成功
/app/workspaces          (Workspace一覧)
  ↓（選択 or 新規作成）
/app/workspaces/:slug    (Project一覧)
  ↓（選択 or 新規作成）
/app/workspaces/:slug/projects/:id  (ギャラリー / 編集)
```

**ページ一覧**

| パス | 名称 | アクセス |
|------|------|---------|
| `/` | ランディングページ | 全員（未ログインがメイン） |
| `/login` | ログインページ | 未ログインのみ |
| `/signup` | 新規登録ページ | 未ログインのみ |
| `/app/workspaces` | Workspace一覧 | 要ログイン |
| `/app/workspaces/:slug` | Project一覧 | 要ログイン・要メンバー |
| `/app/workspaces/:slug/projects/:id` | ギャラリー | 要ログイン・要メンバー |

**ランディングページの構成要素**

```
Header          ロゴ / [ログイン] [新規登録 →]
Hero            キャッチコピー + スクリーンショット + CTA
Features        3〜4つの主要機能をカード形式で紹介
How it works    Plugin → Hub → チームの流れ（ステップ図）
Pricing         Free / Pro / Enterprise プラン表
Footer          利用規約 / プライバシーポリシー / お問い合わせ
```

**ログイン・新規登録ページ**

- Google / GitHub / メール+パスワード の選択肢を表示
- 新規登録後はメール確認フロー（Supabase標準）
- ログイン後: 所属Workspaceが1つなら直接Project一覧へ、複数なら一覧へ

### 認証

**対応ログイン方法**
- GitHub アカウント（OAuth）
- Google アカウント（OAuth）
- メールアドレス + パスワード
- **SSO（SAML 2.0）** — 会社利用を想定。Okta / Azure AD / Google Workspace 等に対応予定（Supabase Pro+）

**方針**
- Plugin・Web App 共通ログイン（同一Supabaseプロジェクト）
- **ログインなしではデザインシステムを作成・編集できない**（閲覧専用の共有URLは検討余地あり）
- ログイン時にlocalStorageの状態をクラウドにマージ（Phase 1からのデータ引き継ぎ）

**SSO実装方針（将来）**
- エンタープライズ向けにSSOTを採用する場合はIDプロバイダー（IdP）をSupabaseのSAML連携で接続
- ユーザーが自社ドメインを入力 → 対応するIdPにリダイレクト → セッション取得
- `sb.auth.signInWithSSO({ domain: 'company.com' })` でフロー開始
- Supabase Dashboardでテナントごとにメタデータ（EntityID / SSO URL）を登録する運用を想定

### アカウント構造

**3層構造（Notionに近い設計）**

```
User（個人ログイン）
  └── Workspace（会社・チームの単位）  ← 複数所属可能
        └── Project（デザインシステム1つ）  ← Workspace内に複数
```

- **User**: ログインの単位。Google / GitHub / メール で1アカウント
- **Workspace**: 課金・SSO・メンバー管理の単位。会社 or チームに対応
  - 1ユーザーが複数のWorkspaceに所属できる（フリーランサー・副業を想定）
  - ロール: `owner` / `admin` / `member` / `viewer`
  - SSOはWorkspaceごとに設定（Okta / Azure AD / Google Workspace等）
- **Project**: デザインシステム1つ。Workspace内に複数作成可能
  - 各Projectは独立したカラー / タイポグラフィ / コンポーネントを持つ

**画面遷移イメージ**

```
ログイン
  ↓
Workspace一覧（複数所属時）
  ├── 株式会社A
  └── フリーランスクライアントB
  ↓（選択）
Project一覧
  ├── [+ 新しいProject]
  ├── Web App DS       (最終更新: 2日前)
  └── Mobile App DS    (最終更新: 1週間前)
  ↓（選択）
ギャラリー画面（ヘッダー: Workspace名 / Project名）
```

**データモデル**

```
workspaces          { id, name, slug, stripe_customer_id, created_at }
workspace_members   { workspace_id, user_id, role, joined_at }
projects            { id, workspace_id, name, created_by, created_at }
project_state       { project_id, colors, typography, components }
subscriptions       { workspace_id, plan, status, stripe_subscription_id, current_period_end }
```

### 課金（Billing）

**課金の単位: Workspace**（Figma / Notion / Slack と同じ）

**プラン設計**

| プラン | 対象 | Projects | Members | SSO | 価格感 |
|--------|------|----------|---------|-----|--------|
| Free | 個人・試用 | 1 | 3名まで | — | 無料 |
| Pro | 小〜中チーム | 無制限 | 無制限 | — | 月額課金 |
| Enterprise | 企業 | 無制限 | 無制限 | ✅ SAML | 年額・要問い合わせ |

**技術スタック**
- 決済: **Stripe**（業界標準、Supabaseとの連携実績あり）
- Stripe Customer: Workspace作成時に自動生成（`stripe_customer_id` を保存）
- Stripe Subscription: プランアップグレード時に作成
- Webhook: Supabase Edge Functionで受信し、`subscriptions` テーブルを更新
- セルフサーブ: Stripe Billing Portalでプラン変更・解約をユーザー自身が操作

**制限の実装方針**
- Freeプランで上限に達したらUIでブロック + アップグレード促進ダイアログ
- Viewerロールは常に無料（閲覧専用）
- 試用期間（14日間 Pro体験）を設けることを検討

**将来の課金フロー**

```
Workspace作成
  → Stripe Customer作成（stripe_customer_id 保存）
  → Free プランで開始
  ↓
上限に達したとき / 手動アップグレード
  → Stripe Checkout Session
  → 支払い完了 → Webhook受信
  → subscriptions テーブル更新
  → Proプランとして解放
```

### 同期
- Plugin・Web Appどちらで変更しても自動的に反映
- 差分ステータス表示（`in sync` / `figma ahead` / `hub ahead` / `conflict`）
- アップグレード時の設定マージUI

### Figma同期（双方向）
- **Hub → Figma（push）**: HubのコンフィグをPluginがFigmaに反映
- **Figma → Hub（pull）**: Dev Mode Codegen APIでFigmaのプロパティをHubに送る
- **Figma REST API**: コンポーネント一覧・変数の読み取り（read-only）

### チーム連携
- デザイナー → Pluginで設定・生成 / Web Appでデザインシステムを構築
- PdM・エンジニア → Web AppでStorybookライクに閲覧・ドキュメント確認・MDダウンロード

**価値**: デザイナーはFigmaから離れず、PdM・エンジニアはブラウザから同じデザインシステムを参照・管理できる。

**技術備考**: Supabaseまたは軽量バックエンドが必要。

---

## Phase 3 — コード連携

**テーマ**: コードとHubが繋がる

- GitHubリポジトリを接続
- AST解析でコンポーネントを自動検出
- 「コードにあるがHubにない」コンポーネントを通知
- TypeScript型からProps定義を自動生成
- Web Appのギャラリーにコードの実装状況を表示

**価値**: 開発者が新しいコンポーネントを作ったら自動でHubに現れる。

**技術備考**: バックエンドが必須（GitHub Webhookの受信）。

---

## Phase 4 — 影響範囲 + マージ

**テーマ**: 変更の安全性がわかる

- コンポーネントの使用箇所を可視化（importグラフ）
- 変更時の影響範囲をハイライト
- 似ているコンポーネントを検出してマージUI

**価値**: 「これを変えたらどこが壊れるか」がわかる。

---

## 確定事項

- [x] ターゲット：デザイナーと開発者が両方いるチーム
- [x] Phase 2以降はアカウントがないとデザインシステムを作成・編集できない
- [x] 1アカウントで複数プロジェクト（デザインシステム）を作成できる
- [x] プロジェクト選択画面はログイン後に表示するトップ画面とする
- [x] ログイン方法: GitHub OAuth / Google OAuth / メール+パスワード
- [x] 将来的にSAML 2.0 SSOに対応する（会社・チーム向け、Supabase Pro+）
- [x] SSOはSupabaseのSAML連携を使いIdPごとにテナント登録する方式
- [x] アカウント構造: User → Workspace（複数所属可）→ Project（複数）の3層
- [x] WorkspaceはSlack・Notionと同様に複数所属を許容する（フリーランサー想定）
- [x] ロール: owner / admin / member / viewer をWorkspaceメンバーに付与
- [x] 未ログインユーザーはランディングページ（`/`）にアクセスし、そこから新規登録・ログインへ
- [x] ログイン・新規登録は専用ページ（`/login` / `/signup`）として独立させる
- [x] ログイン後の最初の画面はWorkspace一覧（所属1つなら直接Project一覧）
- [x] 課金単位: Workspace（Figma / Notion / Slack と同じ）
- [x] 決済: Stripe（Stripe Customer を Workspace に紐付け）
- [x] プラン: Free / Pro / Enterprise の3段階
- [x] Webhook は Supabase Edge Function で受信し subscriptions テーブルを更新
- [x] Storybookには出力しない（競合ポジション）—— ただしStorybookライクなビューはWeb App内に持つ
- [x] Web AppはStorybookのようにコンポーネントを確認できる場所
- [x] Web Appは空の状態から始まり、追加していく形式
- [x] Pluginだけでも使える（アカウント不要）
- [x] Web App単体でも使える（アカウント不要）
- [x] アカウントを作るとPlugin + Web Appが同期し、PdM・エンジニアも参加できる
- [x] FigmaはあくまでエクスポートのオプションのひとつでありWeb Appが主役

## 未決事項

- [ ] Phase 1とPhase 2の開発順序・優先度
- [ ] バックエンドはSupabaseか自前APIか
- [ ] どのPhaseがマネタイズのトリガーになるか
- [ ] Web Appのギャラリービューで実際のReactコンポーネントをレンダリングするか、インラインHTML/CSSにするか
