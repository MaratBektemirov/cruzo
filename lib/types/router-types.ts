import type { Rx } from "../rx";
import type { RouteUrl } from "../route-url";
import type { HttpFactory } from "./http-types";
import type { AbstractComponentConstructor } from "./interfaces";

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
