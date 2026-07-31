# Development Workflow

Use one milestone per release.

## Cycle

1. Define one bounded version scope.
2. Implement on the current repository.
3. Run typecheck and production build.
4. Audit desktop, tablet and mobile UI.
5. Audit authentication, authorization and database policies when applicable.
6. Review `git status` and `git diff`.
7. Commit with a conventional message.
8. Push to `main` and audit Netlify.
9. Create an annotated tag only after approval.
10. Create a GitHub release using the matching release note.
11. Update active documentation before starting the next milestone.

## Documentation rule

Only `README.md` remains in the project root. Every other Markdown file belongs in `docs/`.

## Versioning

- Patch: fixes without new user-facing capability
- Minor: new bounded capability or milestone
- Major: production-ready architectural or product boundary change


## Runtime baseline

v0.8.0 and later use Node.js `24.18.1` LTS, declared in `.nvmrc`, `package.json` engines and `netlify.toml`. Keep local and Netlify runtimes aligned before auditing a release.
