import { RxScope } from "./rx-scope";
import {
  AbstractComponentConstructor,
  ComponentConnectedParams,
  ComponentsList,
  ComponentsRegistryState,
} from "./interfaces";
import { RuleCompleted } from "./router.service";

class ComponentsRegistryService {
  private instancesBySelector: ComponentsRegistryState = {};

  public componentsRoot: ComponentsList = [];
  public scopes: { [key: string]: RxScope<any> } = {};
  public listBySelector: Map<string, AbstractComponentConstructor> = new Map();

  constructor() { }

  removeComponents(components: ComponentsList, removeFromDom = false) {
    while (components.length) {
      const comp = components.pop();

      comp.disconnectedCallback(removeFromDom);
      componentsRegistryService.instancesBySelector[comp.selector].delete(
        comp.node
      );
    }
  }

  define(constructor: AbstractComponentConstructor) {
    this.listBySelector.set(constructor.selector, constructor);
  }

  connectBySelector(
    selector: string,
    componentsList: ComponentsList,
    rootNode: ParentNode = document,
    rule: RuleCompleted = null
  ) {
    const queryResult = (rootNode as HTMLElement).querySelectorAll(selector);
    const nodes = Array.from(queryResult) as Array<HTMLElement>;
    const connected: InstanceType<AbstractComponentConstructor>[] = [];

    if (nodes.length) {
      const cls = this.listBySelector.get(selector);

      if (!cls) {
        throw new Error(
          `${selector} component is not defined. Call componentsRegistryService.define(...)`
        );
      }

      for (const node of nodes) {
        this.instancesBySelector[selector] = this.instancesBySelector[selector] || new Map();
        let instance = this.instancesBySelector[selector].get(node);

        if (!instance) {
          instance = new cls();
          instance.selector = selector;
          instance.node = node;

          let params: ComponentConnectedParams = null;

          if (rule?.httpFactory) {
            params ??= {};
            params.httpFactory = rule.httpFactory;
          }

          if (rule?.params$) {
            params ??= {};
            params.routeParams$ = rule.params$;
          }

          try {
            instance.connectedCallback(params);
            componentsList.push(instance);
            this.instancesBySelector[selector].set(node, instance);
            connected.push(instance);
          } catch (e) {
            throw e;
          }
        }
      }
    }

    return connected;
  }

  initApp() {
    for (const key of this.listBySelector.keys()) {
      this.connectBySelector(key, this.componentsRoot);
    }
  }

  connectScope(scope: RxScope<any>) {
    this.scopes[scope.id] = scope;
  }

  disconnectScope(scope: RxScope<any>) {
    delete this.scopes[scope.id];
  }
}

export const componentsRegistryService = new ComponentsRegistryService();
