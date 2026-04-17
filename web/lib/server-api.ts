import "server-only";

const defaultApiBaseUrl = "http://localhost:7772";

export function getApiBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    defaultApiBaseUrl
  );
}

function candidateApiBaseUrls() {
  const primary = getApiBaseUrl();
  const candidates = [primary];

  if (primary.includes("localhost")) {
    candidates.push(primary.replace("localhost", "127.0.0.1"));
  } else if (primary.includes("127.0.0.1")) {
    candidates.push(primary.replace("127.0.0.1", "localhost"));
  }

  return [...new Set(candidates)];
}

export async function proxyToApi(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let lastError: unknown;

  for (const baseUrl of candidateApiBaseUrls()) {
    try {
      return await fetch(`${baseUrl}${path}`, {
        ...init,
        headers,
        cache: "no-store",
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("unable to reach api");
}

export async function readProxyPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return {
    error: text || "upstream request failed",
  };
}
