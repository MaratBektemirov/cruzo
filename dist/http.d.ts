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
type InterceptorParams = (method: HttpMethod, url: string, options: HttpRequestOptions) => Promise<void>;
type InterceptorSuccess = (method: HttpMethod, url: string, options: HttpRequestOptions, data: any, response: Response) => Promise<void>;
type InterceptorError = (method: HttpMethod, url: string, options: HttpRequestOptions, status: number, data: any, response: Response | null) => Promise<void>;
export interface Interceptors {
    params?: InterceptorParams;
    success?: InterceptorSuccess;
    error?: InterceptorError;
}
export declare class HttpClient {
    rootUrl: string;
    interceptors: Interceptors;
    withCredentials: boolean;
    cacheTime: number;
    static REFUSED: string;
    private cache;
    constructor(rootUrl: string, interceptors?: Interceptors, withCredentials?: boolean, cacheTime?: number);
    static getQueryString(params?: HttpClientParams): string;
    private getKeyForCache;
    clearCache(method: HttpMethod, path: string, options?: HttpRequestOptions): Promise<void>;
    private getBodyForForm;
    private normalizeBody;
    private makeError;
    private readResponseData;
    request<A = any>(method: HttpMethod, path: string, options?: HttpRequestOptions): Promise<A>;
    get<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
    post<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
    put<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
    patch<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
    delete<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
    factory: (signal: AbortSignal) => IHttpClient;
}
export {};
//# sourceMappingURL=http.d.ts.map