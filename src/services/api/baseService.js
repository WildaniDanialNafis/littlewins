import { API_BASE_URL, STORAGE_KEYS } from "@/shared/constants";

const DEFAULT_TIMEOUT = 15_000;

const DEFAULT_HEADERS = Object.freeze({
  Accept: "application/json",
});

/* ============================================================
 * HELPERS
 * ============================================================ */

const buildPath = (path = "") => {
  if (!path) {
    return "";
  }

  return path.startsWith("/") ? path : `/${path}`;
};

const buildUrl = (baseUrl, endpoint, path) => {
  return `${baseUrl}${endpoint}${buildPath(path)}`;
};

const getStoredToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.authToken);
  } catch {
    return null;
  }
};

const normalizeTimeout = (timeout) => {
  if (timeout === null || timeout === undefined) {
    return DEFAULT_TIMEOUT;
  }

  const value = Number(timeout);

  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT;
};

const createError = (message, name = "Error") => {
  if (typeof DOMException === "function") {
    return new DOMException(message, name);
  }

  const error = new Error(message);

  error.name = name;

  return error;
};

const createTimeoutController = (timeout) => {
  if (typeof AbortController === "undefined") {
    return {
      signal: undefined,
      controller: null,
      cleanup: () => {},
    };
  }

  const controller = new AbortController();

  const timerId = window.setTimeout(() => {
    controller.abort(createError("Request timeout", "TimeoutError"));
  }, timeout);

  return {
    signal: controller.signal,

    controller,

    cleanup: () => window.clearTimeout(timerId),
  };
};

const linkAbortSignal = (externalSignal, controller) => {
  if (!externalSignal || !controller) {
    return () => {};
  }

  if (externalSignal.aborted) {
    controller.abort(externalSignal.reason);

    return () => {};
  }

  const handleAbort = () => {
    controller.abort(externalSignal.reason);
  };

  externalSignal.addEventListener("abort", handleAbort, {
    once: true,
  });

  return () => {
    externalSignal.removeEventListener("abort", handleAbort);
  };
};

const createAbortError = (signal, fallbackMessage) => {
  const reason = signal?.reason;

  if (reason instanceof Error) {
    return reason;
  }

  if (typeof reason === "string" && reason.trim()) {
    return new Error(reason);
  }

  return createError(fallbackMessage, "AbortError");
};

const isAbortError = (error) => {
  return (
    error?.name === "AbortError" ||
    error?.name === "TimeoutError" ||
    error?.code === "ERR_CANCELED" ||
    error?.code === "ABORT_ERR"
  );
};

const isFormDataBody = (body) => {
  return typeof FormData !== "undefined" && body instanceof FormData;
};

const isJsonString = (body) => {
  if (typeof body !== "string") {
    return false;
  }

  const trimmed = body.trim();

  return trimmed.startsWith("{") || trimmed.startsWith("[");
};

export const isRequestAborted = isAbortError;

/* ============================================================
 * SERVICE
 * ============================================================ */

export class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  /* ==========================================================
   * REQUEST
   * ========================================================== */

  async _request(path = "", options = {}) {
    const {
      body,
      headers: customHeaders,
      signal: externalSignal,
      timeout = DEFAULT_TIMEOUT,
      ...fetchOptions
    } = options;

    const token = getStoredToken();

    const formDataBody = isFormDataBody(body);

    const shouldSetJsonContentType =
      body !== undefined &&
      !formDataBody &&
      !customHeaders?.["Content-Type"] &&
      !customHeaders?.["content-type"];

    const headers = {
      ...DEFAULT_HEADERS,

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(shouldSetJsonContentType
        ? {
            "Content-Type": "application/json",
          }
        : {}),

      ...customHeaders,
    };

    const url = buildUrl(API_BASE_URL, this.endpoint, path);

    const timeoutConfig = createTimeoutController(normalizeTimeout(timeout));

    const unlinkSignal = linkAbortSignal(
      externalSignal,
      timeoutConfig.controller,
    );

    const signal = timeoutConfig.signal ?? externalSignal;

    try {
      if (signal?.aborted) {
        throw createAbortError(signal, "Request dibatalkan.");
      }

      const requestBody =
        body === undefined
          ? undefined
          : formDataBody || typeof body === "string"
            ? body
            : JSON.stringify(body);

      const response = await fetch(url, {
        ...fetchOptions,

        headers,

        signal,

        ...(requestBody !== undefined
          ? {
              body: requestBody,
            }
          : {}),
      });

      if (response.status === 204) {
        return null;
      }

      const data = await this._parseResponse(response);

      if (!response.ok) {
        throw this._createError(response, data);
      }

      return data;
    } catch (error) {
      if (isAbortError(error) || signal?.aborted) {
        throw createAbortError(signal, "Request dibatalkan.");
      }

      /*
       * Network / browser error
       * tetap diteruskan sebagai Error.
       */
      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Request gagal.");
    } finally {
      unlinkSignal();
      timeoutConfig.cleanup();
    }
  }

  /* ==========================================================
   * RESPONSE
   * ========================================================== */

  async _parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    const normalizedContentType = contentType.toLowerCase();

    if (
      normalizedContentType.includes("application/json") ||
      normalizedContentType.includes("+json")
    ) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }

    /*
     * Jangan memaksa semua non-JSON
     * menjadi error.
     *
     * Beberapa endpoint bisa
     * mengembalikan plain text.
     */
    const text = await response.text();

    return text || null;
  }

  /* ==========================================================
   * ERROR
   * ========================================================== */

  _createError(response, data) {
    let message = `Request gagal dengan status ${response.status}`;

    if (data && typeof data === "object") {
      message = data.error ?? data.message ?? data.detail ?? message;
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    }

    const error = new Error(message);

    error.name = "ApiError";

    error.status = response.status;

    error.data = data;

    error.url = response.url;

    return error;
  }

  /* ==========================================================
   * PUBLIC REQUEST
   * ========================================================== */

  request(path = "", options = {}) {
    return this._request(path, options);
  }

  /* ==========================================================
   * CRUD
   * ========================================================== */

  getAll(options = {}) {
    return this.request("", {
      method: "GET",
      ...options,
    });
  }

  getById(id, options = {}) {
    return this.request(this._idPath(id), {
      method: "GET",
      ...options,
    });
  }

  create(payload, options = {}) {
    return this.request("", {
      method: "POST",
      body: payload,
      ...options,
    });
  }

  update(id, payload, options = {}) {
    return this.request(this._idPath(id), {
      method: "PUT",
      body: payload,
      ...options,
    });
  }

  remove(id, options = {}) {
    return this.request(this._idPath(id), {
      method: "DELETE",
      ...options,
    });
  }

  /* ==========================================================
   * ID
   * ========================================================== */

  _idPath(id) {
    if (id === null || id === undefined || id === "") {
      throw new Error("ID wajib diisi.");
    }

    return `/${encodeURIComponent(String(id))}`;
  }
}

export default BaseService;
