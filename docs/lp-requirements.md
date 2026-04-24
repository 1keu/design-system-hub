# Design System Hub — LP設計ドキュメント（Light UI）

---

## 概要

Design System Hubは、

**Figmaとコードの間にあるSingle Source of Truth（SSOT）であり、  
人とAIが読めるデザインシステム管理基盤。**

---

## コアコンセプト

- Figma ⇄ Hub ⇄ Code / AI
- 双方向接続
- すべての定義がHubに集約される

---

## LP構成

1. Hero
2. Demo
3. Comparison
4. Diagram
5. Capabilities
6. Creation
7. CTA

---

# 1. Hero

## コピー

### 見出し
Figma and code, unified.

### サブコピー
A design system your AI can read.  
One source of truth for your team and your tools.

### 補足
- Tokens, variants, and docs — in one place
- Built for humans and AI

### CTA
Join the waitlist →

---

## デザイン

- 左：テキスト
- 右：UIモック（大）
- 背景：白 + 薄いグリッド
- コントラストは弱め（ミニマル）

---

# 2. Demo

## コピー

### 見出し
See your system in one place.

### 補足
Everything stays in sync.

---

## UI構成

タブ：
- Preview
- Tokens
- Guidelines

---

## デザイン

- 中央に大きなUI
- カードとして浮かせる（軽いシャドウ）
- 背景は白 or ごく薄いグレー

---

# 3. Comparison

## コピー

### 見出し
Why not just Figma or Storybook?

---

## 内容

| | Figma | Storybook | Hub |
|--|------|-----------|-----|
| AI readable | ❌ | △ | ✅ |
| Single source of truth | ❌ | ❌ | ✅ |
| Tokens + docs together | ❌ | △ | ✅ |
| Two-way sync | ❌ | ❌ | ✅ |

---

## デザイン

- ボーダー付きテーブル
- 色は使わない（モノクロ）
- Hub列だけ軽く強調（背景うすく）

---

# 4. Diagram

## コピー

### 見出し
One source for everything.

### 補足
Everything flows through a single system.

---

## 図

Figma ⇄ Hub ⇄ Code / AI

---

## デザイン

- 中央配置
- 線は細く、矢印は明確
- Hubを少しだけ強調（太字 or 囲み）

---

# 5. Capabilities

## コピー

### 見出し
Connect everything.

---

## 内容

Figma → Hub  
Import components from Figma.

Code → Hub  
Sync your system from your codebase.

Hub → Figma  
Push updates back to Figma.

Hub → Code / AI  
Use your system in code and AI tools.

---

## デザイン

- 横4カラム
- アイコンは線のみ（アウトライン）
- ホバーで軽い背景変化だけ

---

# 6. Creation

## コピー

### 見出し
Start anywhere.

---

## 内容

From scratch  
Build your system in the browser.

From Figma  
Import existing components.

From code  
Bring your system from your codebase.

---

### 補足
New or existing — both work.

---

## デザイン

- 3カラム
- Capabilitiesより少し余白広め
- 入り口感を出す（矢印 or アイコン）

---

# 7. CTA

## コピー

### 見出し
Make your design system readable.

### 本文
A single source of truth for your team and your AI.

### ボタン
Join the waitlist →

---

## デザイン（重要）

- ダークは使わない
- 背景は白のまま

### 代わりにやること

- 余白を最大にする（上下大きく）
- 見出しを一番大きくする
- ボタンを唯一のアクションにする

👉 「余白で締める」

---

# デザイン原則

- モノクロベース
- UIを主役にする
- 色はコンポーネントに使わせる
- テキストは最小
- 図で理解させる

---

# 優先順位

Demo > Hero UI > Diagram > その他

---

# NG

- ダーク背景で強調
- カラフルな装飾
- 長文説明
- カード多用しすぎ

---

# 一貫メッセージ

Figma ⇄ Hub ⇄ Code / AI

---

# 次のステップ

1. Demo UIの詳細設計
2. Hub構造図のビジュアル化
3. Hero UIモック作成
