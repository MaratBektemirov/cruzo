import { Bytecode } from "./vm";
import { Rx } from "./rx";
declare enum CONTEXT_TYPE {
    REPEAT = 1,
    EVENT = 2,
    TEXT_NODE = 3,
    ATTRIBUTE = 4,
    ATTACHED = 5,
    LEXICAL_ENV = 6,
    INNER_HTML = 7
}
type SelfFunction = (...args: any[]) => any;
interface TemplateDebug {
    selector?: string;
    __tplFile?: string;
}
interface TemplateParams extends TemplateDebug {
    node: HTMLElement;
    self?: SelfFunction;
    parent?: Template;
    root?: Template;
    cloneIndex?: number;
    domStructureChanged?: (...args: any[]) => any;
}
export type ChangeAttrEvent = CustomEvent<{
    name: string;
    prev: string;
    next: string;
}>;
declare global {
    interface HTMLElementEventMap {
        onchangeattr: ChangeAttrEvent;
    }
}
export declare class Template {
    private root;
    private debug;
    private parent;
    private self;
    private lexicalEnv;
    private selector;
    private children;
    private clones;
    private rxAcc;
    private pointer;
    private cloneIndex;
    private parentNode;
    private attached;
    private detecting;
    private repeatBC;
    private attachedBC;
    private templateNodeForClone;
    private innerHtmlTemplateBC;
    private nodeByIndex;
    private nodeValueByIndex;
    private nodeTemplateByIndex;
    private varNameByIndex;
    private varBytecodeByIndex;
    private varAttributes;
    private attrNameByIndex;
    private attrTemplateByIndex;
    private attrValueByIndex;
    private textNodes;
    private contentAttributes;
    private eventAttributes;
    private innerHTMLValue;
    private eventsFns;
    private eventsBC;
    private onRxUpdate;
    private rxUpdated;
    private rxUpdatedScheduled;
    private domStructureChanged;
    private domChangedScheduled;
    onceMap: Map<Bytecode, any | any[]>;
    node: HTMLElement;
    static REMOVE_ATTR: {};
    static appVariables: any;
    static getChangeAttrEvent(name: string, prev: string, next: string): ChangeAttrEvent;
    static allowAttributeEvent(element: HTMLElement, attrsSet: Set<string>): void;
    static stringToNode(str: string): HTMLElement;
    static setAppVariables(appVariables: any): void;
    detectChanges(): void;
    private internalDetectChanges;
    completelyClearRxAcc(): void;
    clearRxAccLocally(): void;
    fullDestroy(): void;
    private destroyAllClones;
    private locallyDestroyAllChildren;
    private setEventsRec;
    private destroyLastClone;
    private locallyDestroy;
    private attach;
    linkRxWhenDetach(): void;
    private detach;
    private static kebabToCamel;
    private execRepeatExpr;
    private rebuildClones;
    private updateAttributes;
    private updateVars;
    private removeEvents;
    private setEvents;
    private handleAttachedAttr;
    private updateRepeat;
    private reactiveUpdateAttachedAttr;
    private reactiveUpdateLexicalEnv;
    private reactiveUpdateRepeat;
    private reactiveUpdateNode;
    private reactiveUpdateAttr;
    private reactiveUpdateInnerHtml;
    private updateTextNode;
    private updateAttr;
    private updateInnerHtml;
    private updateVar;
    private updateAllTextNodes;
    private updateAllClones;
    private updateAllChildren;
    private isTemplate;
    private handleTemplateParseError;
    private getNodeForError;
    private getTemplateBytecode;
    private getItem;
    private execBytecode;
    private addClone;
    private addChildren;
    private hasBindingAttributes;
    private hasTemplateTextChild;
    private handleChildrens;
    private resetDetectingUpTree;
    private handleError;
    handleSafeError(message: string, expr?: string): void;
    private getSingleBytecode;
    private linkRxToTemplate;
    getRxValue(ctx: CONTEXT_TYPE, rx: Rx<any>, linkIndex: number, allowRxLink: boolean, onceMod: boolean): any;
    getVarFromLexicalEnv(name: string): any;
    private getThisArg;
    private runVMProgramForContext;
    private handleDomAttributes;
    private handleAttributes;
    private markDomStructureChanged;
    private getRxUpdate;
    constructor(params: TemplateParams);
    private insertFragmentAfter;
    private removePointer;
    private getPointer;
    private setPointer;
}
export {};
//# sourceMappingURL=template.d.ts.map