import { describe, expect, it } from "vitest";
import { RouteMatcher, RouteUrl } from "./route-url";

describe("RouteMatcher", () => {
  it("parses static path", () => {
    const matcher = new RouteMatcher("/search");

    expect(matcher.parse("/search")).toEqual({});
    expect(matcher.parse("/other")).toBeNull();
  });

  it("parses named params", () => {
    const matcher = new RouteMatcher("/docs/:slug");

    expect(matcher.parse("/docs/intro")).toEqual({ slug: "intro" });
    expect(matcher.parse("/docs/a/b")).toBeNull();
  });

  it("parses splat params", () => {
    const matcher = new RouteMatcher("/guide/*rest");

    expect(matcher.parse("/guide/getting-started/setup")).toEqual({
      rest: "getting-started/setup",
    });
  });

  it("coerces numeric param strings to numbers", () => {
    const matcher = new RouteMatcher("/items/:id");

    expect(matcher.parse("/items/42")).toEqual({ id: 42 });
    expect(matcher.parse("/items/abc")).toEqual({ id: "abc" });
  });

  it("matches routes with regex-special characters", () => {
    const matcher = new RouteMatcher("/app.html");

    expect(matcher.parse("/app.html")).toEqual({});
  });
});

describe("RouteUrl.build", () => {
  it("builds static path", () => {
    const url = new RouteUrl("/search");

    expect(url.build()).toBe("/search");
  });

  it("substitutes named params", () => {
    const url = new RouteUrl<{ slug: string }>("/docs/:slug");

    expect(url.build({ slug: "intro" })).toBe("/docs/intro");
  });

  it("encodes param values", () => {
    const url = new RouteUrl<{ q: string }>("/search/:q");

    expect(url.build({ q: "a b" })).toBe("/search/a%20b");
  });

  it("builds splat segments with encoding per part", () => {
    const url = new RouteUrl<{ rest: string }>("/guide/*rest");

    expect(url.build({ rest: "a b/c d" })).toBe("/guide/a%20b/c%20d");
  });

  it("appends query string", () => {
    const url = new RouteUrl("/search");
    const query = new URLSearchParams({ q: "x", page: "2" });

    expect(url.build({}, query)).toBe("/search?q=x&page=2");
  });

  it("throws when required param is missing", () => {
    const url = new RouteUrl<{ slug: string }>("/docs/:slug");

    expect(() => url.build({} as { slug: string })).toThrow(
      /Missing route param "slug"/,
    );
  });
});

describe("RouteUrl roundtrip", () => {
  it("build then parse returns params", () => {
    const url = new RouteUrl<{ slug: string }>("/docs/:slug");
    const built = url.build({ slug: "template-vm" });

    expect(url.matcher.parse(built)).toEqual({ slug: "template-vm" });
  });
});
