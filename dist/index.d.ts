export { Template } from "./template";
export { AbstractComponent } from "./component";
export { AbstractService } from "./service";
export { RxScope } from "./rx-scope";
export { componentsRegistryService } from "./components-registry.service";
export { routerService, RouteUrlBucket } from "./router.service";
export { HttpClient } from "./http";
export type { HttpRequestOptions } from "./http";
export type { AbstractComponentConstructor, ComponentDescriptor, ComponentConnectedParams, ScopeEvent, } from "./interfaces";
import { Rx as RxCls, RxFunc as RxFuncCls } from './rx';
export type Rx<A> = RxCls<A>;
export type RxFunc<A> = RxFuncCls<A>;
//# sourceMappingURL=index.d.ts.map