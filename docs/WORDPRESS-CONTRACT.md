# WordPress Frontend Contract

The frontend consumes WordPress through two public interfaces.

## Build-time reads — WPGraphQL

Default endpoint:

```text
https://cms.saifulshuvo.com/graphql
```

The frontend expects GraphQL exposure for:

- Site Settings / ACF Options
- Projects + Project Categories + Technologies + Project ACF
- Skills + Skill Groups + ACF
- Experience + ACF
- Services + ACF
- Posts + Categories + Tags + SEO ACF
- WordPress MediaItem fields

Run:

```bash
pnpm verify:wordpress
```

before a release build. If a WPGraphQL/ACF plugin update changes the schema, update only `src/lib/wordpress/queries/*` and the mapping helpers unless the application model truly changed.

## Browser writes — WordPress REST

Default base:

```text
https://cms.saifulshuvo.com/wp-json/saifulshuvo/v1
```

Used endpoints:

```text
POST /contact
POST /analytics
POST /web-vitals
POST /errors
```

These endpoints must accept requests from the public frontend origin while retaining validation, rate limits, sanitization and bounded payload handling.

## Publishing behavior

Only public/published WordPress content appears in public GraphQL connections and therefore in the static build. Draft posts/projects remain absent until published and a new build runs.

## Coupling rule

React components should depend on application types under `src/types`, not on raw WordPress/ACF field names. WordPress-specific field naming belongs in `src/lib/wordpress` only.
