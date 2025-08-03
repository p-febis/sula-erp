export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {},
  retry = true,
): Promise<Response> {
  const token = sessionStorage.getItem("accessToken");

  const authHeaders = token
    ? {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      }
    : init.headers;

  const response = await fetch(input, {
    ...init,
    headers: {
      ...authHeaders,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (response.status === 401 && retry) {
    const refreshed = await tryRefreshAccessToken();

    if (refreshed) {
      return fetchWithAuth(input, init, false);
    }

    throw new Error("Unauthorized after refresh");
  }

  return response;
}

async function tryRefreshAccessToken(): Promise<boolean> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!response.ok) {
    sessionStorage.setItem("accessToken", "");
    return false;
  }

  const { data } = await response.json();

  if (data?.accessToken) {
    sessionStorage.setItem("accessToken", data.accessToken);
    return true;
  }

  return false;
}
