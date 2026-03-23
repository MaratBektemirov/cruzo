export { Template } from "./template";

export { AbstractComponent } from "./component";
export { AbstractService } from "./service";

export { RxBucket } from "./rx-bucket";

export { componentsRegistryService } from "./components-registry.service";
export { routerService, RouteUrlBucket } from "./router.service";

export { HttpClient, HttpError } from "./http";
export type { HttpRequestOptions, Interceptors } from "./http";

export type {
  AbstractComponentConstructor,
  ComponentDescriptor,
  ComponentConnectedParams,
  BucketEvent,
} from "./interfaces";

export { Rx, RxFunc } from './rx';

export { delay, debounce, arrayToHash } from "./utils"
