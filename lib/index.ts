export { Template } from "./template";

export { AbstractComponent } from "./component";
export { AbstractService } from "./service";

export { RxBucket } from "./rx-bucket";

export { componentsRegistryService } from "./components-registry.service";
export { routerService, RouteUrlBucket } from "./router.service";
export { toastService } from "./toast.service";
export { i18nService } from "./i18n.service";

export { HttpClient, HttpError } from "./http";
export type { HttpRequestOptions, Interceptors } from "./http";

export type {
  AbstractComponentConstructor,
  ComponentDescriptor,
  ComponentConnectedParams,
  BucketEvent,
  ComponentsList,
} from "./types/interfaces";

export type { RuleCompleted } from "./types/router-types";
export type { IHttpClient, HttpFactory, HttpMethod } from "./types/http-types";
export type {
  I18nMessages,
  I18nLocaleDict,
  I18nLocaleView,
  I18nPluralForms,
  I18nPluralCategory,
} from "./types/i18n-types";

export { Rx, RxFunc } from './rx';

export { delay, debounce, arrayToHash } from "./utils";
