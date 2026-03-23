import { BucketEvent, ComponentDescriptor } from "./interfaces";
import { Rx } from "./rx";

export class RxBucket<A> {
  static lastId = 0;
  public id: number;

  private values: Record<keyof A, { [index: string]: any }> = Object.create(null);
  private states: Record<keyof A, { [index: string]: any }> = Object.create(null);

  private rx = {
    eventsByNames: {} as {
      [id in keyof A]: {
        [index: string]: Rx<BucketEvent<any>>[];
      };
    },
    values: {} as Record<keyof A, Rx<any>[]>,
    states: {} as Record<keyof A, Rx<any>[]>,
    allValues: [] as Rx<Record<keyof A, { [index: string]: any }>>[],
    allStates: [] as Rx<Record<keyof A, { [index: string]: any }>>[],
  };

  private _ids: (keyof A)[] = [];

  constructor(
    public descriptors: { [K in keyof A]: ComponentDescriptor<A[K]> }
  ) {
    this.id = RxBucket.lastId++;
    this._ids = RxBucket.idsArr(descriptors);

    for (let index = 0; index < this._ids.length; index++) {
      const id = this._ids[index];
      this.initId(id);
    }
  }

  private initId(id: keyof A) {
    this.rx.values[id] = [];
    this.rx.states[id] = [];
    this.rx.eventsByNames[id] = Object.create(null);
    this.values[id] = Object.create(null);
    this.states[id] = Object.create(null);
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
    delete this.states[id];
    delete this.descriptors[id];
    delete this.rx.values[id];
    delete this.rx.states[id];
    delete this.rx.eventsByNames[id];
  }

  public getValue(id: keyof A, index: string = "0") {
    const value = this.values[id];

    if (!value) {
      throw new Error(`Bucket value bucket "${String(id)}" not found`);
    }

    return value[index];
  }

  public getState(id: keyof A, index: string = "0") {
    const state = this.states[id];

    if (!state) {
      throw new Error(`Bucket state bucket "${String(id)}" not found`);
    }

    return state[index];
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
    this.execRxs(this.rx.values[id], value, index+'', byUser);

    this.updateAllValues();
  }

  public setState(
    id: keyof A,
    value: any,
    index = '0',
    byUser = false
  ) {
    if (!this.states[id]) {
      throw new Error(
        `Cannot set state for unknown id "${id as string}" (descriptor not found)`
      );
    }

    (this.states[id] as { [index: string]: any })[index] = value;
    this.execRxs(this.rx.states[id], value, index+'', byUser);

    this.updateAllStates();
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
    return this._set(RxBucket.wrapAtIndex(values, index), byUser);
  }

  public setStates(
    states: Partial<Record<keyof A, { [index: string]: any }>>,
    byUser = false
  ) {
    return this._setStates(states, byUser);
  }

  public setStatesAtIndex<I extends string>(
    states: Partial<{ [id in keyof A]: any }>,
    index: I = "0" as I,
    byUser = false
  ) {
    return this._setStates(RxBucket.wrapAtIndex(states, index), byUser);
  }

  public newRxEvent<K extends keyof BucketEventMap, B>(
    id: keyof A,
    name: K,
    fn: (event: BucketEvent<BucketEventMap[K]>, index?: string) => B,
    rxList: Rx<any>[]
  ) {
    if (!this.values[id]) {
      throw new Error(
        `Cannot create event rx for unknown id "${id as string}" (descriptor not found)`
      );
    }

    const eventsById: { [key: string]: Rx<BucketEvent<BucketEventMap[K]>>[] } = this.rx.eventsByNames[id];

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

  public newRxAllStates(
    fn: (states: Record<keyof A, { [index: string]: any }>) => Record<keyof A, { [index: string]: any }>
  ) {
    return new Rx(this.rx.allStates, fn);
  }

  public newRxValue<B>(
    id: keyof A,
    fn: (value: any, index?: string, byUser?: boolean) => B,
    rxList: Rx<any>[]
  ) {
    if (!this.values[id]) {
      throw new Error(
        `Cannot create value rx for unknown id "${id as string}" (descriptor not found)`
      );
    }

    const rx = new Rx<any>(this.rx.values[id], fn);

    rxList.push(rx);

    return rx;
  }

  public newRxState<B>(
    id: keyof A,
    fn: (value: any, index?: string, byUser?: boolean) => B,
    rxList: Rx<any>[]
  ) {
    if (!this.states[id]) {
      throw new Error(
        `Cannot create state rx for unknown id "${id as string}" (descriptor not found)`
      );
    }

    const rx = new Rx<any>(this.rx.states[id], fn);

    rxList.push(rx);

    return rx;
  }

  public emitEvent<K extends keyof BucketEventMap>(
    id: keyof A,
    name: K,
    event: BucketEvent<BucketEventMap[K]>,
    index = '0',
  ) {
    if (!this.values[id]) {
      throw new Error(
        `Cannot emit event for unknown id "${id as string}" (descriptor not found)`
      );
    }

    if (this.rx.eventsByNames[id] && this.rx.eventsByNames[id][name]) {
      for (const rx of this.rx.eventsByNames[id][name]) rx.update(event, index);
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
        this.execRxs(this.rx.values[id], value[index], index, byUser);
      }
    }

    this.updateAllValues();
  }

  private _setStates(
    states: Partial<Record<keyof A, { [index: string]: any }>>,
    byUser: boolean
  ) {
    for (let id in states) {
      const state = states[id];

      if (!this.states[id]) {
        throw new Error(
          `Cannot set state for unknown id "${String(id)}" (descriptor not found)`
        );
      }

      for (let index in state) {
        this.states[id][index] = state[index];
        this.execRxs(this.rx.states[id], state[index], index, byUser);
      }
    }

    this.updateAllStates();
  }

  private updateAllValues() {
    let j = 0;
    while (j < this.rx.allValues.length) {
      this.rx.allValues[j].update(this.values);
      j++;
    }
  }

  private updateAllStates() {
    let j = 0;
    while (j < this.rx.allStates.length) {
      this.rx.allStates[j].update(this.states);
      j++;
    }
  }

  private execRxs(
    rxs: Rx<(value: any, index?: string, byUser?: boolean) => any>[],
    value: any,
    index: string,
    byUser: boolean,
  ) {
    for (let i = 0; i < rxs.length; i++) {
      const s = rxs[i];
      s.update(value, index, byUser);
    }
  }

  static idsArr<D>(descriptors: { [K in keyof D]: ComponentDescriptor<D[K]> }) {
    return Object.keys(descriptors) as (keyof D)[];
  }

  static ids<D>(descriptors: { [K in keyof D]: ComponentDescriptor<D[K]> }) {
    const acc: { [K in keyof D]: keyof D } = Object.create(null);
    const ids = RxBucket.idsArr(descriptors);

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
    return RxBucket.ids(this.descriptors);
  }

  public idsArr() {
    return RxBucket.idsArr(this.descriptors);
  }
}
