import { afterEach, describe, expect, it, vi } from "vitest";
import { AbstractComponent } from "./component";
import { componentsRegistryService } from "./components-registry.service";
import {
  clearRouterRulesForTests,
  RouteUrlBucket,
  routerService,
} from "./router.service";

async function flushMicrotasks() {
  await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
}

async function flushPromises() {
  await flushMicrotasks();
  await flushMicrotasks();
}

function resetRouter() {
  clearRouterRulesForTests();
  routerService.setHashMode(false);
  (routerService as any).completedComponentRules = [];
  routerService.pathname$.update("");
  routerService.search$.update("");
  routerService.resourcesLoading$.update(false);
  history.replaceState(null, "", "/");
  document.body.innerHTML = "";
}

class RouterTestHomePage extends AbstractComponent {
  static selector = "router-test-home-page";

  getHTML() {
    return `<p class="router-test-home">home</p>`;
  }
}

class RouterTestDocsPage extends AbstractComponent {
  static selector = "router-test-docs-page";

  getHTML() {
    return `<p class="router-test-docs">docs</p>`;
  }
}

function defineRouterTestComponents() {
  componentsRegistryService.define(RouterTestHomePage);
  componentsRegistryService.define(RouterTestDocsPage);
}

function mountRoutes(opts?: { lazy?: boolean }) {
  defineRouterTestComponents();
  document.body.innerHTML = `<main id="app"></main>`;

  return new RouteUrlBucket({
    home: {
      url: "/",
      componentSelectorUnbox: () => RouterTestHomePage.selector,
      routeSelectorUnbox: () => "#app",
    },
    docs: {
      url: "/docs/:slug",
      componentSelectorUnbox: () => RouterTestDocsPage.selector,
      routeSelectorUnbox: () => "#app",
      loadResources: opts?.lazy
        ? () => Promise.resolve().then(() => defineRouterTestComponents())
        : undefined,
    },
    legacy: {
      url: "/legacy",
      redirectTo: "/",
    },
  });
}

afterEach(() => {
  resetRouter();
});

describe("routerService.hrefIsActive", () => {
  it("matches pathname in history mode", () => {
    history.replaceState(null, "", "/docs/intro?tab=api");
    routerService.update();

    expect(routerService.hrefIsActive("/docs/intro?tab=api")).toBe(true);
    expect(routerService.hrefIsActive("/docs/intro", { ignoreSearch: true })).toBe(true);
    expect(routerService.hrefIsActive("/docs/other")).toBe(false);
  });

  it("supports startsWith mode", () => {
    history.replaceState(null, "", "/docs/intro/extra");
    routerService.update();

    expect(routerService.hrefIsActive("/docs/intro", { startsWith: true })).toBe(true);
    expect(routerService.hrefIsActive("/docs/intro", { startsWith: false })).toBe(false);
  });

  it("matches hash routes in hash mode", () => {
    routerService.setHashMode(true);
    history.replaceState(null, "", "/#/docs/intro?tab=api");
    routerService.update();

    expect(routerService.hrefIsActive("/docs/intro?tab=api")).toBe(true);
    expect(routerService.hrefIsActive("#/docs/intro?tab=api")).toBe(true);
    expect(routerService.hrefIsActive("/docs/other")).toBe(false);
  });
});

