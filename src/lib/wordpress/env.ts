const DEFAULT_SITE_URL = "https://saifulshuvo.com";
const DEFAULT_WORDPRESS_URL = "https://cms.saifulshuvo.com";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL);
}

export function getWordPressUrl(): string {
  return stripTrailingSlash(process.env.WORDPRESS_URL?.trim() || DEFAULT_WORDPRESS_URL);
}

export function getWordPressGraphqlUrl(): string {
  return process.env.WORDPRESS_GRAPHQL_URL?.trim() || `${getWordPressUrl()}/graphql`;
}

export function getWordPressRestUrl(): string {
  return stripTrailingSlash(
    process.env.NEXT_PUBLIC_WORDPRESS_REST_URL?.trim()
      || `${DEFAULT_WORDPRESS_URL}/wp-json/saifulshuvo/v1`,
  );
}

export function allowWordPressFallback(): boolean {
  return process.env.WORDPRESS_ALLOW_FALLBACK === "true";
}
