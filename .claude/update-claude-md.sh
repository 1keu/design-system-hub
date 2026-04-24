#!/bin/bash
# src/ 配下のファイル変化を検知して CLAUDE.md に未登録ファイルを追記する

CLAUDE_MD="/Users/ikeuchishou/fdsmp/CLAUDE.md"
SRC_DIR="/Users/ikeuchishou/fdsmp/src"

changed=0

while IFS= read -r -d '' file; do
  rel="${file#$SRC_DIR/}"
  base=$(basename "$file")

  # ファイル名（basename）がCLAUDE.mdに存在するか確認
  if ! grep -qF "\`$base\`" "$CLAUDE_MD"; then
    echo "" >> "$CLAUDE_MD"
    echo "<!-- AUTO: 新規ファイル検出 -->" >> "$CLAUDE_MD"
    echo "| \`$rel\` | TODO: 概要を追記してください |" >> "$CLAUDE_MD"
    changed=1
  fi
done < <(find "$SRC_DIR" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.html" \) -not -path "*/node_modules/*" -print0)

if [ $changed -eq 1 ]; then
  echo "[CLAUDE.md] 新規ファイルを検出しました。概要を追記してください。"
fi
