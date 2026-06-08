export declare class RouteUrl<A extends Record<string, any> = {}> {
    templateUrl: string;
    matcher: RouteMatcher;
    private re;
    constructor(templateUrl: string);
    private getReplacer;
    build(params?: A, query?: URLSearchParams): string;
}
export declare class RouteMatcher {
    static reEscape: RegExp;
    static reParam: RegExp;
    private names;
    private re;
    constructor(route: string);
    private replacer;
    parse(url: string): any;
}
//# sourceMappingURL=route-url.d.ts.map