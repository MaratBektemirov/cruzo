import { describe, expect, it } from "vitest";
import { Rx } from "./rx";
import { RxBucket } from "./rx-bucket";

declare global {
  interface BucketEventMap {
    testEvent: { msg: string };
  }
}

type TestBucket = {
  input: { placeholder: string };
  select: { items: string[] };
  rowSpinner: { size: string };
};

function makeBucket() {
  return new RxBucket<TestBucket>({
    input: { config: { placeholder: "Search" } },
    select: { config: { items: [] } },
    rowSpinner: { config: { size: "4px" } },
  });
}

describe("RxBucket", () => {
  it("assigns incrementing id and exposes descriptor config rx", () => {
    const bucket = makeBucket();

    expect(typeof bucket.id).toBe("number");
    expect(bucket.getConfigRx("input").actual).toEqual({ placeholder: "Search" });
  });

  it("setValue / getValue stores value by index", () => {
    const bucket = makeBucket();

    bucket.setValue("input", "hello");
    bucket.setValue("input", "second", "1");

    expect(bucket.getValue("input")).toBe("hello");
    expect(bucket.getValue("input", "1")).toBe("second");
  });

  it("setValuesAtIndex updates multiple ids at once", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const input$ = bucket.newRxValue("input", (v) => v, rxList);
    const select$ = bucket.newRxValue("select", (v) => v, rxList);

    bucket.setValuesAtIndex({ input: "q", select: ["a", "b"] });

    expect(bucket.getValue("input")).toBe("q");
    expect(bucket.getValue("select")).toEqual(["a", "b"]);
    expect(input$.actual).toBe("q");
    expect(select$.actual).toEqual(["a", "b"]);
  });

  it("newRxValue receives updates from setValue", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    let lastByUser: boolean | undefined;

    const value$ = bucket.newRxValue(
      "input",
      (v, _index, byUser) => {
        lastByUser = byUser;
        return v;
      },
      rxList,
    );

    bucket.setValue("input", "typed", "0", true);

    expect(value$.actual).toBe("typed");
    expect(lastByUser).toBe(true);
  });

  it("setState / newRxState notifies subscribers", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const state$ = bucket.newRxState("input", (v) => v, rxList, "idle");

    bucket.setState("input", "loading");

    expect(bucket.getState("input")).toBe("loading");
    expect(state$.actual).toBe("loading");
  });

  it("setConfig updates config rx and descriptor", () => {
    const bucket = makeBucket();
    const config$ = bucket.getConfigRx("input");

    bucket.setConfig("input", { placeholder: "Filter" });

    expect(bucket.descriptors.input.config).toEqual({ placeholder: "Filter" });
    expect(config$.actual).toEqual({ placeholder: "Filter" });
  });

  it("emitEvent runs event rx handlers", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const event$ = bucket.newRxEvent(
      "input",
      "testEvent",
      (event) => event.data?.msg ?? "",
      rxList,
    );

    bucket.emitEvent("input", "testEvent", { data: { msg: "ok" } });

    expect(event$.actual).toBe("ok");
  });

  it("throws on unknown id", () => {
    const bucket = makeBucket();

    expect(() => bucket.setValue("missing" as keyof TestBucket, 1)).toThrow(/unknown id/);
    expect(() => bucket.newRxValue("missing" as keyof TestBucket, (v) => v, [])).toThrow(/unknown id/);
    expect(() => bucket.emitEvent("missing" as keyof TestBucket, "testEvent", {})).toThrow(/unknown id/);
    expect(() => bucket.removeIndex("missing" as keyof TestBucket, "0")).toThrow(/unknown id/);
  });

  it("removeIndex drops value, state, and per-index rx lists for one id", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const value$ = bucket.newRxValue("input", (v) => v, rxList, null, "1");
    const state$ = bucket.newRxState("input", (v) => v, rxList, "idle", "1");

    bucket.setValue("input", "a", "0");
    bucket.setValue("input", "b", "1");
    bucket.setState("input", "busy", "1");

    bucket.removeIndex("input", "1");

    expect(bucket.getValue("input", "0")).toBe("a");
    expect(bucket.getValue("input", "1")).toBeUndefined();
    expect(bucket.getState("input", "1")).toBeUndefined();
    expect(value$.actual).toBe("b");
    expect(state$.actual).toBe("busy");
  });
});

