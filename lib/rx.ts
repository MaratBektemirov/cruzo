export class Rx<A, Args extends any[] = any[]> {
  public actual: A = null as any;
  private groupIndex: number = null as any;

  public postUpdateFns?: Set<(rx: Rx<any>) => any> = null;

  constructor(private group: Rx<any>[], public fn: (...args: Args) => A = null) {
    this.groupIndex = this.group.length;
    this.group.push(this);
  }

  public update(...args: Args) {
    this.actual = typeof this.fn === "function" ? this.fn(...args) : null;

    if (!this.postUpdateFns) return;

    for (const fn of this.postUpdateFns) fn(this);
  }

  public setPostUpdate(fn: (value: Rx<any>) => any) {
    this.postUpdateFns ??= new Set();
    this.postUpdateFns.add(fn);
  }

  unsubscribe() {
    const i = this.groupIndex;
    const last = this.group.pop();
    if (i < this.group.length) {
      this.group[i] = last!;
      last.groupIndex = i;
    }
  }
}

export class RxFunc<A> extends Rx<A> {
  private readonly deps: Rx<any>[];
  private updateScheduled = false;

  public update = () => {
    if (this.updateScheduled) return;

    this.updateScheduled = true;

    queueMicrotask(() => {
      super.update(...this.deps.map(d => d.actual))
      this.updateScheduled = false;
    });
  };

  constructor(
    group: Rx<any>[],
    fn: (...args: any[]) => A,
    opts?: { immediate?: boolean },
    ...deps: Rx<any>[]
  ) {
    super(group, fn);
    this.deps = deps;

    for (const dep of deps) dep.setPostUpdate(this.update);

    if (opts?.immediate) {
      this.update();
    }
  }

  override unsubscribe() {
    for (const dep of this.deps) {
      dep.postUpdateFns?.delete(this.update);

      if (dep.postUpdateFns?.size === 0) {
        dep.postUpdateFns = null;
      }
    }

    super.unsubscribe();
  }
}

