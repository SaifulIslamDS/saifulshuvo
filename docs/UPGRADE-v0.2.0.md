# Upgrade to v0.2.0

## 1. Back up the current branch

```powershell
git status
git add .
git commit -m "chore: save deployed v0.1.0 baseline"
```

Skip the commit when the working tree is already clean.

## 2. Copy the v0.2.0 files

Extract the patch ZIP and copy all included files into the existing repository root:

```text
D:\MyProjects\portfolio
```

Allow Windows to replace matching files. Do not delete:

```text
.git\
pnpm-lock.yaml
```

## 3. Install and verify

```powershell
nvm use 22.23.2
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
pnpm typecheck
pnpm build
```

## 4. Review locally

```powershell
pnpm dev
```

Test both themes and these routes:

```text
/
/projects
/projects/data-analytics-portfolio
/projects/promptkarigor
/blog
/contact
/admin
```

Also test the mobile navigation at narrow browser widths.

## 5. Commit and deploy

```powershell
git add .
git commit -m "feat: integrate real portfolio content and themes"
git push origin main
```

Netlify should deploy automatically.

## 6. Release tag after production audit

```powershell
git tag -a v0.2.0 -m "v0.2.0 - Real Portfolio Content Integration"
git push origin v0.2.0
```
