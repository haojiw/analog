#!/usr/bin/env bash
# sync-mock.sh
#
# Copies the portable UI layer from apps/mobile-mock into apps/mobile.
# Safe to run repeatedly — only overwrites the files listed below.
# Screens are NOT synced; they need manual wiring to real data.
#
# Usage:
#   ./sync-mock.sh          # dry run — shows what would change
#   ./sync-mock.sh --apply  # actually copies the files

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
MOCK="$ROOT/apps/mobile-mock/src"
DEST="$ROOT/apps/mobile/src"

DRY_RUN=true
if [[ "${1:-}" == "--apply" ]]; then
  DRY_RUN=false
fi

# ── File map: source → destination ──────────────────────────────────────────
# Format: "relative/src/path:relative/dest/path"
# Paths are relative to their respective src roots.
declare -a FILES=(
  "theme/tokens.ts:theme/tokens.ts"
  "theme/textures.ts:theme/textures.ts"
  "context/RecordingContext.tsx:core/providers/RecordingContext.tsx"
  "hooks/useVoiceManager.ts:shared/hooks/useVoiceManager.ts"
  "hooks/useSectionedLogs.ts:shared/hooks/useSectionedLogs.ts"
)

# ── NOT synced (require manual wiring) ──────────────────────────────────────
# apps/mobile-mock/app/(tabs)/index.tsx      → apps/mobile/src/features/record/
# apps/mobile-mock/app/(tabs)/library.tsx    → apps/mobile/src/features/journal/
# apps/mobile-mock/app/(tabs)/mind.tsx       → apps/mobile/src/features/subconscious/
# apps/mobile-mock/src/mocks/data.ts         → never copy; replace with DB calls

echo ""
echo "sync-mock: mobile-mock → mobile (portable layer only)"
echo "────────────────────────────────────────────────────"
if $DRY_RUN; then
  echo "DRY RUN — run with --apply to write files"
  echo ""
fi

any_change=false

for entry in "${FILES[@]}"; do
  src_rel="${entry%%:*}"
  dst_rel="${entry##*:}"
  src="$MOCK/$src_rel"
  dst="$DEST/$dst_rel"

  if [[ ! -f "$src" ]]; then
    echo "  MISSING  $src_rel (skipped)"
    continue
  fi

  # Check if destination differs or doesn't exist
  if [[ -f "$dst" ]] && diff -q "$src" "$dst" > /dev/null 2>&1; then
    echo "  UP TO DATE  $dst_rel"
    continue
  fi

  any_change=true
  if [[ -f "$dst" ]]; then
    echo "  UPDATE  $dst_rel"
  else
    echo "  NEW     $dst_rel"
  fi

  if ! $DRY_RUN; then
    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
  fi
done

echo ""
if $DRY_RUN && $any_change; then
  echo "Run with --apply to write the changes above."
elif ! $DRY_RUN; then
  echo "Done. Review with: git diff apps/mobile/src"
else
  echo "Everything already up to date."
fi
echo ""