describe("RxBucket.newRxValueAll / newRxStateAll", () => {
  it("newRxValueAll receives the full map from setValue", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const all$ = bucket.newRxValueAll("input", (v) => v, rxList);

    bucket.setValue("input", "a", "0");
    bucket.setValue("input", "b", "1");

    expect(all$.actual).toEqual({ "0": "a", "1": "b" });
  });

  it("newRxValueAll receives the full map from setValues, not only the batch delta", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const all$ = bucket.newRxValueAll("input", (v) => v, rxList);

    bucket.setValue("input", "keep", "0");
    bucket.setValues({ input: { "1": "added" } });

    expect(all$.actual).toEqual({ "0": "keep", "1": "added" });
  });

  it("newRxStateAll receives updates from setState and setStates", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const all$ = bucket.newRxStateAll("input", (v) => v, rxList);

    bucket.setState("input", "loading", "0");
    expect(all$.actual).toEqual({ "0": "loading" });

    bucket.setStates({ input: { "1": "done" } });
    expect(all$.actual).toEqual({ "0": "loading", "1": "done" });
  });

  it("throws on unknown id", () => {
    const bucket = makeBucket();

    expect(() =>
      bucket.newRxValueAll("missing" as keyof TestBucket, (v) => v, []),
    ).toThrow(/unknown id/);
    expect(() =>
      bucket.newRxStateAll("missing" as keyof TestBucket, (v) => v, []),
    ).toThrow(/unknown id/);
  });
});

describe("RxBucket.setValuesAtIndex", () => {
  it("writes all ids to the same custom index", () => {
    const bucket = makeBucket();

    bucket.setValuesAtIndex({ input: "row-a", select: ["x"] }, "2");

    expect(bucket.getValue("input", "2")).toBe("row-a");
    expect(bucket.getValue("select", "2")).toEqual(["x"]);
    expect(bucket.getValue("input", "0")).toBeUndefined();
  });

  it("notifies value rx subscribers with scalar payload, not index wrapper", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const payload = { words: [{ id: "1", title: "alpha" }] };

    const task$ = bucket.newRxValue("input", (v) => v, rxList, null, "0");

    bucket.setValuesAtIndex({ input: payload });

    expect(bucket.getValue("input")).toEqual(payload);
    expect(task$.actual).toEqual(payload);
    expect(task$.actual).not.toHaveProperty("0");
  });

  it("updates only listed ids and leaves others untouched", () => {
    const bucket = makeBucket();

    bucket.setValue("input", "keep-me");
    bucket.setValue("select", ["old"]);

    bucket.setValuesAtIndex({ select: ["new"] });

    expect(bucket.getValue("input")).toBe("keep-me");
    expect(bucket.getValue("select")).toEqual(["new"]);
  });

  it("notifies per-index subscribers independently", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const at0$ = bucket.newRxValue("rowSpinner", (v) => v, rxList, "idle", "0");
    const at1$ = bucket.newRxValue("rowSpinner", (v) => v, rxList, "idle", "1");
    const at2$ = bucket.newRxValue("rowSpinner", (v) => v, rxList, "idle", "2");

    bucket.setValuesAtIndex({ rowSpinner: "active-0" }, "0");
    bucket.setValuesAtIndex({ rowSpinner: "active-2" }, "2");

    expect(at0$.actual).toBe("active-0");
    expect(at1$.actual).toBe("idle");
    expect(at2$.actual).toBe("active-2");
    expect(bucket.getValue("rowSpinner", "0")).toBe("active-0");
    expect(bucket.getValue("rowSpinner", "1")).toBeUndefined();
    expect(bucket.getValue("rowSpinner", "2")).toBe("active-2");
  });

  it("passes byUser flag to subscribers", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const seen: boolean[] = [];

    bucket.newRxValue(
      "input",
      (_v, _index, byUser) => {
        seen.push(!!byUser);
        return _v;
      },
      rxList,
    );
    bucket.newRxValue(
      "select",
      (_v, _index, byUser) => {
        seen.push(!!byUser);
        return _v;
      },
      rxList,
    );

    bucket.setValuesAtIndex({ input: "a", select: ["b"] }, "0", true);

    expect(seen).toEqual([true, true]);
  });

  it("can batch multiple ids at non-default index in one call", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const input$ = bucket.newRxValue("input", (v) => v, rxList, null, "5");
    const spinner$ = bucket.newRxValue("rowSpinner", (v) => v, rxList, null, "5");

    bucket.setValuesAtIndex(
      {
        input: "zepto-row",
        rowSpinner: "active",
      },
      "5",
    );

    expect(bucket.getValue("input", "5")).toBe("zepto-row");
    expect(bucket.getValue("rowSpinner", "5")).toBe("active");
    expect(input$.actual).toBe("zepto-row");
    expect(spinner$.actual).toBe("active");
  });
});

