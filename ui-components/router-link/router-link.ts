import { AbstractComponent, componentsRegistryService, routerService, Template } from "../../lib";

const listenedAttrs = new Set(['href']);

interface RouterLinkParams {
  activeCls?: string;
  startsWith?: boolean;
  ignoreSearch?: boolean;
}

export function RouterLinkConfig(params: RouterLinkParams = {}) {
  return { activeCls: "", ...params };
}

declare global {
  interface BucketEventMap {
    routerLinkStateChanged: {
      isActive: boolean
    }
  }
}

export class RouterLinkComponent extends AbstractComponent<RouterLinkParams, boolean> {
  static selector = "[router-link]";

  public hasOuterBucket = true;
  public hasConfig = true;
  public isDirective = true;

  constructor() {
    super();
  }

  disconnectedCallback(): void {
    window.removeEventListener("hashchange", this.onHashChangeForActive);
    super.disconnectedCallback();
    this.node.removeEventListener("click", this.onClick);
  }

  onClick = (event: Event) => {
    const href = this.node.getAttribute("href");
    routerService.pushHistoryLink(event, href);
  };

  onChange() {
    const activeCls = this.config.activeCls ?? "";
    const isActive = this.isActive();
    this.outerBucket.emitEvent(this.id, 'routerLinkStateChanged', {data: {isActive}}, this.index);

    if (!activeCls) {
      return;
    }

    if (isActive) {
      this.node.classList.add(activeCls);
    } else {
      this.node.classList.remove(activeCls);
    }
  }

  isActive() {
    return routerService.hrefIsActive(this.node.getAttribute('href'), this.config);
  }

  private onHashChangeForActive = () => {
    if (!routerService.isHashMode()) this.onChange()
  };

  connectedCallback(): void {
    super.connectedCallback();

    this.node.addEventListener("click", this.onClick);
    Template.allowAttributeEvent(this.node, listenedAttrs);

    this.node.addEventListener("onchangeattr", (event) => {
      this.onChange();
    });

    window.addEventListener("hashchange", this.onHashChangeForActive);

    this.newRxFunc(() => {
      this.onChange();
    }, routerService.pathname$, routerService.search$);
  }
}

componentsRegistryService.define(RouterLinkComponent);