describe("routerService.pushHistory", () => {
  it("updates location and pathname$ in history mode", async () => {
    mountRoutes();

    routerService.pushHistory("/docs/intro");

    expect(window.location.pathname).toBe("/docs/intro");
    await flushPromises();
    expect(routerService.pathname$.actual).toBe("/docs/intro");
    expect(document.querySelector(".router-test-docs")?.textContent).toBe("docs");
  });

  it("updates hash in hash mode", async () => {
    mountRoutes();
    routerService.setHashMode(true);
    history.replaceState(null, "", "/");

    routerService.pushHistory("/docs/intro");

    expect(window.location.hash).toBe("#/docs/intro");
    await flushPromises();
    expect(routerService.pathname$.actual).toBe("/docs/intro");
  });

  it("is a no-op for the same url", async () => {
    mountRoutes();
    history.replaceState(null, "", "/docs/intro");
    routerService.update();
    await flushPromises();

    const spy = vi.spyOn(history, "pushState");
    routerService.pushHistory("/docs/intro");

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("pushHistoryLink prevents default navigation", () => {
    mountRoutes();
    const event = new Event("click", { cancelable: true });
    const preventSpy = vi.spyOn(event, "preventDefault");

    routerService.pushHistoryLink(event, "/docs/intro");

    expect(preventSpy).toHaveBeenCalled();
    expect(window.location.pathname).toBe("/docs/intro");
  });
});

describe("routerService.update", () => {
  it("mounts matched page component into route outlet", async () => {
    mountRoutes();
    history.replaceState(null, "", "/");
    routerService.update();
    await flushPromises();

    expect(document.querySelector(".router-test-home")?.textContent).toBe("home");
  });

  it("applies redirect rules via replaceState", async () => {
    mountRoutes();
    history.replaceState(null, "", "/legacy");
    routerService.update();
    await flushPromises();

    expect(window.location.pathname).toBe("/");
    expect(document.querySelector(".router-test-home")?.textContent).toBe("home");
  });

  it("throws on invalid rule with both redirect and component", () => {
    new RouteUrlBucket({
      bad: {
        url: "/bad",
        redirectTo: "/",
        componentSelectorUnbox: () => RouterTestHomePage.selector,
        routeSelectorUnbox: () => "#app",
      },
    });

    history.replaceState(null, "", "/bad");

    expect(() => routerService.update()).toThrow(/Invalid options/);
  });

  it("sets resourcesLoading$ while loadResources runs", async () => {
    let resolveLoad: () => void;
    const loadPromise = new Promise<void>((resolve) => {
      resolveLoad = resolve;
    });

    defineRouterTestComponents();
    document.body.innerHTML = `<main id="app"></main>`;

    new RouteUrlBucket({
      docs: {
        url: "/docs/:slug",
        componentSelectorUnbox: () => RouterTestDocsPage.selector,
        routeSelectorUnbox: () => "#app",
        loadResources: () => loadPromise,
      },
    });

    history.replaceState(null, "", "/docs/intro");
    routerService.update();

    expect(routerService.resourcesLoading$.actual).toBe(true);

    resolveLoad!();
    await flushPromises();

    expect(routerService.resourcesLoading$.actual).toBe(false);
    expect(document.querySelector(".router-test-docs")?.textContent).toBe("docs");
  });

  it("logs mount errors and does not update pathname when outlet is missing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    defineRouterTestComponents();
    document.body.innerHTML = "";

    new RouteUrlBucket({
      docs: {
        url: "/docs/:slug",
        componentSelectorUnbox: () => RouterTestDocsPage.selector,
        routeSelectorUnbox: () => "#app",
      },
    });

    history.replaceState(null, "", "/docs/intro");
    routerService.update();
    await flushPromises();

    expect(errorSpy).toHaveBeenCalledWith(
      "[cruzo/router] Failed to mount route:",
      expect.any(Error),
    );
    expect(routerService.pathname$.actual).toBe("");
    expect(document.querySelector(".router-test-docs")).toBeNull();

    errorSpy.mockRestore();
  });

  it("updates routeParams$ on the page without remounting", async () => {
    class RouterTestSlugPage extends AbstractComponent {
      static selector = "router-test-slug-page";

      getHTML() {
        return `<p class="router-test-slug">{{root.routeParams$::rx.slug}}</p>`;
      }
    }

    componentsRegistryService.define(RouterTestSlugPage);
    document.body.innerHTML = `<main id="app"></main>`;

    new RouteUrlBucket({
      docs: {
        url: "/docs/:slug",
        componentSelectorUnbox: () => RouterTestSlugPage.selector,
        routeSelectorUnbox: () => "#app",
      },
    });

    history.replaceState(null, "", "/docs/intro");
    routerService.update();
    await flushPromises();

    expect(document.querySelector(".router-test-slug")?.textContent).toBe("intro");

    routerService.pushHistory("/docs/api");
    await flushPromises();

    expect(document.querySelector(".router-test-slug")?.textContent).toBe("api");
    expect(document.querySelectorAll("router-test-slug-page")).toHaveLength(1);
  });
});

describe("RouteUrlBucket.buildUrl", () => {
  it("returns path in history mode", () => {
    const routes = new RouteUrlBucket({
      docs: {
        url: "/docs/:slug",
        componentSelectorUnbox: () => RouterTestDocsPage.selector,
        routeSelectorUnbox: () => "#app",
      },
    });

    expect(routes.buildUrl("docs", { slug: "intro" })).toBe("/docs/intro");
  });

  it("returns hash path in hash mode", () => {
    routerService.setHashMode(true);

    const routes = new RouteUrlBucket({
      docs: {
        url: "/docs/:slug",
        componentSelectorUnbox: () => RouterTestDocsPage.selector,
        routeSelectorUnbox: () => "#app",
      },
    });

    expect(routes.buildUrl("docs", { slug: "intro" })).toBe("#/docs/intro");
    expect(routes.buildUrl("docs", { slug: "intro" }, new URLSearchParams({ tab: "api" }))).toBe(
      "#/docs/intro?tab=api",
    );
  });
});
