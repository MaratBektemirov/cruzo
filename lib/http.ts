import { IHttpClient } from "./interfaces";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";

export type QueryParams = Record<string, string | number | boolean | null | undefined>;
export type HeaderParams = Record<string, string | number | boolean | null | undefined>;

export interface HttpRequestOptions {
  query?: QueryParams;
  headers?: HeaderParams;
  body?: any;
  useCache?: boolean;
  signal?: AbortSignal;
}

type InterceptorParams = (
  method: HttpMethod,
  url: string,
  options: HttpRequestOptions
) => Promise<void>;

type InterceptorSuccess = (
  method: HttpMethod,
  url: string,
  options: HttpRequestOptions,
  data: any,
  response: Response
) => Promise<void>;

type InterceptorError = (
  method: HttpMethod,
  url: string,
  options: HttpRequestOptions,
  status: number,
  data: any,
  response: Response | null
) => Promise<void>;

export interface Interceptors {
  params?: InterceptorParams;
  success?: InterceptorSuccess;
  error?: InterceptorError;
}

export class HttpError extends Error {
  name = 'HttpError';

  constructor(
    public message: string,
    public status: number,
    public url: string,
    public data?: any
  ) {
    super(message);
  }
}

export class HttpClient {
  static REFUSED = "net::ERR_CONNECTION_REFUSED";

  private cache: Record<string, Promise<any> | null> = {};

  constructor(
    public rootUrl: string,
    public interceptors: Interceptors = {},
    public withCredentials: boolean = false,
    public cacheTime: number = 0
  ) { }

  private normalizeHeaders(input?: HeaderParams): Record<string, string> {
    const out: Record<string, string> = {};
    if (!input) return out;

    for (const [k, v] of Object.entries(input)) {
      if (v == null) continue;
      out[k.toLowerCase()] = String(v);
    }
    return out;
  }

