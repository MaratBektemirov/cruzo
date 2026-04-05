import { Rx } from "./rx";
import { AbstractService } from "./service";
import { componentsRegistryService } from "./components-registry.service";
import { AbstractComponentConstructor, IHttpClient } from "./interfaces";

interface Rule {
  onLoadRoute?: () => any;
  onUnloadRoute?: () => any;
  httpFactory?: { [key: string]: (signal: AbortSignal) => IHttpClient };

  url: RouteUrl;
  redirectTo?: string;
  routeSelectorUnbox?: () => string;
  componentSelectorUnbox?: () => string;

  originalParams: RuleParams;
}

interface RuleParams {
  onLoadRoute?: () => any;
  onUnloadRoute?: () => any;
  httpFactory?: { [key: string]: (signal: AbortSignal) => IHttpClient };

  url: string;
  redirectTo?: string;
  routeSelectorUnbox?: () => string;
  componentSelectorUnbox?: () => string;
}

export interface RuleCompleted {
  onLoadRoute?: () => any;
  onUnloadRoute?: () => any;
  httpFactory?: { [key: string]: (signal: AbortSignal) => IHttpClient };

  url: RouteUrl;
  redirectTo?: string;

  componentSelector?: string;
  routeSelector?: string;
  params$?: Rx<any>;
  components?: InstanceType<AbstractComponentConstructor>[];
}

class RouteUrl<A extends Record<string, any> = {}> {
  matcher: RouteMatcher;
  private re = /([:*])(\w+)/g;

  constructor(public templateUrl: string) {
    this.matcher = new RouteMatcher(templateUrl);
  }

  private getReplacer(params: A) {
    return (mode: string, name: string) => {
      if (!(name in params)) {
        throw new Error(
          `Missing route param "${name}" for template "${this.templateUrl}"`,
        );
      }

      const raw = params[name];

      if (mode === "*") {
        return String(raw)
          .split("/")
          .map((v) => encodeURIComponent(String(v)))
          .join("/");
      }

      return encodeURIComponent(String(raw));
    };
  }

  public build(params: A = {} as A, query?: URLSearchParams) {
    const replacer = this.getReplacer(params);
    const path = this.templateUrl.replace(this.re, (_, mode, name) =>
      replacer(mode, name),
    );

    const q = query?.toString();
    const qstr = q ? `?${q}` : "";

    return path + qstr;
  }
}

class RouteMatcher {
  static reEscape = /[\-\[\]{}()+?.,\\\^$|#\s]/g;
  static reParam = /([:*])(\w+)/g;

  private names: string[] = [];
  private re: RegExp;

  constructor(route: string) {
    let reSrc = route.replace(RouteMatcher.reEscape, "\\$&");
    reSrc = reSrc.replace(RouteMatcher.reParam, this.replacer.bind(this));

    this.re = new RegExp("^" + reSrc + "$");
  }

  private replacer(_: string, mode: string, name: string) {
    this.names.push(name);
    return mode === ":" ? "([^/]*)" : "(.*)";
  }

  public parse(url: string) {
    const m = url.match(this.re);
    if (!m) return null;

    const params: any = {};
    for (let i = 0; i < this.names.length; i++) {
      const v = m[i + 1];
      const n = +v;
      params[this.names[i]] = isNaN(n) ? v : n;
    }
    return params;
  }
}

const routerRules = new Set<Rule>();

class RouterService extends AbstractService {
  private rules = routerRules;
  private completedComponentRules: RuleCompleted[] = [];

  public pathname$ = this.newRx('');
  public search$ = this.newRx('');

  private hashMode = false;

  private normalizePathname(pathname: string) {
    if (pathname === "/") return pathname;
    return pathname.replace(/\/+$/, "");
  }

  private parseHashRoute(rawHash: string): { path: string; search: string } {
    if (!rawHash || rawHash === "#") return { path: "/", search: "" }

    let h = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
    const qidx = h.indexOf("?");
    const pathPartRaw = qidx >= 0 ? h.slice(0, qidx) : h;
    const searchPart = qidx >= 0 ? h.slice(qidx) : "";
    const pathPart = pathPartRaw.replace(/^\/+/, "");
    const path = pathPart === "" ? "/" : this.normalizePathname("/" + pathPart);

    return { path, search: searchPart }
  }

  private getRoutedPathname(url: URL) {
    if (this.hashMode) return this.parseHashRoute(url.hash).path
    return this.normalizePathname(url.pathname);
  }

  private getRoutedSearch(url: URL) {
    if (this.hashMode) return this.parseHashRoute(url.hash).search
    return url.search;
  }

  private buildHashModeLocationUrl(hashRoute: string) {
    return window.location.pathname + window.location.search + hashRoute;
  }

