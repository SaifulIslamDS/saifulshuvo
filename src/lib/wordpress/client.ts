import { getWordPressGraphqlUrl } from "@/lib/wordpress/env";

type GraphQLErrorItem = {
  message?: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLErrorItem[];
};

function operationName(query: string): string {
  const match = query.match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)/);
  return match?.[1] ?? "AnonymousOperation";
}

export async function wpGraphql<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const endpoint = getWordPressGraphqlUrl();
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      cache: "force-cache",
    });
  } catch (error) {
    throw new Error(
      `Unable to reach WordPress GraphQL at ${endpoint} while running ${operationName(query)}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const text = await response.text();
  let payload: GraphQLResponse<T>;
  try {
    payload = JSON.parse(text) as GraphQLResponse<T>;
  } catch {
    throw new Error(
      `WordPress GraphQL returned non-JSON for ${operationName(query)} (${response.status} ${response.statusText}).`,
    );
  }

  if (!response.ok || payload.errors?.length) {
    const details = payload.errors?.map((item) => item.message || "Unknown GraphQL error").join(" | ") || text.slice(0, 500);
    throw new Error(`WordPress GraphQL ${operationName(query)} failed: ${details}`);
  }

  if (!payload.data) {
    throw new Error(`WordPress GraphQL ${operationName(query)} returned no data.`);
  }

  return payload.data;
}