  static getQueryString(params?: QueryParams): string {
    if (!params) return "";
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v == null) continue;
      usp.append(k, String(v));
    }
    const qs = usp.toString();
    return qs ? `?${qs}` : "";
  }

  private stable(x: any): string {
    if (x == null) return "";
    if (typeof x !== "object") return String(x);
    if (Array.isArray(x)) return `[${x.map((v) => this.stable(v)).join(",")}]`;
    const keys = Object.keys(x).sort();
    return `{${keys.map((k) => `${k}:${this.stable(x[k])}`).join(",")}}`;
  }

  private getKeyForCache(method: HttpMethod, fullUrl: string, body: any) {
    let bodyKey = "";
    if (body == null) bodyKey = "";
    else if (typeof body === "string") bodyKey = body;
    else if (body instanceof URLSearchParams) bodyKey = body.toString();
    else if (body instanceof FormData) bodyKey = "[formdata]";
    else if (body instanceof Blob) bodyKey = `[blob:${body.type || ""}:${body.size}]`;
    else if (body instanceof ArrayBuffer) bodyKey = `[arraybuffer:${body.byteLength}]`;
    else bodyKey = this.stable(body);

    return `${method}:${fullUrl}|${bodyKey}`;
  }

  private getBodyForForm(body: Record<string, any>): string {
    if (body == null) return "";

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(body)) {
      if (value == null) continue;

      if (Array.isArray(value)) {
        for (const v of value) {
          if (v == null) continue;
          params.append(key, String(v));
        }
        continue;
      }

      if (typeof value === "object") {
        throw new Error(
          `x-www-form-urlencoded does not support nested objects: "${key}"`
        );
      }

      params.append(key, String(value));
    }

    return params.toString();
  }

  private inferContentType(body: any): string | undefined {
    if (body == null) return undefined;

    if (body instanceof FormData) return undefined;

    if (body instanceof URLSearchParams) {
      return "application/x-www-form-urlencoded;charset=UTF-8";
    }

    if (typeof body === "string") {
      return "text/plain;charset=UTF-8";
    }

    if (body instanceof Blob) {
      return body.type || undefined;
    }

    if (body instanceof ArrayBuffer) {
      return "application/octet-stream";
    }

    if (typeof body === "object") {
      return "application/json;charset=UTF-8";
    }

    return "text/plain;charset=UTF-8";
  }

  private normalizeBody(body: any, ct?: string): BodyInit | undefined {
    if (body == null) return undefined;

    if (ArrayBuffer.isView(body)) return body as any;

    if (
      typeof body === "string" ||
      body instanceof FormData ||
      body instanceof URLSearchParams ||
      body instanceof Blob ||
      body instanceof ArrayBuffer
    ) {
      return body as BodyInit;
    }

    const contentType = (ct || "").toLowerCase();

    if (contentType.includes("application/x-www-form-urlencoded")) {
      return this.getBodyForForm(body ?? {});
    }

    if (contentType.includes("application/json")) {
      return JSON.stringify(body);
    }

    if (contentType.includes("text/plain")) {
      return String(body);
    }

    if (typeof body === "object") return JSON.stringify(body);

    return String(body);
  }

  private async readResponseData(res: Response) {
    if (res.status === 204) return null;

    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const text = await res.text();
    if (!text) return null;

    if (ct.includes("application/json")) {
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }

    return text;
  }

  async clearCache(method: HttpMethod, path: string, options: HttpRequestOptions = {}) {
    const query = options.query ?? {};
    const url = this.rootUrl + path + HttpClient.getQueryString(query);

    const headers = this.normalizeHeaders(options.headers);
    const safeOptions: HttpRequestOptions = { ...options, query, headers };

    if (this.interceptors.params) {
      await this.interceptors.params(method, url, safeOptions);
    }

    const cacheKey = this.getKeyForCache(method, url, options.body);
    delete this.cache[cacheKey];
  }

  async request<A = any>(
    method: HttpMethod,
    path: string,
    options: HttpRequestOptions = {}
  ): Promise<A> {
    const query = options.query ?? {};
    const url = this.rootUrl + path + HttpClient.getQueryString(query);

    const headers = this.normalizeHeaders(options.headers);
    const safeOptions: HttpRequestOptions = { ...options, query, headers };

    if (this.interceptors.params) {
      await this.interceptors.params(method, url, safeOptions);
    }

    const upper = method.toUpperCase() as HttpMethod;
    const bodyAllowed = upper !== "GET" && upper !== "HEAD";

    if (options.body != null && !bodyAllowed) {
      throw new HttpError(`Body is not allowed for ${upper}`, 0, url);
    }

    const cacheEnabled = Boolean((options.useCache ?? false) || this.cacheTime);
    const cacheKey = cacheEnabled ? this.getKeyForCache(upper, url, options.body) : "";

    if (cacheEnabled && this.cache[cacheKey]) {
      return this.cache[cacheKey] as Promise<A>;
    }

    const promise = (async () => {
      let response: Response = null;

      try {
        const init: RequestInit = {
          method: upper,
          credentials: this.withCredentials ? "include" : "same-origin",
          signal: options.signal,
          headers,
        };

        if (bodyAllowed && options.body != null) {
          if (!headers["content-type"]) {
            const inferred = this.inferContentType(options.body);
            if (inferred) headers["content-type"] = inferred;
          }

          init.body = this.normalizeBody(options.body, headers["content-type"]);
        }

        response = await fetch(url, init);
      } catch (e: any) {
        if (cacheEnabled) this.cache[cacheKey] = null;

        if (e?.name === "AbortError") {
          throw new HttpError("Request aborted", 0, url);
        }

        await this.interceptors.error?.(upper, url, safeOptions, 0, null, null);

        throw new HttpError(HttpClient.REFUSED, 0, url);
      }

      const data: A = await this.readResponseData(response);

      if (response.ok) {
        await this.interceptors.success?.(upper, url, safeOptions, data, response);

        if (cacheEnabled && this.cacheTime) {
          setTimeout(() => delete this.cache[cacheKey], this.cacheTime);
        }

        return data;
      } else {
        if (cacheEnabled) this.cache[cacheKey] = null;

        await this.interceptors.error?.(
          upper,
          url,
          safeOptions,
          response.status,
          data,
          response
        );

        throw new HttpError(`${method} ${url} ${response.status}`, response.status, url, data);
      }
    })();

    if (cacheEnabled) this.cache[cacheKey] = promise;
    return promise;
  }

  get<A = any>(path: string, options: HttpRequestOptions = {}) {
    return this.request<A>("GET", path, options);
  }

  post<A = any>(path: string, options: HttpRequestOptions = {}) {
    return this.request<A>("POST", path, options);
  }

  put<A = any>(path: string, options: HttpRequestOptions = {}) {
    return this.request<A>("PUT", path, options);
  }

  patch<A = any>(path: string, options: HttpRequestOptions = {}) {
    return this.request<A>("PATCH", path, options);
  }

  delete<A = any>(path: string, options: HttpRequestOptions = {}) {
    return this.request<A>("DELETE", path, options);
  }

  factory = (signal: AbortSignal) => {
    const parent = this;

    const merge = (options?: HttpRequestOptions): HttpRequestOptions => ({
      ...(options || {}),
      signal,
    });

    const result: IHttpClient = {
      request: <A = any>(method: HttpMethod, path: string, options?: HttpRequestOptions) =>
        parent.request<A>(method, path, merge(options)),

      clearCache: (method: HttpMethod, path: string, options?: HttpRequestOptions) =>
        parent.clearCache(method, path, merge(options)),

      get: <A = any>(path: string, options?: HttpRequestOptions) =>
        parent.get<A>(path, merge(options)),

      post: <A = any>(path: string, options?: HttpRequestOptions) =>
        parent.post<A>(path, merge(options)),

      put: <A = any>(path: string, options?: HttpRequestOptions) =>
        parent.put<A>(path, merge(options)),

      patch: <A = any>(path: string, options?: HttpRequestOptions) =>
        parent.patch<A>(path, merge(options)),

      delete: <A = any>(path: string, options?: HttpRequestOptions) =>
        parent.delete<A>(path, merge(options)),
    };

    return result;
  };
}