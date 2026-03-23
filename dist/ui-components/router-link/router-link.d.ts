import { AbstractComponent } from "../../lib";
interface RouterLinkParams {
    activeCls?: string;
    startsWith?: boolean;
    ignoreHash?: boolean;
    ignoreSearch?: boolean;
}
export declare function RouterLinkConfig(params: RouterLinkParams): RouterLinkParams;
declare global {
    interface BucketEventMap {
        routerLinkStateChanged: {
            isActive: boolean;
        };
    }
}
export declare class RouterLinkComponent extends AbstractComponent<RouterLinkParams, boolean> {
    static selector: string;
    hasOuterBucket: boolean;
    hasConfig: boolean;
    isDirective: boolean;
    constructor();
    disconnectedCallback(): void;
    onClick: (event: Event) => void;
    onChange(): void;
    isActive(): boolean;
    connectedCallback(): void;
}
export {};
//# sourceMappingURL=router-link.d.ts.map