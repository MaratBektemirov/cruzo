import { RxBucket } from "./rx-bucket";
import {
  AbstractComponentConstructor,
  ComponentConnectedParams,
  ComponentsList,
  ComponentsRegistryState,
} from "./types/interfaces";
import type { RuleCompleted } from "./types/router-types";

class ComponentsRegistryService {
  private instancesBySelector: ComponentsRegistryState = {};

  public componentsRoot: ComponentsList = [];
  public buckets: { [key: string]: RxBucket<any> } = {};
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
    const selector = constructor.selector;
    const prev = this.listBySelector.get(selector);

    if (prev && prev !== constructor) {
      const prevName = prev.name || "anonymous class";
      const nextName = constructor.name || "anonymous class";

      console.warn(
        `[cruzo] Component "${selector}" is already defined (${prevName}). ` +
        `It will be overridden by ${nextName}.`
      );
    }

    this.listBySelector.set(selector, constructor);
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

  connectBucket(bucket: RxBucket<any>) {
    this.buckets[bucket.id] = bucket;
  }

  disconnectBucket(bucket: RxBucket<any>) {
    delete this.buckets[bucket.id];
  }

  private errorsHandled = false;

  handleErrors() {
    if (this.errorsHandled || typeof window === "undefined") return;

    this.errorsHandled = true;

    window.addEventListener("error", (e) => {
      this.hintIfSelectorTdz(e.message, e.error, e.filename, e.lineno);
    });

    window.addEventListener("unhandledrejection", (e) => {
      const reason = e.reason;
      const message = reason instanceof Error ? reason.message : String(reason ?? "");

      this.hintIfSelectorTdz(message, reason);
    });
  }

  private async hintIfSelectorTdz(message: string, error: unknown, file?: string, line?: number) {
    if (!/before initialization|Cannot access uninitialized variable/i.test(message)) return;

    const stack = error instanceof Error ? error.stack : "";
    const fromStack = stack.match(/((?:https?:\/\/|file:\/\/|\/).+\.(?:[cm]?[jt]sx?)):(\d+):\d+/);
    const url = file || fromStack?.[1];
    const row = line || (fromStack ? Number(fromStack[2]) : 0);

    if (!url || !row) return;

    try {
      const source = await (await fetch(url)).text();
      const code = source.split(/\r?\n/)[row - 1];

      if (code && /\.selector\b/.test(code)) {
        console.error(
          "[cruzo] In this situation, use a string selector instead of MyComponent.selector to avoid a circular dependency.",
        );
      }
    } catch {
      // source unavailable (CORS, prod bundle, etc.)
    }
  }
}

export const componentsRegistryService = new ComponentsRegistryService();

if (typeof window !== "undefined") {
  componentsRegistryService.handleErrors();
}
