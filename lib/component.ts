import { componentsRegistryService } from "./components-registry.service";
import { BucketEvent, ComponentConnectedParams, ComponentsList, IHttpClient } from "./interfaces";
import { Template } from "./template";

import { Rx, RxFunc } from "./rx";
import { RxBucket } from "./rx-bucket";

export abstract class AbstractComponent<Config = any, ValueType = any, StateType = any> {
  public id = '';
  public index = '';
  public selector = '';
  public node: HTMLElement = null;
  public http: { [key: string]: IHttpClient } = null;

  public config: Config = null;
  public outerBucket: RxBucket<any> = null;
  public innerBucket: RxBucket<any> = null;

  public destroyed = false;
  protected ac: AbortController = null;
  protected dependencies: Set<string> = null;

  public connectedDependencies: ComponentsList = null;
  public hasOuterBucket = false;
  public hasConfig = false;
  public isDirective = false;

  public template: Template = null;

  public rxList: Rx<any>[] = null;

  public value$ = this.newRx<ValueType>();
  public value: ValueType = null;

  public state$ = this.newRx<StateType>();
  public state: StateType = null;

  protected __tplFile = '';

  constructor() {}

  disconnectedCallback(removeFromDom = false) {
    this.destroyed = true;

    if (this.ac) this.ac.abort()

    if (this.template) this.template.fullDestroy()

    if (removeFromDom && this.node && !this.isDirective) this.node.remove()

    if (this.value$) this.value$.unsubscribe()

    if (this.state$) this.state$.unsubscribe()

    if (this.connectedDependencies) componentsRegistryService.removeComponents(this.connectedDependencies)

    if (this.rxList) while (this.rxList.length) this.rxList.pop().unsubscribe()

    if (this.innerBucket) componentsRegistryService.disconnectBucket(this.innerBucket)
  }

  getBucket() {
    const bucketId = this.getBucketId();

    const bucket = componentsRegistryService.buckets[bucketId];

    if (bucketId && !bucket) {
      throw new Error(
        `Bucket "${bucketId}" not found for selector "${this.selector
        }" (component-id="${this.getId()}")`
      );
    }

    return bucket;
  }

  public connectedCallback(params: ComponentConnectedParams = null) {
    this.syncId();
    this.setIndex();
    this.outerBucket = this.getBucket();

    if (this.outerBucket) {
      const descriptor = this.outerBucket.descriptors[this.id];

      if (this.hasConfig) {
        if (!descriptor) {
          throw new Error(
            `Descriptor not found for selector "${this.selector}" id "${this.id}" in bucket "${this.getBucketId()}"`
          );
        }

        if (!descriptor.config) {
          throw new Error(
            `Config in descriptor not found for selector "${this.selector}" id "${this.id}" in bucket "${this.getBucketId()}"`
          );
        }

        this.config = descriptor.config;
      }

      if (this.hasOuterBucket) {
        this.rxList ??= [];

        this.setValue();

        this.outerBucket.newRxValue(
          this.id,
          this.onUpdateValue,
          this.rxList,
          this.outerBucket.getValue(this.id, this.index),
          this.index
        );

        this.setState();

        this.outerBucket.newRxState(
          this.id,
          this.onUpdateState,
          this.rxList,
          this.outerBucket.getState(this.id, this.index),
          this.index
        );
      }
    }

    if (this.innerBucket) componentsRegistryService.connectBucket(this.innerBucket)

    if (!this.isDirective && !params?.disableTemplate) this.initTemplate()

    if (params?.httpFactory) {
      this.ac = new AbortController();

      const httpFactoryKeys = Object.keys(params.httpFactory);
      this.http = Object.create(null);

      for (const key of httpFactoryKeys) {
        this.http[key] = params.httpFactory[key](this.ac.signal);
      }
    }
  }

  setBucketId(id: string) {
    return this.node.setAttribute("bucket-id", id);
  }

  getBucketId() {
    return this.node.getAttribute("bucket-id");
  }

  public setId(id: string) {
    this.node.setAttribute("component-id", id);
    this.syncId();
  }

  public getId() {
    return this.node.getAttribute("component-id");
  }

  public getIndex() {
    return this.node.getAttribute("component-index");
  }

  private syncId() {
    this.id = this.getId();
  }

  private setIndex() {
    this.index = this.getIndex() || "0";
  }

  private onUpdateValue = (value: any, index: string, byUser: boolean) => {
    if (this.index !== index || this.value === value) return;

    this.setValue(byUser);
  };

  private onUpdateState = (state: any, index: string, byUser: boolean) => {
    if (this.index !== index || this.state === state) return;

    this.setState(byUser);
  };

  protected getHTML() {
    return '';
  }

  protected setValue(byUser = false) {
    this.value = this.outerBucket.getValue(this.id, this.index);
    this.value$.update(this.value);
  }

  protected setState(byUser = false) {
    this.state = this.outerBucket.getState(this.id, this.index);
    this.state$.update(this.state);
  }

  protected updateDependencies() {
    if (!this.dependencies || !this.dependencies.size) return;

    if (this.connectedDependencies) {
      let removed: ComponentsList = null;
      let connected: ComponentsList = null;

      for (const comp of this.connectedDependencies) {
        if (document.contains(comp.node)) {
          connected ??= [];
          connected.push(comp);
        } else {
          removed ??= [];
          removed.push(comp);
        }
      }

      this.connectedDependencies = connected;

      if (removed) componentsRegistryService.removeComponents(removed)
    }

    for (const selector of this.dependencies) this.connectDependency(selector);
  }

  public connectDependency(selector: string) {
    this.connectedDependencies ??= [];

    return componentsRegistryService.connectBySelector(
      selector,
      this.connectedDependencies,
      this.node
    );
  }

  addDependencies(dependencies: string[]) {
    this.dependencies ??= new Set();

    for (const dep of dependencies) this.dependencies.add(dep)
  }

  protected initTemplate() {
    const html = this.getHTML();

    if (html) {
      this.node.innerHTML = html;
      this.template = new Template({
        node: this.node,
        self: () => this,
        selector: this.selector,
        __tplFile: this.__tplFile,
        domStructureChanged: () => {
          this.domStructureChanged();
        },
      });
      this.template.detectChanges();
      this.updateDependencies();
    }
  }

  protected domStructureChanged() {
    this.updateDependencies();
  }

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

  public newRxEventFromBucket<A, K extends keyof BucketEventMap>(bucket: RxBucket<A>, id: keyof A, name: K) {
    this.rxList ??= [];

    return bucket.newRxEvent(id, name, (value) => value, this.rxList)
  }

  public newRxValueFromBucket<A>(bucket: RxBucket<A>, id: keyof A, index = '0') {
    this.rxList ??= [];

    return bucket.newRxValue(id, (value) => value, this.rxList, bucket.getValue(id, index), index)
  }

  public newRxStateFromBucket<A>(bucket: RxBucket<A>, id: keyof A, index = '0') {
    this.rxList ??= [];

    return bucket.newRxState(id, (value) => value, this.rxList, bucket.getState(id, index), index)
  }

  public newRxEventFromBucketByIndex<A, K extends keyof BucketEventMap>(bucket: RxBucket<A>, id: keyof A, name: K) {
    this.rxList ??= [];

    const acc: Record<string, BucketEvent<BucketEventMap[K]>> = {};

    return bucket.newRxEvent(id, name, (event, index) => {
      acc[index] = event;
      return acc;
    }, this.rxList)
  }
}
