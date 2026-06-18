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

export interface IHttpClient {
  request<A = any>(
    method: HttpMethod,
    path: string,
    options?: HttpRequestOptions
  ): Promise<A>;

  clearCache(
    method: HttpMethod,
    path: string,
    options?: HttpRequestOptions
  ): Promise<void>;

  get<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
  post<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
  put<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
  patch<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
  delete<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
}

export type HttpFactory = (signal: AbortSignal) => IHttpClient;
