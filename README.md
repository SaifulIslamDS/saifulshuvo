# SaifulShuvo Static Prerender Window Guard Patch v1.0.0-rc.5

## Purpose

Fixes the Next.js static-export prerender failure:

`ReferenceError: window is not defined`

observed while prerendering blog category pages.

## Root cause

Modern Node.js exposes a global `navigator`, so this client component expression could evaluate the `window` branch during server prerendering:

```ts
navigator.doNotTrack === "1" || window.doNotTrack === "1"
```

`window` does not exist during static prerendering.

## Change

Updates only:

`src/components/AnalyticsManager.tsx`

The Do Not Track check now independently guards both `navigator` and `window`.

## Apply

Extract this ZIP over the repository root and replace the existing file.

Then run:

```powershell
pnpm audit:architecture
pnpm typecheck
pnpm build
```

Only if `pnpm build` succeeds:

```powershell
pnpm check:static
Get-ChildItem -Force .\out
```

Do not restore Supabase/Tiptap/admin code and do not run `pnpm check:static` before a successful build.
