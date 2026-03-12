import { Rx } from "./rx";
import { AbstractService } from "./service";
import { AbstractComponentConstructor, IHttpClient } from "./interfaces";
interface RuleParams {
    onLoadRoute?: () => any;
    onUnloadRoute?: () => any;
    httpFactory?: {
        [key: string]: (signal: AbortSignal) => IHttpClient;
    };
    url: string;
    redirectTo?: string;
    routeSelectorUnbox?: () => string;
    componentSelectorUnbox?: () => string;
}
export interface RuleCompleted {
    onLoadRoute?: () => any;
    onUnloadRoute?: () => any;
    httpFactory?: {
        [key: string]: (signal: AbortSignal) => IHttpClient;
    };
    url: RouteUrl;
    redirectTo?: string;
    componentSelector?: string;
    routeSelector?: string;
    params$?: Rx<any>;
    components?: InstanceType<AbstractComponentConstructor>[];
}
declare class RouteUrl<A extends Record<string, any> = {}> {
    templateUrl: string;
    matcher: RouteMatcher;
    private re;
    constructor(templateUrl: string);
    private getReplacer;
    build(params?: A, query?: URLSearchParams, hash?: string): string;
}
declare class RouteMatcher {
    static reEscape: RegExp;
    static reParam: RegExp;
    private names;
    private re;
    constructor(route: string);
    private replacer;
    parse(url: string): any;
}
declare class RouterService extends AbstractService {
    private rules;
    private completedComponentRules;
    pathname$: Rx<string, [v: string]>;
    hash$: Rx<string, [v: string]>;
    search$: Rx<string, [v: string]>;
    private scrollToHashElementIsBlocked;
    private normalizePathname;
    hrefIsActive(href: string, mode?: {
        startsWith?: boolean;
        ignoreSearch?: boolean;
        ignoreHash?: boolean;
    }): boolean;
    private getCompletedRedirectRules;
    private getCompletedComponentRules;
    update(ignoreRedirectRules?: boolean): void;
    scrollToHashElement(): void;
    blockScrollToHashElement(time?: number): (this: unknown) => void;
    unblockScrollToHashElement: () => void;
    pushHistory(href: string): void;
    pushHistoryLink(event: Event, href: string): void;
    private eventListener;
    private separateRules;
    private applyRedirectRulesForUrl;
    private applyComponentRulesForUrl;
    constructor();
}
export declare const routerService: RouterService;
export declare class RouteUrlBucket<A> {
    private routerLayoutIdx;
    private rules;
    constructor(rulesParams: {
        [K in keyof A]: RuleParams;
    });
    buildUrl(k: keyof A, params?: Record<number | string, number | string>): string;
    private getRouterOutletUnbox;
    destroy(): void;
}
export {};
//# sourceMappingURL=router.service.d.ts.map