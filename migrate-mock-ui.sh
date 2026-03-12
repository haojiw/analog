#!/usr/bin/env bash
# migrate-mock-ui.sh
#
# Migrates the proven UI layer from apps/mobile-mock into apps/mobile.
# Safe to re-run: dry-runs by default, nothing is destructive.
#
# What this does:
#   1. Copies texture assets
#   2. Copies theme tokens + textures
#   3. Copies RecordingContext, useVoiceManager
#   4. Copies + adapts the home screen (fixes import paths)
#   5. Copies + adapts the tab layout (fixes import paths + tab names)
#   6. Rewrites root _layout.tsx with font + asset loading
#   7. Adds missing font packages to mobile's package.json
#
# What this does NOT do:
#   - Touch notes.tsx or mind.tsx (need real DB wiring, not mock data)
#   - Run npm install (remind you to do it)
#   - Touch anything outside apps/mobile/
#
# Usage:
#   ./migrate-mock-ui.sh           # dry run — shows what would change
#   ./migrate-mock-ui.sh --apply   # writes everything

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
MOCK="$ROOT/apps/mobile-mock"
DEST="$ROOT/apps/mobile"

DRY_RUN=true
[[ "${1:-}" == "--apply" ]] && DRY_RUN=false

# ── Helpers ──────────────────────────────────────────────────────────────────

log()  { echo "  $1  $2"; }
title(){ echo ""; echo "$1"; echo "────────────────────────────────────────────"; }

write_file() {
  local path="$1"
  local content="$2"
  if [[ -f "$path" ]] && [[ "$(cat "$path")" == "$content" ]]; then
    log "UP TO DATE" "$path"
    return
  fi
  [[ -f "$path" ]] && log "UPDATE" "${path#$ROOT/}" || log "NEW   " "${path#$ROOT/}"
  if ! $DRY_RUN; then
    mkdir -p "$(dirname "$path")"
    printf '%s' "$content" > "$path"
  fi
}

copy_file() {
  local src="$1"
  local dst="$2"
  if [[ ! -f "$src" ]]; then
    log "MISSING" "${src#$ROOT/} (skipped)"
    return
  fi
  if [[ -f "$dst" ]] && diff -q "$src" "$dst" > /dev/null 2>&1; then
    log "UP TO DATE" "${dst#$ROOT/}"
    return
  fi
  [[ -f "$dst" ]] && log "UPDATE" "${dst#$ROOT/}" || log "NEW   " "${dst#$ROOT/}"
  if ! $DRY_RUN; then
    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
  fi
}

echo ""
echo "migrate-mock-ui: mobile-mock → mobile"
$DRY_RUN && echo "(DRY RUN — pass --apply to write)" || echo "(APPLYING)"

# ── 1. Texture assets ────────────────────────────────────────────────────────
title "1. Assets"
for f in paper.webp paper1.jpg paper3.jpg paper4.jpg money.webp; do
  copy_file "$MOCK/assets/$f" "$DEST/assets/$f"
done

# ── 2. Theme ─────────────────────────────────────────────────────────────────
title "2. Theme"
copy_file "$MOCK/src/theme/tokens.ts"   "$DEST/src/theme/tokens.ts"
copy_file "$MOCK/src/theme/textures.ts" "$DEST/src/theme/textures.ts"

# ── 3. RecordingContext ───────────────────────────────────────────────────────
title "3. RecordingContext"
copy_file "$MOCK/src/context/RecordingContext.tsx" "$DEST/src/core/providers/RecordingContext.tsx"

# ── 4. Hooks ─────────────────────────────────────────────────────────────────
title "4. Hooks"
# useVoiceManager: update import path for RecordingContext
VOICE_MANAGER=$(sed \
  "s|'../context/RecordingContext'|'../../core/providers/RecordingContext'|g" \
  "$MOCK/src/hooks/useVoiceManager.ts")
write_file "$DEST/src/shared/hooks/useVoiceManager.ts" "$VOICE_MANAGER"

copy_file "$MOCK/src/hooks/useSectionedLogs.ts" "$DEST/src/shared/hooks/useSectionedLogs.ts"

