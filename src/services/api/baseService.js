import { API_BASE_URL } from "@/shared/constants";

const DEFAULT_HEADERS = Object.freeze({
  Accept: "application/json",
});

const buildPath = (path = "") => {
  if (!path) {
    return "";
  }

  return path.startsWith("/") ? path : `/${path}`;
};

const buildUrl = (baseUrl, endpoint, path) => {
  return `${baseUrl}${endpoint}${buildPath(path)}`;
};

export class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async _request(path = "", options = {}) {
    const { body, headers: customHeaders, ...fetchOptions } = options;

    const headers = {
      ...DEFAULT_HEADERS,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...customHeaders,
    };

    const url = buildUrl(API_BASE_URL, this.endpoint, path);

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      ...(body !== undefined
        ? { body: typeof body === "string" ? body : JSON.stringify(body) }
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
  }

  async _parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return null;
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  _createError(response, data) {
    const message =
      data?.error ||
      data?.message ||
      `Request gagal dengan status ${response.status}`;

    const error = new Error(message);

    error.status = response.status;
    error.data = data;

    return error;
  }

  request(path = "", options = {}) {
    return this._request(path, options);
  }

  getAll() {
    return this.request("", {
      method: "GET",
    });
  }

  getById(id) {
    return this.request(this._idPath(id), {
      method: "GET",
    });
  }

  create(payload) {
    return this.request("", {
      method: "POST",
      body: payload,
    });
  }

  update(id, payload) {
    return this.request(this._idPath(id), {
      method: "PUT",
      body: payload,
    });
  }

  remove(id) {
    return this.request(this._idPath(id), {
      method: "DELETE",
    });
  }

  _idPath(id) {
    return `/${encodeURIComponent(id)}`;
  }
}

export default BaseService;
