import { ComponentDescriptor, ScopeEvent } from "./interfaces";
import { Rx } from "./rx";

export class RxScope<A> {
  static lastId = 0;
  public id: number;

  private values: Record<keyof A, { [index: string]: any }> = Object.create(null);

  private rx = {
    eventsByNames: {} as {
      [id in keyof A]: {
        [index: string]: Rx<ScopeEvent<any>>[];
      };
    },
    values: {} as Record<keyof A, Rx<any>[]>,
    allValues: [] as Rx<Record<keyof A, { [index: string]: any }>>[],
  };

  private _ids: (keyof A)[] = [];

  constructor(
    public descriptors: { [K in keyof A]: ComponentDescriptor<A[K]> }
  ) {
    this.id = RxScope.lastId++;
    this._ids = RxScope.idsArr(descriptors);

    for (let index = 0; index < this._ids.length; index++) {
      const id = this._ids[index];
      this.initId(id);
    }
  }

  private initId(id: keyof A) {
    this.rx.values[id] = [];
    this.rx.eventsByNames[id] = Object.create(null);
    this.values[id] = Object.create(null);
  }

  public addDescriptor(id: keyof A, descriptor: ComponentDescriptor<any>) {
    if (this.descriptors[id]) {
      throw new Error(`Descriptor "${String(id)}" already exists`);
    }

    this._ids.push(id as any);
    this.descriptors[id] = descriptor;

    this.initId(id);
  }

  public removeDescriptor(id: keyof A) {
    const index = this._ids.indexOf(id as any);

    if (index === -1) throw new Error(`Descriptor "${String(id)}" not found`);
    this._ids.splice(index, 1);

    delete this.values[id];
    delete this.descriptors[id];
    delete this.rx.values[id];
    delete this.rx.eventsByNames[id];
  }

  public getValue(id: keyof A, index: string = "0") {
    const value = this.values[id];

    if (!value) {
      throw new Error(`Scope value bucket "${String(id)}" not found`);
    }

    return value[index];
  }

  public setValue(
    id: keyof A,
    value: any,
    index = '0',
    byUser = false
  ) {
    if (!this.values[id]) {
      throw new Error(
        `Cannot set for unknown id "${id as string}" (descriptor not found)`
      );
    }

    (this.values[id] as { [index: string]: any })[index] = value;
    this.execSubs(this.rx.values[id], value, byUser, index);

    this.updateAllValues();
  }

  public setValues(
    values: Partial<Record<keyof A, { [index: string]: any }>>,
    byUser = false
  ) {
    return this._set(values, byUser);
  }

  public setValuesAtIndex<I extends string>(
    values: Partial<{ [id in keyof A]: any }>,
    index: I = "0" as I,
    byUser = false
  ) {
    return this._set(RxScope.wrapAtIndex(values, index), byUser);
  }

  public newRxEvent<K extends keyof ScopeEventMap, B>(
    id: keyof A,
    name: K,
    fn: (event: ScopeEvent<ScopeEventMap[K]>, index: string) => B,
    rxList: Rx<any>[]
  ) {
    const eventsById: { [key: string]: Rx<ScopeEvent<ScopeEventMap[K]>>[] } = this.rx.eventsByNames[id];

    eventsById[name] = eventsById[name] || [];

    const rx = new Rx(eventsById[name], fn);

    rxList.push(rx);

    return rx;
  }

  public newRxAllValues(
    fn: (values: Record<keyof A, { [index: string]: any }>) => Record<keyof A, { [index: string]: any }>
  ) {
    return new Rx(this.rx.allValues, fn);
  }

  public newRxValue<B>(
    id: keyof A,
    fn: (value: any, byUser: boolean, index: string) => B,
    rxList: Rx<any>[]
  ) {
    const rx = new Rx<any>(this.rx.values[id], fn);

    rxList.push(rx);

    return rx;
  }

  public emitEvent<K extends keyof ScopeEventMap>(
    id: keyof A,
    index: string,
    name: K,
    event: ScopeEvent<ScopeEventMap[K]>
  ) {
    if (this.rx.eventsByNames[id] && this.rx.eventsByNames[id][name]) {
      for (const sub of this.rx.eventsByNames[id][name]) {
        sub.update(event, index);
      }
    }
  }

  private _set(
    values: Partial<Record<keyof A, { [index: string]: any }>>,
    byUser: boolean
  ) {
    for (let id in values) {
      const value = values[id];

      if (!this.values[id]) {
        throw new Error(
          `Cannot set for unknown id "${String(id)}" (descriptor not found)`
        );
      }

      for (let index in value) {
        this.values[id][index] = value[index];
        this.execSubs(this.rx.values[id], value[index], byUser, index);
      }
    }

    this.updateAllValues();
  }

  private updateAllValues() {
    let j = 0;
    while (j < this.rx.allValues.length) {
      this.rx.allValues[j].update(this.values);
      j++;
    }
  }

  private execSubs(
    subs: Rx<(value: any, byUser: boolean, index: string) => any>[],
    value: any,
    byUser: boolean,
    index: string
  ) {
    for (let i = 0; i < subs.length; i++) {
      const s = subs[i];
      s.update(value, byUser, index);
    }
  }

  static idsArr<D>(descriptors: { [K in keyof D]: ComponentDescriptor<D[K]> }) {
    return Object.keys(descriptors) as (keyof D)[];
  }

  static ids<D>(descriptors: { [K in keyof D]: ComponentDescriptor<D[K]> }) {
    const acc: { [K in keyof D]: keyof D } = Object.create(null);
    const ids = RxScope.idsArr(descriptors);

    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];
      acc[id] = id;
    }

    return acc;
  }

  static wrapAtIndex<A, I extends string>(
    values: Partial<{ [id in keyof A]: any }>,
    index: I = "0" as I
  ): Partial<{
    [id in keyof A]: Record<I, any>;
  }> {
    const acc = Object.create(null);

    for (let id in values) {
      acc[id] = { [index]: values[id] };
    }

    return acc;
  }

  public ids() {
    return RxScope.ids(this.descriptors);
  }

  public idsArr() {
    return RxScope.idsArr(this.descriptors);
  }
}
