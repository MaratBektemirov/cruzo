import { AbstractComponent, componentsRegistryService, routerService, Template } from "cruzo";

const listenedAttrs = new Set(['href']);

interface RouterLinkParams {
  activeCls?: string;
  startsWith?: boolean;
  ignoreHash?: boolean;
  ignoreSearch?: boolean;
}

export function RouterLinkConfig(params: RouterLinkParams) {
  return Object.assign({}, params);
}

declare global {
  interface ScopeEventMap {
    routerLinkStateChanged: {
      isActive: boolean
    }
  }
}

export class RouterLinkComponent extends AbstractComponent<RouterLinkParams, boolean> {
  static selector = "[router-link]";

  public hasOuterScope = true;
  public hasConfig = true;
  public isDirective = true;

  constructor() {
    super();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.node.removeEventListener("click", this.onClick);
  }

  onClick = (event: Event) => {
    const href = this.node.getAttribute("href");
    routerService.pushHistoryLink(event, href);
  };

  onChange() {
    let activeCls = this.config.activeCls;

    const isActive = this.isActive();
    this.outerScope.emitEvent(this.id, this.index, 'routerLinkStateChanged', {data: {isActive}});

    if (isActive) {
      this.node.classList.add(activeCls);
    } else {
      this.node.classList.remove(activeCls);
    }
  }

  isActive() {
    return routerService.hrefIsActive(this.node.getAttribute('href'), this.config);
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.node.addEventListener("click", this.onClick);
    Template.allowAttributeEvent(this.node, listenedAttrs);

    this.node.addEventListener("onchangeattr", (event) => {
      this.onChange();
    });

    this.newRxFunc(() => {
      this.onChange();
    }, routerService.pathname$, routerService.hash$, routerService.search$);
  }
}

componentsRegistryService.define(RouterLinkComponent);
