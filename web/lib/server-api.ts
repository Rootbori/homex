import "server-only";

const defaultApiBaseUrl = "http://127.0.0.1:8080";

export function getApiBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl;
}

export async function proxyToApi(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
