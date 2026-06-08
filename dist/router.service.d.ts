import { AbstractService } from "./service";
import type { HttpFactory } from "./http-types";
export type { RuleCompleted } from "./router-types";
interface RuleParams {
    onLoadRoute?: () => any;
    onUnloadRoute?: () => any;
    loadResources?: () => Promise<unknown>;
    httpFactory?: {
        [key: string]: HttpFactory;
    };
    url: string;
    redirectTo?: string;
    routeSelectorUnbox?: () => string;
    componentSelectorUnbox?: () => string;
}
declare class RouterService extends AbstractService {
    private rules;
    private completedComponentRules;
    pathname$: import("./rx").Rx<string, [v: string]>;
    search$: import("./rx").Rx<string, [v: string]>;
    resourcesLoading$: import("./rx").Rx<boolean, [v: boolean]>;
    private hashMode;
    private normalizePathname;
    private parseHashRoute;
    private getRoutedPathname;
    private getRoutedSearch;
    private buildHashModeLocationUrl;
    private redirectToHistoryUrl;
    setHashMode(value: boolean): void;
    isHashMode(): boolean;
    hrefIsActive(href: string, mode?: {
        startsWith?: boolean;
        ignoreSearch?: boolean;
    }): boolean;
    private getCompletedRedirectRules;
    private getCompletedComponentRules;
    update(ignoreRedirectRules?: boolean): void;
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
    buildUrl(k: keyof A, params?: Record<number | string, number | string>, query?: URLSearchParams): string;
    private getRouterOutletUnbox;
}
//# sourceMappingURL=router.service.d.ts.map