# ── 5. Home screen ───────────────────────────────────────────────────────────
title "5. Home screen (app/(tabs)/index.tsx)"
HOME_SCREEN=$(sed \
  -e "s|'../../src/hooks/useVoiceManager'|'../../src/shared/hooks/useVoiceManager'|g" \
  -e "s|'../../src/theme/tokens'|'../../src/theme/tokens'|g" \
  -e "s|'../../src/theme/textures'|'../../src/theme/textures'|g" \
  "$MOCK/app/(tabs)/index.tsx")
write_file "$DEST/app/(tabs)/index.tsx" "$HOME_SCREEN"

# ── 6. Tab layout ────────────────────────────────────────────────────────────
title "6. Tab layout (app/(tabs)/_layout.tsx)"
# Fix imports + swap 'library' tab name for 'notes' (mobile's existing tab)
TAB_LAYOUT=$(sed \
  -e "s|'../../src/context/RecordingContext'|'../../src/core/providers/RecordingContext'|g" \
  -e "s|'../../src/theme/tokens'|'../../src/theme/tokens'|g" \
  -e "s|'../../src/theme/textures'|'../../src/theme/textures'|g" \
  -e 's|name="library"|name="notes"|g' \
  -e "s|i === 0 ? 'LIBRARY'|i === 0 ? 'NOTES'|g" \
  "$MOCK/app/(tabs)/_layout.tsx")
write_file "$DEST/app/(tabs)/_layout.tsx" "$TAB_LAYOUT"

# ── 7. Root layout ───────────────────────────────────────────────────────────
title "7. Root layout (app/_layout.tsx)"
# Rewrite to add font + asset loading, keeping mobile's existing Stack screens
ROOT_LAYOUT='import "../global.css";
import { useEffect } from "react";
import { Stack, SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { useAssets } from "expo-asset";
import { textures } from "../src/theme/textures";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond";
import { SpaceMono_400Regular } from "@expo-google-fonts/space-mono";
import { Inter_400Regular } from "@expo-google-fonts/inter";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_600SemiBold,
    SpaceMono_400Regular,
    Inter_400Regular,
  });

  const [assets] = useAssets([textures.background, textures.button]);

  const ready = fontsLoaded && !!assets;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="entry/[id]" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  );
}
'
write_file "$DEST/app/_layout.tsx" "$ROOT_LAYOUT"

# ── 8. package.json — add missing font packages ──────────────────────────────
title "8. package.json (font + asset deps)"
PKG="$DEST/package.json"
MISSING=()
grep -q '"expo-font"'                          "$PKG" || MISSING+=("expo-font")
grep -q '"expo-asset"'                         "$PKG" || MISSING+=("expo-asset")
grep -q '"@expo-google-fonts/cormorant-garamond"' "$PKG" || MISSING+=("@expo-google-fonts/cormorant-garamond")
grep -q '"@expo-google-fonts/space-mono"'      "$PKG" || MISSING+=("@expo-google-fonts/space-mono")
grep -q '"@expo-google-fonts/inter"'           "$PKG" || MISSING+=("@expo-google-fonts/inter")

if [[ ${#MISSING[@]} -eq 0 ]]; then
  log "UP TO DATE" "package.json"
else
  for pkg in "${MISSING[@]}"; do
    log "ADD   " "$pkg"
  done
  if ! $DRY_RUN; then
    # Inject after the "expo": line in dependencies
    for pkg in "${MISSING[@]}"; do
      # Use node to safely edit the JSON
      node -e "
        const fs = require('fs');
        const p = JSON.parse(fs.readFileSync('$PKG','utf8'));
        p.dependencies['$pkg'] = '*';
        fs.writeFileSync('$PKG', JSON.stringify(p, null, 2) + '\n');
      "
    done
    log "UPDATED" "package.json — run: npm install (from repo root)"
  fi
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "────────────────────────────────────────────"
if $DRY_RUN; then
  echo "Dry run complete. Run with --apply to write."
else
  echo "Done."
  echo ""
  echo "Next steps:"
  echo "  1. npm install               (from repo root — installs new font packages)"
  echo "  2. cd apps/mobile && npx expo start -c"
  echo "  3. Manually port notes.tsx and mind.tsx (replace mock data with DB calls)"
fi
echo ""
