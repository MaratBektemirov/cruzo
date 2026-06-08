import type { AbstractComponent } from "./component";
import type { Rx } from "./rx";
import type { HttpFactory } from "./http-types";
declare global {
    interface BucketEventMap {
    }
}
export interface AbstractComponentConstructor {
    new (): AbstractComponent;
    selector: string;
}
export type ComponentsRegistryState = {
    [key: string]: Map<HTMLElement, AbstractComponent>;
};
export type ComponentsList = AbstractComponent[];
export interface ComponentDescriptor<A> {
    config?: A;
}
export interface BucketEvent<D> {
    data?: D;
}
export interface ComponentConnectedParams {
    httpFactory?: {
        [key: string]: HttpFactory;
    };
    routeParams$?: Rx<any>;
    disableTemplate?: boolean;
}
//# sourceMappingURL=interfaces.d.ts.map