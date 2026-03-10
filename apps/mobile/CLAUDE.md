# analog — mobile


## Navigation (Expo Router)

```
app/
├── (auth)/          # Unauthenticated: magic link login
├── (tabs)/          # Authenticated shell: record, journal, subconscious, conscious, settings
└── entry/[id].tsx   # Full-screen entry detail
```

The `(tabs)` group is the authenticated root. All feature screens live inside their respective tab.

---

## Feature Boundaries

```
src/features/
├── record/          # Voice/text input. Only concern: capturing and submitting an entry.
├── journal/         # Chronological entry list + detail. Read-only view layer.
├── subconscious/    # Passive AI: Portrait, Wrapped, Knowledge Graph, Echo. User is audience.
├── conscious/       # Active AI: Chat, Search, Memory Query. User is questioner.
└── settings/        # Account, preferences, subscription.
```

Features do not import from each other. Shared UI goes in `src/shared/`. Shared logic goes in `src/core/`.
