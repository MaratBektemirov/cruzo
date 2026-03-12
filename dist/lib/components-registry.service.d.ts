import { RxScope } from "./rx-scope";
import { AbstractComponentConstructor, ComponentsList } from "./interfaces";
import { RuleCompleted } from "./router.service";
declare class ComponentsRegistryService {
    private instancesBySelector;
    componentsRoot: ComponentsList;
    scopes: {
        [key: string]: RxScope<any>;
    };
    listBySelector: Map<string, AbstractComponentConstructor>;
    constructor();
    removeComponents(components: ComponentsList, removeFromDom?: boolean): void;
    define(constructor: AbstractComponentConstructor): void;
    connectBySelector(selector: string, componentsList: ComponentsList, rootNode?: ParentNode, rule?: RuleCompleted): import("./component").AbstractComponent<any, any, any>[];
    initApp(): void;
    connectScope(scope: RxScope<any>): void;
    disconnectScope(scope: RxScope<any>): void;
}
export declare const componentsRegistryService: ComponentsRegistryService;
export {};
//# sourceMappingURL=components-registry.service.d.ts.map