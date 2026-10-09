
const API_BASE_URL = "http://localhost:3000";

export async function apiRequest({
  method = "GET",
  url = "/users",
  headers = {},
  body
}) {
  const options = {
    method,
    headers: { ...headers }
  };

  if (body !== undefined && !["GET", "HEAD"].includes(method)) {
    options.headers["Content-Type"] =
      options.headers["Content-Type"] || "application/json";

    options.body =
      typeof body === "string" ? body : JSON.stringify(body);
  }

  const startedAt = performance.now();

  try {
    const response = await fetch(
      url.startsWith("http") ? url : `${API_BASE_URL}${url}`,
      options
    );

    const text = await response.text();
    let data = text;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // Keep non-JSON responses as plain text.
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      duration: Math.round(performance.now() - startedAt),
      headers: Object.fromEntries(response.headers.entries()),
      data
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      duration: Math.round(performance.now() - startedAt),
      headers: {},
      data: null,
      error: error.message
    };
  }
}

export { API_BASE_URL };
