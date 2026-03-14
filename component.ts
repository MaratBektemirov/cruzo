import { componentsRegistryService } from "./components-registry.service";
import { IHttpClient, ComponentConnectedParams, ComponentsList, ScopeEvent } from "./interfaces";
import { Template } from "./template";

import { Rx, RxFunc } from "./rx";
import { RxScope } from "./rx-scope";

export abstract class AbstractComponent<Config = any, ValueType = any> {
  public id = '';
  public index = '';
  public selector = '';
  public node: HTMLElement = null;
  public http: { [key: string]: IHttpClient } = null;

  public config: Config = null;
  public outerScope: RxScope<any> = null;
  public innerScope: RxScope<any> = null;

  public destroyed = false;
  protected ac: AbortController = null;
  protected dependencies: Set<string> = null;

  public connectedDependencies: ComponentsList = null;
  public hasOuterScope = false;
  public hasConfig = false;
  public isDirective = false;

  public template: Template = null;

  public rxList: Rx<any>[] = null;

  public value$ = this.newRx<ValueType>();
  public value: ValueType = null;

  protected __tplFile = '';

  constructor() { }

  disconnectedCallback() {
    this.destroyed = true;

    if (this.ac) {
      this.ac.abort();
    }

    if (this.template) {
      this.template.fullDestroy();
    }

    if (this.node && !this.isDirective) {
      this.node.remove();
    }

    if (this.value$) {
      this.value$.unsubscribe();
    }

    if (this.connectedDependencies) {
      componentsRegistryService.removeComponents(this.connectedDependencies);
    }

    if (this.rxList) {
      while (this.rxList.length) {
        const rx = this.rxList.pop();
        rx.unsubscribe();
      }
    }

    if (this.innerScope) {
      componentsRegistryService.disconnectScope(this.innerScope);
    }
  }

  getScope() {
    const scopeId = this.getScopeId();

    const scope = componentsRegistryService.scopes[scopeId];

    if (scopeId && !scope) {
      throw new Error(
        `Scope "${scopeId}" not found for selector "${this.selector
        }" (component-id="${this.getId()}")`
      );
    }

    return scope;
  }

  public connectedCallback(params: ComponentConnectedParams = null) {
    this.syncId();
    this.setIndex();
    this.outerScope = this.getScope();

    if (this.outerScope) {
      const descriptor = this.outerScope.descriptors[this.id];

      if (this.hasConfig) {
        if (!descriptor) {
          throw new Error(
            `Descriptor not found for selector "${this.selector}" id "${this.id
            }" in scope "${this.getScopeId()}"`
          );
        }

        this.config = descriptor.config;

        if (!this.config) {
          this.config = {} as any;
        }
      }

      if (this.hasOuterScope) {
        this.rxList ??= [];

        this.outerScope.newRxValue(
          this.id,
          this.onUpdateValue,
          this.rxList,
        );
      }
    }

    if (this.innerScope) {
      componentsRegistryService.connectScope(this.innerScope);
    }

    if (!this.isDirective && !params?.disableTemplate) {
      this.initTemplate();
    }

    if (params?.httpFactory) {
      this.ac = new AbortController();

      const httpFactoryKeys = Object.keys(params.httpFactory);
      this.http = Object.create(null);

      for (const key of httpFactoryKeys) {
        this.http[key] = params.httpFactory[key](this.ac.signal);
      }
    }
  }

  setScopeId(id: string) {
    return this.node.setAttribute("scope-id", id);
  }

  getScopeId() {
    return this.node.getAttribute("scope-id");
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

  private onUpdateValue = (value: any, byUser: boolean, index: string) => {
    if (value !== this.value) {
      this.value = value;
      this.setValue(byUser);
    }

    return value;
  };

  protected getHTML() {
    return '';
  }

  protected setValue(byUser = false) {
    this.value = this.outerScope.getValue(this.id, this.index);
    this.value$.update(this.value);
  }

  protected updateDependencies() {
    if (!this.dependencies || !this.dependencies.size) return;

    if (this.connectedDependencies) {
      let toRemove: ComponentsList = null;
      this.connectedDependencies.length = 0;

      for (const comp of this.connectedDependencies) {
        if (document.contains(comp.node)) {
          this.connectedDependencies.push(comp);
        } else {
          toRemove ??= [];
          toRemove.push(comp);
        }
      }

      if (toRemove) {
        componentsRegistryService.removeComponents(toRemove);
      }
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
    for (const dep of dependencies) {
      this.dependencies.add(dep);
    }
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
    cb: (...values: { [K in keyof A]: A[K]["value"] }) => RR,
    ...deps: A
  ) {
    this.rxList ??= [];

    return new RxFunc(this.rxList, cb, { immediate: true }, ...deps);
  }

  public newRxValueFromScope<A>(scope: RxScope<A>, id: keyof A) {
    this.rxList ??= [];

    return scope.newRxValue(id, (value) => value, this.rxList)
  }

  public newRxEventFromScope<A, K extends keyof ScopeEventMap>(scope: RxScope<A>, id: keyof A, name: K) {
    this.rxList ??= [];

    return scope.newRxEvent(id, name, (value) => value, this.rxList)
  }

  public newRxValueFromScopeByIndex<A>(scope: RxScope<A>, id: keyof A) {
    this.rxList ??= [];

    const acc: Record<string, any> = {};

    return scope.newRxValue(id, (value, byUser, index) => {
      acc[index] = value;
      return acc;
    }, this.rxList)
  }

  public newRxEventFromScopeByIndex<A, K extends keyof ScopeEventMap>(scope: RxScope<A>, id: keyof A, name: K) {
    this.rxList ??= [];

    const acc: Record<string, ScopeEvent<ScopeEventMap[K]>> = {};

    return scope.newRxEvent(id, name, (event, index) => {
      acc[index] = event;
      return acc;
    }, this.rxList)
  }
}
