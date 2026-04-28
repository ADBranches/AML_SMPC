export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = {
  timeoutMs?: number;
};

async function request<T>(
  url: string,
  init: RequestInit = {},
  options: RequestOptions = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 10000
  );

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });

    const text = await response.text();
    const payload = text ? safeJsonParse(text) : null;

    if (!response.ok) {
      const message =
        getErrorMessage(payload) ||
        `Request failed with HTTP ${response.status}`;

      throw new ApiError(response.status, message, payload);
    }

    return payload as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out. Confirm the backend service is running.");
    }

    throw err instanceof Error
      ? err
      : new Error("Unexpected network error occurred.");
  } finally {
    window.clearTimeout(timeout);
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (typeof record.message === "string") {
      return record.message;
    }

    if (typeof record.error === "string") {
      return record.error;
    }
  }

  if (typeof payload === "string") {
    return payload;
  }

  return "";
}

export const apiClient = {
  get<T>(url: string, options?: RequestOptions) {
    return request<T>(url, { method: "GET" }, options);
  },

  post<T>(url: string, body?: unknown, options?: RequestOptions) {
    return request<T>(
      url,
      {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
      },
      options
    );
  },
};
