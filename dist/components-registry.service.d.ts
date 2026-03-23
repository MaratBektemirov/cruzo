import { RxBucket } from "./rx-bucket";
import { AbstractComponentConstructor, ComponentsList } from "./interfaces";
import { RuleCompleted } from "./router.service";
declare class ComponentsRegistryService {
    private instancesBySelector;
    componentsRoot: ComponentsList;
    buckets: {
        [key: string]: RxBucket<any>;
    };
    listBySelector: Map<string, AbstractComponentConstructor>;
    constructor();
    removeComponents(components: ComponentsList, removeFromDom?: boolean): void;
    define(constructor: AbstractComponentConstructor): void;
    connectBySelector(selector: string, componentsList: ComponentsList, rootNode?: ParentNode, rule?: RuleCompleted): import("./component").AbstractComponent<any, any, any>[];
    initApp(): void;
    connectBucket(bucket: RxBucket<any>): void;
    disconnectBucket(bucket: RxBucket<any>): void;
}
export declare const componentsRegistryService: ComponentsRegistryService;
export {};
//# sourceMappingURL=components-registry.service.d.ts.map