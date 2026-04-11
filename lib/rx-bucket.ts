import { BucketEvent, ComponentDescriptor } from "./interfaces";
import { Rx } from "./rx";

export class RxBucket<A> {
  static lastId = 0;
  public id: number;

  private values: Record<keyof A, { [index: string]: any }> = Object.create(null);
  private states: Record<keyof A, { [index: string]: any }> = Object.create(null);

  private rx = {
    eventsByNames: {} as Record<keyof A, Record<string, Rx<BucketEvent<any>>[]>>,
    valuesByIndex: {} as Record<keyof A, Record<string, Rx<any>[]>>,
    statesByIndex: {} as Record<keyof A, Record<string, Rx<any>[]>>,
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
    this.rx.valuesByIndex[id] = {};
    this.rx.statesByIndex[id] = {};
    this.rx.eventsByNames[id] = Object.create(null);
    this.values[id] = Object.create(null);
    this.states[id] = Object.create(null);
  }

  public addDescriptor(id: keyof A, descriptor: ComponentDescriptor<any>) {
    if (this.descriptors[id]) throw new Error(`Descriptor "${String(id)}" already exists`)

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
    delete this.rx.valuesByIndex[id];
    delete this.rx.statesByIndex[id];
    delete this.rx.eventsByNames[id];
  }

  public getValue(id: keyof A, index: string = "0") {
    const value = this.values[id];

    if (!value) throw new Error(`Bucket value bucket "${String(id)}" not found`)

    return value[index];
  }

  public getState(id: keyof A, index: string = "0") {
    const state = this.states[id];

    if (!state) throw new Error(`Bucket state bucket "${String(id)}" not found`)

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
    this.execRxs(this.rx.valuesByIndex[id][index], value, index+'', byUser);
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
    this.execRxs(this.rx.statesByIndex[id][index], value, index+'', byUser);
  }

  public setValues(
    values: Partial<Record<keyof A, { [index: string]: any }>>,
    byUser = false
  ) {
    return this._setValues(values, byUser);
  }

  public setValuesAtIndex<I extends string>(
    values: Partial<{ [id in keyof A]: any }>,
    index: I = "0" as I,
    byUser = false
  ) {
    return this._setValues(RxBucket.wrapAtIndex(values, index), byUser);
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

  public newRxValue<B>(
    id: keyof A,
    fn: (value: any, index?: string, byUser?: boolean) => B,
    rxList: Rx<any>[],
    initValue: any = null,
    index = '0'
  ) {
    if (!this.values[id]) {
      throw new Error(
        `Cannot create value rx for unknown id "${id as string}" (descriptor not found)`
      );
    }

    const record = this.rx.valuesByIndex[id] as Record<string, Rx<any>[]>;
    if (!record[index]) record[index] = [];

    const rxIndex = new Rx<any>(record[index], fn, initValue);
    rxList.push(rxIndex);

    return rxIndex;
  }

  public newRxState<B>(
    id: keyof A,
    fn: (value: any, index?: string, byUser?: boolean) => B,
    rxList: Rx<any>[],
    initValue: any = null,
    index = '0'
  ) {
    if (!this.states[id]) {
      throw new Error(
        `Cannot create state rx for unknown id "${id as string}" (descriptor not found)`
      );
    }

    const record = this.rx.statesByIndex[id] as Record<string, Rx<any>[]>;
    if (!record[index]) record[index] = [];

    const rxIndex = new Rx<any>(record[index], fn, initValue);
    rxList.push(rxIndex);

    return rxIndex;
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

  private _setValues(
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
        this.execRxs(this.rx.valuesByIndex[id][index], value, index+'', byUser);
      }
    }
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
        this.execRxs(this.rx.statesByIndex[id][index], state[index], index, byUser);
      }
    }
  }

  private execRxs(
    rxs: Rx<(value: any, index?: string, byUser?: boolean) => any>[],
    value: any,
    index: string,
    byUser: boolean,
  ) {
    if (!rxs) return

    for (let i = 0; i < rxs.length; i++) rxs[i].update(value, index, byUser)
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

    for (let id in values) acc[id] = { [index]: values[id] }

    return acc;
  }

  public ids() {
    return RxBucket.ids(this.descriptors);
  }

  public idsArr() {
    return RxBucket.idsArr(this.descriptors);
  }
}