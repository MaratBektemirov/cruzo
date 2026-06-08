import type { HttpMethod, HttpRequestOptions, IHttpClient, QueryParams } from "./http-types";
export type { HttpMethod, HttpRequestOptions, QueryParams, HeaderParams, IHttpClient, } from "./http-types";
type InterceptorParams = (method: HttpMethod, url: string, options: HttpRequestOptions) => Promise<void>;
type InterceptorSuccess = (method: HttpMethod, url: string, options: HttpRequestOptions, data: any, response: Response) => Promise<void>;
type InterceptorError = (method: HttpMethod, url: string, options: HttpRequestOptions, status: number, data: any, response: Response | null) => Promise<void>;
export interface Interceptors {
    params?: InterceptorParams;
    success?: InterceptorSuccess;
    error?: InterceptorError;
}
export declare class HttpError extends Error {
    message: string;
    status: number;
    url: string;
    data?: any;
    name: string;
    constructor(message: string, status: number, url: string, data?: any);
}
export declare class HttpClient {
    rootUrl: string;
    interceptors: Interceptors;
    withCredentials: boolean;
    cacheTime: number;
    static REFUSED: string;
    private cache;
    constructor(rootUrl: string, interceptors?: Interceptors, withCredentials?: boolean, cacheTime?: number);
    private normalizeHeaders;
    static getQueryString(params?: QueryParams): string;
    private stable;
    private getKeyForCache;
    private getBodyForForm;
    private inferContentType;
    private normalizeBody;
    private readResponseData;
    clearCache(method: HttpMethod, path: string, options?: HttpRequestOptions): Promise<void>;
    request<A = any>(method: HttpMethod, path: string, options?: HttpRequestOptions): Promise<A>;
    get<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
    post<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
    put<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
    patch<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
    delete<A = any>(path: string, options?: HttpRequestOptions): Promise<A>;
    factory: (signal: AbortSignal) => IHttpClient;
}
//# sourceMappingURL=http.d.ts.map