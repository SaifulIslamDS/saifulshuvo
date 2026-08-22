# cPanel Static Deployment Guide

## Deployment model

Do **not** create a permanent Node.js application for the public site. Node is used only to run the build.

```text
source repo → pnpm build → out/ → Apache document root
```

## Build environment

The cPanel selector currently provides Node.js `20.20.2`. The project engine is intentionally `>=20.9`, so this can be used as a build runtime.

Recommended commands:

```bash
node --version
corepack enable
pnpm --version
pnpm install --frozen-lockfile
pnpm verify:wordpress
pnpm typecheck
pnpm build
pnpm check:static
```

If `pnpm` is not available through Corepack, install/enable `pnpm@11.18.0` in the hosting environment using the provider-supported method.

## Preview first

Create a preview subdomain/document root and upload the **contents** of `out/` there.

Do not upload source files or `node_modules` into the public document root.

## Production

After preview QA, deploy the contents of `out/` into the document root mapped to `saifulshuvo.com`.

`out/.htaccess` is generated automatically and includes security/cache headers. Verify that the server has `mod_headers` and `mod_rewrite` available (typical cPanel Apache configuration).

## Rollback

Keep the previous static document-root contents in a separate backup directory until the new release is verified. Prefer directory swap/copy from a prepared build rather than editing files in place.
