import type { Rx } from "./rx";
import type { AbstractComponentConstructor } from "./interfaces";
import type { HttpFactory } from "./http-types";
import type { RouteUrl } from "./route-url";

export interface RuleCompleted {
  onLoadRoute?: () => any;
  onUnloadRoute?: () => any;
  httpFactory?: { [key: string]: HttpFactory };

  url: RouteUrl;
  redirectTo?: string;

  componentSelector?: string;
  routeSelector?: string;
  params$?: Rx<any>;
  components?: InstanceType<AbstractComponentConstructor>[];
}
