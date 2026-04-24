# fdsmp — プロジェクト構造

> このファイルはファイルの追加・削除時に自動更新される。

## 3つの役割

| 役割 | ソース | ビルド成果物 | 実行環境 |
|------|--------|-------------|---------|
| **Plugin バックエンド** | `src/plugin/` | `dist/code.js` | Figma サンドボックス（DOM なし） |
| **Plugin UI** | `src/ui/` | `dist/ui.html` + `dist/ui.js` | Figma 内 iframe |
| **Webapp + LP** | `src/webapp/` | `dist/index.html` + `dist/webapp.js` | ブラウザ |
| **共有** | `src/shared/` | 両バンドルに含まれる | — |

Plugin バックエンドと Plugin UI は `postMessage` で通信する。Webapp の LP とメイン画面は `App.tsx` がログイン状態で切り替える。

---

## src/plugin/ — Figmaサンドボックスで動くバックエンド

| ファイル | 概要 |
|---------|------|
| `code.ts` | プラグインエントリーポイント。`figma.ui.onmessage` でUIからのメッセージを受け取り、Figma APIを呼び出してカラー変数・タイポグラフィ変数・コンポーネント生成・選択情報取得を行う |

---

## src/ui/ — Plugin UI（Figma内iframeパネル）

### ルート

| ファイル | 概要 |
|---------|------|
| `index.tsx` | ReactルートをDOMにマウントするエントリーポイント |
| `App.tsx` | Plugin UIのルートコンポーネント。Supabase認証・Sidebar・各パネルを管理し、`postMessage` でバックエンドと通信 |
| `index.html` | Plugin UIのHTMLテンプレート |
| `styles.css` | Plugin UI専用グローバルスタイル |

### components/

| ファイル | 概要 |
|---------|------|
| `Sidebar.tsx` | タブ切り替えサイドバー。`colors` / `typography` / コンポーネントIDをタブとして持ち、有効・無効・カテゴリ表示を制御 |

### panels/

| ファイル | 概要 |
|---------|------|
| `ColorPanel.tsx` | カラーパネル。プリセットや手動入力でカラースケールを設定し、Figmaへの追加を指示 |
| `TypographyPanel.tsx` | タイポグラフィパネル。フォントファミリー・ベースサイズ・スケール比率を設定してタイポグラフィ変数を生成 |
| `ComponentPanel.tsx` | コンポーネントパネル。バリアント・サイズ・プロパティ・ドキュメントをタブで編集し、Figmaへのコンポーネント生成を指示 |

### utils/

| ファイル | 概要 |
|---------|------|
| `colorGenerator.ts` | HEXから `ColorVariableData` を生成。スケール（50〜950）計算・HSL変換・補色生成を担当 |
| `typographyGenerator.ts` | フォント設定から `TypographyVariableData` を生成。スケール比率（minor-second〜golden-ratio）に基づいてサイズを算出 |
| `exportGenerator.ts` | カラー・タイポグラフィ・コンポーネントのデータをMarkdown文字列に変換してエクスポート |

---

## src/webapp/ — Webアプリ + LP

### ルート

| ファイル | 概要 |
|---------|------|
| `index.tsx` | WebappのReactルートをDOMにマウントするエントリーポイント |
| `App.tsx` | Webappのルートコンポーネント。ログイン状態でLP/メイン画面を切り替え、Supabase同期・エクスポート・コンポーネント管理を統括 |
| `LandingPage.tsx` | マーケティング用ランディングページ。ウェイティングリスト登録フォーム付き（localStorageに保存） |
| `index.html` | WebappのHTMLテンプレート |
| `styles.css` | Webアプリ専用グローバルスタイル |
| `landing.css` | LP専用スタイル（styles.cssとは完全分離） |

### auth/

| ファイル | 概要 |
|---------|------|
| `AuthModal.tsx` | ログイン/サインアップモーダル。Supabase Authを使いメール+パスワード認証を行い、セッションを親に返す |

### components/

| ファイル | 概要 |
|---------|------|
| `ComponentGallery.tsx` | コンポーネント一覧ギャラリー。`ComponentPreview` でプレビューを表示し、編集・削除操作を提供 |
| `ComponentGrid.tsx` | コンポーネントをカテゴリ別のカラータグ付きグリッドで表示する選択UI |
| `AddComponentModal.tsx` | コンポーネント追加モーダル。select→configureの2ステップで `ComponentConfig` を構築する |
| `ConfigStyleTab.tsx` | バリアントのスタイル（色・角丸・余白・フォント）をスライダー+カラーピッカーで編集 |
| `ConfigSizesTab.tsx` | コンポーネントのサイズ設定（padding・fontSize・高さ等）をスライダーで編集 |
| `ConfigPropertiesTab.tsx` | コンポーネントのオプションレイヤー（icon・label・helper-text等）のON/OFFと初期値を編集 |

### hooks/

| ファイル | 概要 |
|---------|------|
| `useSync.ts` | Supabaseとのリアルタイム同期フック。ローカル変更をデバウンスしてDBに保存し、リモート更新を受信してstateに反映 |

### utils/

| ファイル | 概要 |
|---------|------|
| `download.ts` | JSONとMarkdownファイルのブラウザダウンロードを提供するユーティリティ |
| `figmaExport.ts` | `FigmaExport` 形式のJSONをビルド・パース・マージする処理と、詳細Markdownを生成する関数群 |

---

## src/shared/ — PluginとWebappの共有コード

| ファイル | 概要 |
|---------|------|
| `types.ts` | 全体共通の型定義。`RGB` / `ColorScale` / `ColorVariableData` / `TypographyVariableData` / `ComponentConfig` / `VariantStyle` / `SizeConfig` / `ComponentProperty` / `FigmaExport` など |
| `defaults.ts` | `INITIAL_COMPONENTS`（Button, Input, Badge等のデフォルトコンポーネント設定）を提供 |
| `supabaseClient.ts` | Supabaseクライアントの初期化と `initSupabase()` ファクトリを提供。`Session` / `User` 型を再エクスポート |
| `ComponentPreview.tsx` | `ComponentConfig` + `VariantStyle` + `SizeConfig` からReactプレビュー要素を生成する共有UIパーツ |

---

## インフラ・設定

| ファイル | 概要 |
|---------|------|
| `manifest.json` | Figmaプラグインマニフェスト（id・name・UIファイルパス） |
| `webpack.config.js` | Plugin UI と Webapp を別エントリーでビルド |
| `tsconfig.json` | TypeScript設定 |
| `supabase/schema.sql` | SupabaseのDBスキーマ（テーブル定義） |
| `.github/workflows/deploy.yml` | WebappのCI/CDデプロイワークフロー |
| `docs/phases.md` | 開発フェーズ計画 |
| `docs/product-identity.md` | プロダクトアイデンティティ |
| `docs/web-app-requirements.md` | Webアプリ要件定義 |

---

## ビルド成果物（dist/）

```
dist/code.js          ← Plugin バックエンド
dist/ui.html          ← Plugin UI HTML
dist/ui.js            ← Plugin UI JS
dist/index.html       ← Webapp + LP HTML
dist/webapp.js        ← Webapp + LP JS
```
