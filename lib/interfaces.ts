import { AbstractComponent } from "./component";
import { HttpMethod, HttpRequestOptions } from "./http";
import { Rx } from "./rx";

declare global {
  interface BucketEventMap { }
}

export interface AbstractComponentConstructor {
  new(): AbstractComponent;
  selector: string;
}

export type ComponentsRegistryState = { [key: string]: Map<HTMLElement, AbstractComponent> };
export type ComponentsList = AbstractComponent[];

export interface ComponentDescriptor<A> {
  config?: A;
}

export interface BucketEvent<D> {
  data?: D;
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

export interface ComponentConnectedParams {
  httpFactory?: { [key: string]: HttpFactory };
  routeParams$?: Rx<any>;
  disableTemplate?: boolean;
}