  private redirectToHistoryUrl(redirectTo: string) {
    if (!this.hashMode) return redirectTo

    const u = new URL(redirectTo, window.location.origin);
    let path: string;
    let search: string;
    if (u.hash && u.hash.startsWith("#/")) {
      const r = this.parseHashRoute(u.hash);
      path = r.path;
      search = r.search;
    } else {
      path = this.normalizePathname(u.pathname);
      search = u.search;
    }

    const hashRoute = "#/" + path.replace(/^\//, "") + search;
    return this.buildHashModeLocationUrl(hashRoute);
  }

  public setHashMode(value: boolean) {
    this.hashMode = value;
  }

  public isHashMode() {
    return this.hashMode;
  }

  public hrefIsActive(href: string, mode: {
    startsWith?: boolean,
    ignoreSearch?: boolean,
  } = null) {
    const linkUrl = new URL(href, window.location.origin);
    const cur = new URL(window.location.href);

    if (this.hashMode) {
      const linkPath = linkUrl.hash ? this.parseHashRoute(linkUrl.hash).path : this.normalizePathname(linkUrl.pathname);
      const linkSearch = linkUrl.hash ? this.parseHashRoute(linkUrl.hash).search : linkUrl.search;

      const currentPathname = this.getRoutedPathname(cur);
      const currentSearch = this.getRoutedSearch(cur);

      let a = mode?.startsWith ? currentPathname.startsWith(linkPath) : linkPath === currentPathname;

      let b = true;
      if (!mode?.ignoreSearch && linkSearch) b = linkSearch === currentSearch

      return a && b;
    }

    const currentPathname = this.normalizePathname(window.location.pathname);
    const linkPathname = this.normalizePathname(linkUrl.pathname);

    let a = mode?.startsWith ? currentPathname.startsWith(linkPathname) : linkPathname === currentPathname;

    let b = true;
    let c = true;

    if (!mode?.ignoreSearch && linkUrl.search) b = linkUrl.search === window.location.search

    if (linkUrl.hash) c = linkUrl.hash === window.location.hash

    return a && b && c;
  }

  private getCompletedRedirectRules(rules: Rule[]) {
    const rulesCompleted: RuleCompleted[] = [];
    const currentPath = this.getRoutedPathname(new URL(window.location.href));

    for (const rule of rules) {
      const params = rule.url.matcher.parse(currentPath);

      if (params) {
        rulesCompleted.push({
          redirectTo: rule.redirectTo,
          url: rule.url,
        });
      }
    }

    return rulesCompleted;
  }

  private getCompletedComponentRules(prevCompletedRules: RuleCompleted[], rules: Rule[]) {
    const prevUrls = new Set(prevCompletedRules.map((r) => r.url));
    const rulesCompleted: RuleCompleted[] = [];
    const currentPath = this.getRoutedPathname(new URL(window.location.href));

    for (const rule of rules) {
      const params = rule.url.matcher.parse(currentPath);

      if (params) {
        if (prevUrls.has(rule.url)) {
          const completedRule = prevCompletedRules.find((r) => r.url === rule.url);
          completedRule.params$.update(params);
          rulesCompleted.push(completedRule);
        } else {
          const componentSelector = rule.componentSelectorUnbox();
          const routeSelector = rule.routeSelectorUnbox();

          rulesCompleted.push({
            url: rule.url,
            componentSelector,
            routeSelector,
            params$: this.newRx(params),
            httpFactory: rule.httpFactory,
            onLoadRoute: rule.onLoadRoute,
            onUnloadRoute: rule.onUnloadRoute,
            components: [],
          });
        }
      }
    }

    return rulesCompleted;
  }

  public update(ignoreRedirectRules = false) {
    const url = new URL(window.location.href);
    const pathname = this.getRoutedPathname(url);
    const search = this.getRoutedSearch(url);

    if (this.pathname$.actual !== pathname) {
      const { redirectRules, componentRules } = this.separateRules();

      if (!ignoreRedirectRules && this.applyRedirectRulesForUrl(redirectRules)) {
        this.update(true);
        return;
      }

      this.applyComponentRulesForUrl(componentRules);
      this.pathname$.update(pathname);
    }

    if (this.search$.actual !== search) this.search$.update(search)
  }

  public pushHistory(href: string) {
    const url = new URL(href, window.location.origin);

    if (this.hashMode) {
      let path: string;
      let search: string;

      if (url.hash && url.hash.startsWith("#/")) {
        const r = this.parseHashRoute(url.hash);
        path = r.path;
        search = r.search;
      } else {
        path = this.normalizePathname(url.pathname);
        search = url.search;
      }

      const hashRoute = "#/" + path.replace(/^\//, "") + search;
      if (window.location.hash === hashRoute) return

      history.pushState(null, "", this.buildHashModeLocationUrl(hashRoute));
      this.update();
      return;
    }

    const pathname = this.normalizePathname(url.pathname);
    const hrefNormalized = pathname + url.search + url.hash;

    if (
      this.pathname$.actual === pathname &&
      this.search$.actual === url.search &&
      window.location.hash === url.hash
    ) {
      return;
    }

    history.pushState("", "", hrefNormalized);

    this.update();
  }

  public pushHistoryLink(event: Event, href: string) {
    event.preventDefault();
    this.pushHistory(href);
  }

  private eventListener = () => {
    this.update();
  };

  private separateRules() {
    const componentRules: Rule[] = [];
    const redirectRules: Rule[] = [];

    for (const rule of this.rules) {
      let componentRule = false;
      let redirectRule = false;

      if (typeof rule.componentSelectorUnbox === 'function') componentRule = true

      if (rule.redirectTo) redirectRule = true

      if (componentRule && redirectRule || (!componentRule && !redirectRule)) {
        throw new Error(
          `Invalid options for ${JSON.stringify(rule.originalParams, null, 2)}: expected either "componentSelectorUnbox" or "redirectTo"`
        );
      } else if (componentRule) {
        componentRules.push(rule);
      } else if (redirectRule) {
        redirectRules.push(rule);
      }
    }

    return {
      componentRules,
      redirectRules,
    }
  }

  private applyRedirectRulesForUrl(redirectRules: Rule[]) {
    const next = this.getCompletedRedirectRules(redirectRules);

    if (next.length) {
      const last = next[next.length - 1];
      history.replaceState(null, "", this.redirectToHistoryUrl(last.redirectTo));
      return true;
    }

    return false;
  }

  private applyComponentRulesForUrl(componentRules: Rule[]) {
    const prev = this.completedComponentRules;
    const next = this.getCompletedComponentRules(prev, componentRules);

    const prevUrls = new Set(prev.map((r) => r.url));
    const nextUrls = new Set(next.map((r) => r.url));

    for (const rule of prev) {
      if (nextUrls.has(rule.url)) continue;

      if (typeof rule.onUnloadRoute === "function") rule.onUnloadRoute();
      componentsRegistryService.removeComponents(rule.components, true);
    }

    for (const rule of next) {
      if (prevUrls.has(rule.url)) continue

      const routeNode = document.querySelector(rule.routeSelector);

      if (!routeNode) {
        throw new Error(
          `Node for ${rule.routeSelector} for ${rule.componentSelector} not found`,
        );
      }

      routeNode.innerHTML = `<${rule.componentSelector}></${rule.componentSelector}>`;

      componentsRegistryService.connectBySelector(
        rule.componentSelector,
        rule.components,
        routeNode,
        rule,
      );

      if (typeof rule.onLoadRoute === "function") rule.onLoadRoute();
    }

    this.completedComponentRules = next;
  }

  constructor() {
    super();

    window.addEventListener("hashchange", this.eventListener);
    window.addEventListener("popstate", this.eventListener);
  }
}

export const routerService = new RouterService();

export class RouteUrlBucket<A> {
  private routerLayoutIdx = 0;
  private rules = {} as { [K in keyof A]: Rule };

  constructor(rulesParams: { [K in keyof A]: RuleParams }) {
    const keys = Object.keys(rulesParams);

    for (const key of keys) {
      const originalParams = rulesParams[key as keyof A];

      this.rules[key as keyof A] = {
        ...originalParams,
        url: new RouteUrl(originalParams.url),
        originalParams,
      };

      const rule = this.rules[key as keyof A];

      if (typeof rule.componentSelectorUnbox === 'function' && typeof rule.routeSelectorUnbox !== 'function') {
        rule.routeSelectorUnbox = this.getRouterOutletUnbox();
      }

      routerRules.add(this.rules[key as keyof A]);
    }
  }

  buildUrl(
    k: keyof A,
    params: Record<number | string, number | string> = {},
    query?: URLSearchParams,
  ) {
    const base = this.rules[k].url.build(params, query);
    if (!routerService.isHashMode()) return base
    const u = new URL(base, "http://router.invalid");
    const tail = u.pathname.replace(/^\//, "");
    return `#/${tail}${u.search}`;
  }

  private getRouterOutletUnbox() {
    const routerOutlet = this.routerLayoutIdx++;
    return () => `.router-outlet-${routerOutlet}`
  };

  destroy() {
    const keys = Object.keys(this.rules);

    for (const key of keys) {
      routerRules.delete(this.rules[key as keyof A]);
    }
  }
}
