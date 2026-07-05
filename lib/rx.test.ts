import { describe, expect, it } from "vitest";
import { Rx, RxFunc } from "./rx";

async function flushMicrotasks() {
  await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
}

function cell<T>(value: T, fn: (v: T) => T = (v) => v) {
  const group: Rx<any>[] = [];
  const rx = new Rx(group, fn, value);
  rx.update(value);
  return { group, rx };
}

describe("Rx", () => {
  it("stores init value in actual", () => {
    const { rx } = cell("hello");
    expect(rx.actual).toBe("hello");
  });

  it("update applies fn to args", () => {
    const group: Rx<any>[] = [];
    const sum = new Rx(group, (a: number, b: number) => a + b, 0);

    sum.update(2, 3);

    expect(sum.actual).toBe(5);
  });

  it("update without fn sets actual to null", () => {
    const group: Rx<any>[] = [];
    const rx = new Rx(group, null, 42);

    rx.update(99);

    expect(rx.actual).toBeNull();
  });

  it("setPostUpdate runs callbacks on update", () => {
    const { rx } = cell(0);
    const seen: number[] = [];

    rx.setPostUpdate((r) => seen.push(r.actual));
    rx.update(1);
    rx.update(2);

    expect(seen).toEqual([1, 2]);
  });

  it("unsubscribe removes cell from group", () => {
    const { group, rx } = cell(1);
    const other = new Rx(group, (v: number) => v, 2);
    other.update(2);

    expect(group).toHaveLength(2);

    rx.unsubscribe();

    expect(group).toHaveLength(1);
    expect(group[0]).toBe(other);
  });
});

describe("RxFunc", () => {
  it("computes from deps when immediate", async () => {
    const { rx: count } = cell(2);
    const group: Rx<any>[] = [];
    const doubled = new RxFunc(group, (n: number) => n * 2, { immediate: true }, count);

    await flushMicrotasks();

    expect(doubled.actual).toBe(4);
  });

  it("recomputes after dep update on microtask", async () => {
    const { rx: count } = cell(1);
    const group: Rx<any>[] = [];
    const doubled = new RxFunc(group, (n: number) => n * 2, { immediate: true }, count);

    await flushMicrotasks();

    count.update(5);
    await flushMicrotasks();

    expect(doubled.actual).toBe(10);
  });

  it("coalesces multiple dep updates into one recompute", async () => {
    const { rx: count } = cell(0);
    const group: Rx<any>[] = [];
    let runs = 0;
    const doubled = new RxFunc(
      group,
      (n: number) => {
        runs++;
        return n * 2;
      },
      { immediate: true },
      count,
    );

    await flushMicrotasks();
    runs = 0;

    count.update(1);
    count.update(2);
    count.update(3);
    await flushMicrotasks();

    expect(runs).toBe(1);
    expect(doubled.actual).toBe(6);
  });

  it("unsubscribe stops reacting to dep changes", async () => {
    const { rx: count } = cell(1);
    const group: Rx<any>[] = [];
    const doubled = new RxFunc(group, (n: number) => n * 2, { immediate: true }, count);

    await flushMicrotasks();

    doubled.unsubscribe();
    count.update(99);
    await flushMicrotasks();

    expect(doubled.actual).toBe(2);
    expect(count.postUpdateFns).toBeNull();
  });
});
