import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpClient, HttpError } from "./http";

function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

function mockFetch(handler: (...args: Parameters<typeof fetch>) => Response | Promise<Response>) {
  return vi.fn((...args: Parameters<typeof fetch>) => Promise.resolve(handler(...args)));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("HttpClient.getQueryString", () => {
  it("builds query string skipping nullish values", () => {
    expect(HttpClient.getQueryString({ q: "x", page: 2, skip: null, empty: undefined })).toBe(
      "?q=x&page=2",
    );
    expect(HttpClient.getQueryString()).toBe("");
  });
});

describe("HttpClient.request", () => {
  it("GET parses json response", async () => {
    const fetchMock = mockFetch((input) => {
      expect(String(input)).toBe("https://api.example.com/me");
      return jsonResponse({ id: 1 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com");
    await expect(api.get("/me")).resolves.toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("POST sends json body with inferred content-type", async () => {
    const fetchMock = mockFetch((_input, init) => {
      expect(init?.method).toBe("POST");
      expect(init?.headers).toMatchObject({
        "content-type": "application/json;charset=UTF-8",
      });
      expect(init?.body).toBe(JSON.stringify({ name: "cruzo" }));
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com");
    await expect(api.post("/items", { body: { name: "cruzo" } })).resolves.toEqual({ ok: true });
  });

  it("POST encodes x-www-form-urlencoded body", async () => {
    const fetchMock = mockFetch((_input, init) => {
      expect(init?.headers).toMatchObject({
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      });
      expect(String(init?.body)).toBe("q=hello&tags=a&tags=b");
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com");
    const body = new URLSearchParams();
    body.append("q", "hello");
    body.append("tags", "a");
    body.append("tags", "b");

    await expect(api.post("/search", { body })).resolves.toEqual({ ok: true });
  });

  it("throws HttpError on non-ok response and calls error interceptor", async () => {
    const onError = vi.fn();
    const fetchMock = mockFetch(() => jsonResponse({ message: "nope" }, { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com", { error: onError });

    await expect(api.get("/missing")).rejects.toMatchObject({
      name: "HttpError",
      status: 404,
      url: "https://api.example.com/missing",
      data: { message: "nope" },
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("throws REFUSED on network failure", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com");

    await expect(api.get("/down")).rejects.toMatchObject({
      message: HttpClient.REFUSED,
      status: 0,
    });
  });

  it("throws on aborted request", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    const fetchMock = vi.fn().mockRejectedValue(abortError);
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com");
    const controller = new AbortController();

    await expect(api.get("/me", { signal: controller.signal })).rejects.toMatchObject({
      message: "Request aborted",
      status: 0,
    });
  });

  it("rejects body on GET", async () => {
    const api = new HttpClient("https://api.example.com");

    await expect(api.request("GET", "/me", { body: { x: 1 } })).rejects.toBeInstanceOf(HttpError);
  });

  it("returns null for 204 responses", async () => {
    const fetchMock = mockFetch(() => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com");
    await expect(api.delete("/item/1")).resolves.toBeNull();
  });

  it("runs params interceptor before fetch", async () => {
    const onParams = vi.fn(async (_method, _url, options) => {
      options.headers ??= {};
      options.headers.Authorization = "Bearer token";
    });
    const fetchMock = mockFetch((_input, init) => {
      expect(init?.headers).toMatchObject({ Authorization: "Bearer token" });
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com", { params: onParams });
    await api.get("/secure");

    expect(onParams).toHaveBeenCalledTimes(1);
  });

  it("caches GET responses when useCache is enabled", async () => {
    const fetchMock = mockFetch(() => jsonResponse({ n: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com");
    await expect(api.get("/cached", { useCache: true })).resolves.toEqual({ n: 1 });
    await expect(api.get("/cached", { useCache: true })).resolves.toEqual({ n: 1 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("caches HEAD when useCache is enabled", async () => {
    const fetchMock = mockFetch(() => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com");
    await api.request("HEAD", "/resource", { useCache: true });
    await api.request("HEAD", "/resource", { useCache: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("clearCache forces refetch", async () => {
    const fetchMock = mockFetch(() => jsonResponse({ n: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com");
    await api.get("/cached", { useCache: true });
    await api.clearCache("GET", "/cached");
    await api.get("/cached", { useCache: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not cache POST even when cacheTime is set on client", async () => {
    const fetchMock = mockFetch(() => jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com", {}, false, 30_000);
    const body = { email: "a@b.c" };

    await api.post("/login", { body });
    await api.post("/login", { body });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each(["POST", "PUT", "PATCH", "DELETE"] as const)(
    "does not cache %s when useCache is true",
    async (method) => {
      const fetchMock = mockFetch(() => jsonResponse({ ok: true }));
      vi.stubGlobal("fetch", fetchMock);

      const api = new HttpClient("https://api.example.com");
      const options = { useCache: true, body: { x: 1 } };

      await api.request(method, "/resource", options);
      await api.request(method, "/resource", options);

      expect(fetchMock).toHaveBeenCalledTimes(2);
    },
  );

  it("clearCache is a no-op for non-cacheable methods", async () => {
    const fetchMock = mockFetch(() => jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com");
    await api.post("/items", { body: { x: 1 }, useCache: true });
    await api.clearCache("POST", "/items", { body: { x: 1 } });
    await api.post("/items", { body: { x: 1 }, useCache: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("caches GET when cacheTime is set on client", async () => {
    const fetchMock = mockFetch(() => jsonResponse({ n: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com", {}, false, 30_000);

    await expect(api.get("/cached")).resolves.toEqual({ n: 1 });
    await expect(api.get("/cached")).resolves.toEqual({ n: 1 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("factory merges AbortSignal into requests", async () => {
    const fetchMock = mockFetch((_input, init) => {
      expect(init?.signal).toBeDefined();
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const api = new HttpClient("https://api.example.com");
    const controller = new AbortController();
    const client = api.factory(controller.signal);

    await client.get("/me");
  });
});
