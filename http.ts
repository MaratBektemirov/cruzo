import { IHttpClient } from "./interfaces";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type ContentType = "application/x-www-form-urlencoded" | "application/json";

export interface HttpClientParams {
  [key: string]: string | number;
  "Content-Type"?: ContentType;
}

export interface HttpRequestOptions {
  query?: HttpClientParams;
  headers?: HttpClientParams;
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

export class HttpClient {
  static REFUSED = "net::ERR_CONNECTION_REFUSED";

  private cache: Record<string, Promise<any> | null> = {};

  constructor(
    public rootUrl: string,
    public interceptors: {
      params?: InterceptorParams;
      success?: InterceptorSuccess;
      error?: InterceptorError;
    } = {},
    public withCredentials: boolean = false,
    public cacheTime: number = 0
  ) {}

  static getQueryString(params?: HttpClientParams): string {
    if (!params) return "";

    const parts: string[] = [];
    for (const k of Object.keys(params)) {
      const v = params[k];
      if (v || v === 0) {
        parts.push(
          `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
        );
      }
    }
    return parts.length ? `?${parts.join("&")}` : "";
  }

  private getKeyForCache(
    fullUrl: string,
    query?: HttpClientParams,
    headers?: HttpClientParams,
    body?: any
  ) {
    const bodyStr = typeof body === "string" ? body : "";
    return (
      fullUrl +
      JSON.stringify(query || {}) +
      JSON.stringify(headers || {}) +
      bodyStr
    );
  }

  async clearCache(
    method: HttpMethod,
    path: string,
    options: HttpRequestOptions = {}
  ) {
    const url = this.rootUrl + path + HttpClient.getQueryString(options.query);

    if (this.interceptors.params) {
      await this.interceptors.params(method, url, options);
    }

    const cacheKey = this.getKeyForCache(
      url,
      options.query,
      options.headers,
      options.body
    );

    delete this.cache[cacheKey];
  }

  private getBodyForForm(body: any): string {
    if (body == null) return "";

    const parts: string[] = [];
    for (const key of Object.keys(body)) {
      let value = body[key];
      if (typeof value === "object" && value !== null) {
        value = JSON.stringify(value);
      }
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      );
    }
    return parts.join("&");
  }

  private normalizeBody(headers: HttpClientParams, body: any): BodyInit {
    const ct =
      (headers?.["Content-Type"] as ContentType) ||
      "application/x-www-form-urlencoded";

    if (ct === "application/json") {
      return JSON.stringify(body ?? null);
    }

    if (ct === "application/x-www-form-urlencoded") {
      return this.getBodyForForm(body ?? {});
    }

    return body as BodyInit;
  }

  private makeError(
    message: string,
    extras?: { status?: number; data?: any; url?: string }
  ) {
    const err = new Error(message);
    (err as any).status = extras?.status;
    (err as any).data = extras?.data;
    (err as any).url = extras?.url;
    return err;
  }

  private async readResponseData(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  async request<A = any>(
    method: HttpMethod,
    path: string,
    options: HttpRequestOptions = {}
  ): Promise<A> {
    const {
      query = {},
      headers = {},
      body,
      useCache = false,
      signal,
    } = options;

    const url = this.rootUrl + path + HttpClient.getQueryString(query);

    if (this.interceptors.params) {
      await this.interceptors.params(method, url, options);
    }

    const cacheEnabled = Boolean(useCache || this.cacheTime);
    const cacheKey = cacheEnabled
      ? this.getKeyForCache(url, query, headers, body)
      : "";

    if (cacheEnabled && this.cache[cacheKey]) {
      return this.cache[cacheKey] as Promise<A>;
    }

    const promise = (async () => {
      let response: Response | null = null;

      try {
        const init: RequestInit = {
          method,
          credentials: this.withCredentials ? "include" : "same-origin",
          signal,
        };

        if (headers && Object.keys(headers).length) {
          init.headers = Object.keys(headers).reduce((acc, k) => {
            acc[k] = String(headers[k]);
            return acc;
          }, {} as Record<string, string>);
        }

        if (body != null && method !== "GET") {
          init.body = this.normalizeBody(headers, body);
          if (!headers["Content-Type"]) {
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            (init.headers as any)["Content-Type"] = headers["Content-Type"];
          }
        }

        response = await fetch(url, init);
      } catch (e: any) {
        if (cacheEnabled) this.cache[cacheKey] = null;

        if (e?.name === "AbortError") {
          throw this.makeError("Request aborted", { status: 0, url });
        }

        if (this.interceptors.error) {
          await this.interceptors.error(method, url, options, 0, null, null);
        }

        throw this.makeError(HttpClient.REFUSED, { status: 0, url });
      }

      const data = await this.readResponseData(response);

      if (response.ok) {
        if (this.interceptors.success) {
          await this.interceptors.success(method, url, options, data, response);
        }

        if (cacheEnabled && this.cacheTime) {
          setTimeout(() => delete this.cache[cacheKey], this.cacheTime);
        }

        return data as A;
      }

      if (cacheEnabled) this.cache[cacheKey] = null;

      if (this.interceptors.error) {
        await this.interceptors.error(
          method,
          url,
          options,
          response.status,
          data,
          response
        );
      }

      const msg =
        (data && (data.message || data.error)) ||
        response.statusText ||
        `Request failed with status ${response.status}`;

      throw this.makeError(String(msg), {
        status: response.status,
        data,
        url,
      });
    })();

    if (cacheEnabled) {
      this.cache[cacheKey] = promise;
    }

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
      request: <A = any>(
        method: HttpMethod,
        path: string,
        options?: HttpRequestOptions
      ) => parent.request<A>(method, path, merge(options)),

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
  }
}
