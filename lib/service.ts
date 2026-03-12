import { Rx, RxFunc } from "./rx";

export abstract class AbstractService {
  rxList: Rx<(value: any) => any>[] = null;

  constructor() {}

  public newRx<T>(initial: T = null) {
    this.rxList ??= [];

    const sub = new Rx(this.rxList, (v: T) => v);

    sub.update(initial);
    return sub;
  }

  public newRxFunc<RR, A extends readonly Rx<any>[]>(
    cb: (...values: { [K in keyof A]: A[K]["actual"] }) => RR,
    ...deps: A
  ) {
    this.rxList ??= [];

    return new RxFunc(this.rxList, cb, { immediate: true }, ...deps);
  }
}
