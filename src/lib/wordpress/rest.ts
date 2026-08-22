const DEFAULT_REST_BASE = "https://cms.saifulshuvo.com/wp-json/saifulshuvo/v1";

export function getPublicWordPressRestBase(): string {
  return (process.env.NEXT_PUBLIC_WORDPRESS_REST_URL || DEFAULT_REST_BASE).replace(/\/+$/, "");
}

type ApiErrorPayload = { message?: string; code?: string };

export async function postWordPressRest<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${getPublicWordPressRestBase()}${path.startsWith("/") ? path : `/${path}`}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    credentials: "omit",
    cache: "no-store",
    keepalive: true,
  });

  const result = await response.json().catch(() => ({})) as T & ApiErrorPayload;
  if (!response.ok) {
    throw new Error(result.message || `WordPress request failed with HTTP ${response.status}.`);
  }
  return result;
}