describe("RxBucket.setValues — multi-index", () => {
  it("updates several indices on one id in a single call", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const s0$ = bucket.newRxValue("rowSpinner", (v) => v, rxList, "idle", "0");
    const s1$ = bucket.newRxValue("rowSpinner", (v) => v, rxList, "idle", "1");
    const s5$ = bucket.newRxValue("rowSpinner", (v) => v, rxList, "idle", "5");

    bucket.setValues({
      rowSpinner: {
        "0": "active",
        "1": "inactive",
        "5": "active",
      },
    });

    expect(bucket.getValue("rowSpinner", "0")).toBe("active");
    expect(bucket.getValue("rowSpinner", "1")).toBe("inactive");
    expect(bucket.getValue("rowSpinner", "5")).toBe("active");
    expect(s0$.actual).toBe("active");
    expect(s1$.actual).toBe("inactive");
    expect(s5$.actual).toBe("active");
  });

  it("updates multiple ids with different index maps at once", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const input0$ = bucket.newRxValue("input", (v) => v, rxList, null, "0");
    const input1$ = bucket.newRxValue("input", (v) => v, rxList, null, "1");
    const spinner3$ = bucket.newRxValue("rowSpinner", (v) => v, rxList, null, "3");

    bucket.setValues({
      input: { "0": "a", "1": "b" },
      rowSpinner: { "3": "spinning" },
    });

    expect(input0$.actual).toBe("a");
    expect(input1$.actual).toBe("b");
    expect(spinner3$.actual).toBe("spinning");
    expect(bucket.getValue("input", "0")).toBe("a");
    expect(bucket.getValue("input", "1")).toBe("b");
    expect(bucket.getValue("rowSpinner", "3")).toBe("spinning");
  });

  it("does not pass index map object to rx subscriber (regression)", () => {
    const bucket = makeBucket();
    const rxList: Rx<any>[] = [];
    const s5$ = bucket.newRxValue("rowSpinner", (v) => v, rxList, null, "5");

    bucket.setValues({
      rowSpinner: {
        "5": "active",
        "7": "inactive",
      },
    });

    expect(s5$.actual).toBe("active");
    expect(s5$.actual).not.toEqual({ "5": "active", "7": "inactive" });
  });
});

describe("RxBucket.wrapAtIndex", () => {
  it("wraps flat id map into index records", () => {
    expect(RxBucket.wrapAtIndex({ input: "a", select: ["b"] }, "0")).toEqual({
      input: { "0": "a" },
      select: { "0": ["b"] },
    });
  });

  it("wraps all ids to the same custom index", () => {
    expect(
      RxBucket.wrapAtIndex({ input: "x", rowSpinner: "active" }, "5"),
    ).toEqual({
      input: { "5": "x" },
      rowSpinner: { "5": "active" },
    });
  });
});
