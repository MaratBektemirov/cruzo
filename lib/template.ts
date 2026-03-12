import { tokenizeExpr, VMProgramCompiler, Bytecode } from "./vm";
import { Rx } from "./rx";

const bracesStart = "{{";
const bracesEnd = "}}";

enum CONTEXT_TYPE {
  REPEAT = 1,
  EVENT = 2,
  TEXT_NODE = 3,
  ATTRIBUTE = 4,
  ATTACHED = 5,
  LEXICAL_ENV = 6,
  INNER_HTML = 7,
}

class MapCache<K, V> {
  private map = new Map<K, V>();
  constructor(private limit = 5000) { }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  set(key: K, value: V) {
    if (this.map.has(key)) return;

    this.map.set(key, value);

    if (this.map.size > this.limit) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }
}

const VM_CACHE = new MapCache<string, Bytecode>(5000);
const BYTECODE_CACHE = new MapCache<string, BytecodeArr | Bytecode>(5000);

type SelfFunction = (...args: any[]) => any;
type BytecodeArr = (string | Bytecode)[];

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

const JS_BOOLEAN_ATTRS = {
  "checked": "checked",
  "selected": "selected",
  "disabled": "disabled",
  "hidden": "hidden",
  "readonly": "readOnly",
  "required": "required",
  "open": "open",
}

interface TemplateArea {
  hasBindings: boolean,
  nodeTemplateByIndex: (BytecodeArr | Bytecode)[];
  attrNameByIndex: string[];
  attrTemplateByIndex: (BytecodeArr | Bytecode)[];
  varNameByIndex: string[];
  varBytecodeByIndex: Bytecode[];
  textNodes: number[];
  contentAttributes: number[];
  varAttributes: number[];
  eventAttributes: string[];
  events: Record<string, Bytecode>;
  templateNodeForClone: HTMLElement;
  filled: boolean;
  innerHtmlTemplateBC: Bytecode;
}

type RxAcc = Map<
  Rx<any>,
  Map<Template, [Set<number>, Set<number>, number, number, number, number]>
>

const FORBIDDEN_REACTIVE_ATTRS = new Set(["component-id", "scope-id"]);

export type ChangeAttrEvent = CustomEvent<{ name: string, prev: string, next: string }>;

declare global {
  interface HTMLElementEventMap {
    onchangeattr: ChangeAttrEvent;
  }
}

let nodeAttributesAreListened: WeakMap<HTMLElement, Set<string>> = null;

const changeAttrCustomEvent = { bubbles: false }

export class Template {
  private root: Template = null;
  private debug: TemplateDebug = null;
  private area: TemplateArea = null;

  private areas: TemplateArea[] = null;
  private parent: Template = null;

  private self: SelfFunction = null;

  private lexicalEnv: any = null;

  private selector: string = "";
  private children: Template[] = null;
  private clones: Template[] = null;

  private rxAcc: RxAcc = null;

  private pointer: Comment = null;
  private cloneIndex: number = null;
  private parentNode: ParentNode = null;
  private attached = true;
  private detecting = false;

  private repeatBC: Bytecode = null;
  private attachedBC: Bytecode = null;

  private nodeByIndex: ChildNode[] = null;
  private nodeValueByIndex: string[] = null;

  private attrValueByIndex: string[] = null;

  private innerHTMLValue = '';

  private events: Record<string, (event: Event) => any> = null;

  private onRxUpdate: (rx: Rx<any>) => any = null;
  private rxUpdated: Set<Rx<any>> = null;
  private rxUpdatedScheduled = false;

  private domStructureChanged: (...args: any[]) => any = null;
  private domChangedScheduled = false;

  public onceMap: Map<Bytecode, any | any[]> = null;
  public node: HTMLElement = null;
  public static REMOVE_ATTR = {};
  public static appVariables: any = {};

  public static getChangeAttrEvent(name: string, prev: string, next: string): ChangeAttrEvent {
    return new CustomEvent(
      'onchangeattr',
      Object.assign({ detail: { name, prev, next } }, changeAttrCustomEvent)
    )
  }

  public static allowAttributeEvent(element: HTMLElement, attrsSet: Set<string>) {
    nodeAttributesAreListened ??= new WeakMap();
    nodeAttributesAreListened.set(element, attrsSet);
  }

  public static stringToNode(str: string): HTMLElement {
    const template = document.createElement("template");
    template.innerHTML = str.trim();

    const node = template.content.firstElementChild;
    if (!node) {
      throw new Error(`Template.stringToNode(): empty template HTML`);
    }

    return node as HTMLElement;
  }

  static setAppVariables(appVariables: any) {
    Template.appVariables = appVariables;
  }

  public detectChanges() {
    this.root.completelyClearRxAcc();

    this.root.rxAcc = new Map();
    this.root.internalDetectChanges(true);
  }

  private internalDetectChanges(allowRxLink: boolean) {
    if (this.detecting) {
      const err = [`Template error: detectChanges() called during detectChanges()`];

      if (this.root.selector) err.push(this.root.selector)

      throw new Error(
        err.join(" at "),
      );
    }

    this.detecting = true;

    this.updateVars(allowRxLink);

    if (this.attachedBC) {
      this.handleAttachedAttr(allowRxLink);
    }

    if (!this.attached) {
      this.detecting = false;
      return;
    }

    if (this.repeatBC) {
      this.updateRepeat(allowRxLink);
    } else {
      this.updateAllTextNodes(allowRxLink);
      this.updateAllChildren(allowRxLink);
      this.updateAttributes(allowRxLink);
      this.updateInnerHtml(allowRxLink);
    }

    this.detecting = false;
  }

  completelyClearRxAcc() {
    if (!this.root.rxAcc) return;

    for (const item of this.root.rxAcc) {
      const rx = item[0];
      const templatesMap = item[1];

      for (const mapItem of templatesMap) {
        const template = mapItem[0];
        rx.postUpdateFns.delete(template.root.onRxUpdate);
      }
    }

    this.root.rxAcc = null;
    this.root.rxUpdated = null;
  }

  clearRxAccLocally() {
    if (!this.root.rxAcc) return;

    for (const item of this.root.rxAcc) {
      const rx = item[0];
      const templatesMap = item[1];

      templatesMap.delete(this);

      if (templatesMap.size === 0) {
        rx.postUpdateFns.delete(this.root.onRxUpdate);
      }
    }
  }

  public fullDestroy() {
    this.completelyClearRxAcc();
    this.removeEvents();

    if (this.node) this.node.innerHTML = "";

    this.removePointer();
  }

  private destroyAllClones() {
    if (!this.clones) return;

    while (this.clones.length) {
      this.destroyLastClone();
    }

    this.markDomStructureChanged();
  }

  private locallyDestroyAllChildren() {
    if (!this.children) return;

    for (let index = 0; index < this.children.length; index++) {
      this.children[index].locallyDestroy();
    }
  }

  private setEventsRec() {
    this.setEvents();

    if (!this.children) return;

    for (let index = 0; index < this.children.length; index++) {
      this.children[index].setEventsRec();
    }
  }

  private destroyLastClone() {
    const clone = this.clones.pop();

    if (clone.node) clone.node.remove();
    clone.locallyDestroy();
    clone.removePointer();
  }

  private locallyDestroy() {
    this.clearRxAccLocally();
    this.removeEvents();

    this.locallyDestroyAllChildren();
    if (this.repeatBC) this.destroyAllClones();
  }

  private attach() {
    const pointer = this.getPointer();
    const next = pointer.nextSibling;

    if (next) {
      this.parentNode.insertBefore(this.node, next);
    } else {
      this.parentNode.appendChild(this.node);
    }

    this.attached = true;
    this.setEventsRec();
    this.parentNode = null;

    this.markDomStructureChanged();
  }

  linkRxWhenDetach() {
    this.updateVars(true);

    if (this.attachedBC) {
      this.runVMProgramForContext(
        CONTEXT_TYPE.ATTACHED,
        this.attachedBC,
        0,
        true
      );
    }
  }

  private detach() {
    this.locallyDestroy();

    this.linkRxWhenDetach();

    this.parentNode = this.node.parentNode;
    this.node.remove();
    this.attached = false;

    this.markDomStructureChanged();
  }

  private static kebabToCamel(str: string) {
    return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }

  private execRepeatExpr(allowRxLink: boolean) {
    const result =
      this.runVMProgramForContext(CONTEXT_TYPE.REPEAT, this.repeatBC, 0, allowRxLink) ?? [];

    const resultType = typeof result;

    if (resultType === "number") {
      try {
        const arr = new Array(result);
        for (let i = 0; i < result; i++) arr[i] = i;
        return arr;
      } catch (e) {
        this.handleError(e as Error, "vm run", this.repeatBC, this.repeatBC.expr, null, CONTEXT_TYPE.REPEAT);
      }
    } else if (!Array.isArray(result)) {
      this.handleError(
        new Error(
          `Repeat expression must return array or number, got ${resultType}`,
        ),
        "vm run",
        this.repeatBC,
        this.repeatBC.expr,
        null,
        CONTEXT_TYPE.REPEAT,
      );
    }

    return result;
  }

  private rebuildClones(allowRxLink = false) {
    const arr = this.execRepeatExpr(allowRxLink);
    const diff = arr.length - this.clones.length;

    if (diff === 0) return;

    if (diff > 0) {
      const start = this.clones.length;

      const anchor =
        start === 0 ? this.getPointer() : this.clones[start - 1].node;

      const frag = document.createDocumentFragment();

      const cloneSelf = (allowRxLink: boolean) => this.execRepeatExpr(allowRxLink);

      for (let i = 0; i < diff; i++) {
        const n = this.area.templateNodeForClone.cloneNode(true) as HTMLElement;
        frag.appendChild(n);
        this.addClone(n, cloneSelf, start + i);
      }

      this.insertFragmentAfter(anchor, frag);

      this.markDomStructureChanged();
    } else {
      while (this.clones.length > arr.length) {
        this.destroyLastClone();
      }

      this.markDomStructureChanged();
    }
  }

  private updateAttributes(allowRxLink: boolean) {
    if (!this.area.contentAttributes) return;

    for (let i = 0; i < this.area.contentAttributes.length; i++) {
      this.updateAttr(this.area.contentAttributes[i], allowRxLink);
    }
  }

  private updateVars(allowRxLink: boolean) {
    if (!this.area.varAttributes) return;

    for (let i = 0; i < this.area.varAttributes.length; i++) {
      const va = this.area.varAttributes[i];
      this.updateVar(va, allowRxLink);
    }
  }

  private removeEvents() {
    if (!this.events) return;

    for (const ev in this.area.events) this.node.removeEventListener(ev, this.events[ev]);
    this.events = null;
  }

  private setEvents() {
    this.events ??= Object.create(null);

    for (const ev in this.area.events) {
      const fn = (event: Event) => {
        this.runVMProgramForContext(
          CONTEXT_TYPE.EVENT,
          this.area.events[ev],
          0,
          false,
          event,
        );
      };
      this.events[ev] = fn;
      this.node.addEventListener(ev, fn);
    }
  }

  private handleAttachedAttr(allowRxLink: boolean) {
    const newAttachedVal = this.runVMProgramForContext(
      CONTEXT_TYPE.ATTACHED,
      this.attachedBC,
      0,
      allowRxLink
    );

    if (newAttachedVal && !this.attached) this.attach();
    else if (!newAttachedVal && this.attached) this.detach();
  }

  private updateRepeat(allowRxLink = false) {
    this.rebuildClones(allowRxLink);
    this.updateAllClones(allowRxLink);
  }

  private reactiveUpdateAttachedAttr() {
    this.internalDetectChanges(true);
  }

  private reactiveUpdateLexicalEnv() {
    this.internalDetectChanges(true);
  }

  private reactiveUpdateRepeat() {
    if (!this.attached) return;

    this.updateRepeat(true);
  }

  private reactiveUpdateNode(linkIndex: number) {
    if (!this.attached) return;

    this.updateTextNode(linkIndex, false);
  }

  private reactiveUpdateAttr(linkIndex: number) {
    if (!this.attached) return;

    this.updateAttr(linkIndex, false);
  }

  private reactiveUpdateInnerHtml() {
    if (!this.attached) return;

    this.updateInnerHtml(false);
  }

  private updateTextNode(index: number, allowRxLink: boolean) {
    const textNode = this.nodeByIndex[index];
    const templateArray = this.area.nodeTemplateByIndex[index];
    const newContent = this.execBytecode(
      CONTEXT_TYPE.TEXT_NODE,
      templateArray,
      index,
      allowRxLink,
    );

    if (this.nodeValueByIndex[index] === newContent && index in this.nodeValueByIndex) return;

    textNode.textContent = newContent;
    this.nodeValueByIndex[index] = newContent;
  }

  private updateAttr(index: number, allowRxLink: boolean) {
    const newValue = this.execBytecode(
      CONTEXT_TYPE.ATTRIBUTE,
      this.area.attrTemplateByIndex[index],
      index,
      allowRxLink
    );

    let attrName = this.area.attrNameByIndex[index];
    if (attrName === "data-src") attrName = "src";

    const cur = this.attrValueByIndex[index];
    if (cur === newValue && index in this.attrValueByIndex) return;

    const attrMustBeRemoved = newValue === Template.REMOVE_ATTR;

    if (attrMustBeRemoved) {
      this.node.removeAttribute(attrName);
    } else {
      this.node.setAttribute(attrName, newValue);
    }

    const booleanNodeAttr = JS_BOOLEAN_ATTRS[attrName as keyof typeof JS_BOOLEAN_ATTRS];
    if (booleanNodeAttr) {
      (this.node as HTMLElement & Record<string, boolean>)[booleanNodeAttr] = attrMustBeRemoved ? false : !!newValue;
    }

    this.attrValueByIndex[index] = newValue;

    if (nodeAttributesAreListened?.get(this.node)?.has(attrName)) {
      this.node.dispatchEvent(Template.getChangeAttrEvent(attrName, cur, newValue))
    }
  }

  private updateInnerHtml(allowRxLink: boolean) {
    if (!this.area.innerHtmlTemplateBC) return;

    const html = this.runVMProgramForContext(
      CONTEXT_TYPE.INNER_HTML,
      this.area.innerHtmlTemplateBC,
      0,
      allowRxLink
    )

    if (this.innerHTMLValue !== html) {
      this.node.innerHTML = html;
      this.innerHTMLValue = html;
    }
  }

  private updateVar(index: number, allowRxLink: boolean) {
    this.lexicalEnv[this.area.varNameByIndex[index]] =
      this.runVMProgramForContext(
        CONTEXT_TYPE.LEXICAL_ENV,
        this.area.varBytecodeByIndex[index],
        index,
        allowRxLink
      );
  }

  private updateAllTextNodes(allowRxLink: boolean) {
    if (!this.area.textNodes) return;

    for (let i = 0; i < this.area.textNodes.length; i++) {
      this.updateTextNode(this.area.textNodes[i], allowRxLink)
    }
  }

  private updateAllClones(allowRxLink: boolean) {
    if (!this.clones) return;

    for (let i = 0; i < this.clones.length; i++) {
      this.clones[i].internalDetectChanges(allowRxLink);
    }
  }

  private updateAllChildren(allowRxLink: boolean) {
    if (!this.children) return;

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].internalDetectChanges(allowRxLink);
    }
  }

  private isTemplate(str: string) {
    if (!str) return false;
    const open = str.indexOf(bracesStart);
    if (open === -1) return false;
    const close = str.indexOf(bracesEnd, open + 2);
    return close !== -1;
  }

  private handleTemplateParseError(template: string, exprStart: number, len: number, message: string) {
    const exprSnippet = template.slice(exprStart, Math.min(exprStart + 40, len)) + (len > exprStart + 40 ? "..." : "");
    this.handleError(new Error(message), "template parse", null, template, exprSnippet);
  }

  private getNodeForError() {
    return this.node.outerHTML.split('>')[0] + '>';
  }

  private getTemplateBytecode(template: string, onlySingleBytecodeIsAllowed?: boolean, entityName?: string) {
    const cached = BYTECODE_CACHE.get(template);
    if (cached) return cached;

    const bcArr: BytecodeArr = [];
    const len = template.length;
    let pos = 0;

    while (pos < len) {
      const open = template.indexOf(bracesStart, pos);
      if (open === -1) {
        if (pos < len) bcArr.push(template.slice(pos));
        break;
      }
      if (open > pos) bcArr.push(template.slice(pos, open));

      const exprStart = open + 2;
      const stack: string[] = [];
      let i = exprStart;
      let inString: "'" | '"' | "`" | null = null;
      let closeIndex = -1;

      while (i < len) {
        const c = template[i];
        if (inString !== null) {
          if (c === "\\") {
            i += 2;
            continue;
          }
          if (c === inString) {
            inString = null;
            i++;
            continue;
          }
          i++;
          continue;
        }
        if (c === "'" || c === '"' || c === "`") {
          inString = c;
          i++;
          continue;
        }
        if (c === "(" || c === "[" || c === "{") {
          stack.push(c);
          i++;
          continue;
        }
        if (c === ")") {
          if (!stack.length || stack[stack.length - 1] !== "(") {
            this.handleTemplateParseError(template, exprStart, len, `Unmatched ")" at position ${i}`);
          }
          stack.pop();
          i++;
          continue;
        }
        if (c === "]") {
          if (!stack.length || stack[stack.length - 1] !== "[") {
            this.handleTemplateParseError(template, exprStart, len, `Unmatched "]" at position ${i}`);
          }
          stack.pop();
          i++;
          continue;
        }
        if (c === "}") {
          if (stack.length && stack[stack.length - 1] === "{") {
            stack.pop();
            i++;
            continue;
          }
          if (stack.length === 0 && template[i + 1] === "}") {
            closeIndex = i;
            break;
          }
          if (stack.length > 0) {
            const expected = stack[stack.length - 1] === "(" ? ")" : "]";
            this.handleTemplateParseError(template, exprStart, len, `Expected "${expected}" but got "}" at position ${i}`);
          }
          this.handleTemplateParseError(template, exprStart, len, `Unexpected "}" at position ${i}`);
        }
        i++;
      }

      if (closeIndex === -1) {
        if (stack.length > 0) {
          const unclosed = stack[stack.length - 1];
          const expected = unclosed === "(" ? ")" : unclosed === "[" ? "]" : "}";
          this.handleTemplateParseError(template, exprStart, len, `Unclosed "${unclosed}": expected "${expected}" before end of expression`);
        }
        bcArr.push(this.getSingleBytecode(template.slice(exprStart).trim(), template));
        break;
      }
      bcArr.push(this.getSingleBytecode(template.slice(exprStart, closeIndex).trim(), template));
      pos = closeIndex + 2;
    }

    if (onlySingleBytecodeIsAllowed && bcArr.length > 1) {
      this.handleError(new Error(`Template has multi expressions, only single expression is allowed here`), "vm compile", null, template);
    } else if (!bcArr.filter((bc) => bc instanceof Bytecode).length) {
      this.handleError(new Error(`Expression not found, ${this.getNodeForError()} in ${entityName} attr`), "vm compile", null, template);
    }

    const result = bcArr.length === 1 ? bcArr[0] as Bytecode : bcArr;

    BYTECODE_CACHE.set(template, result);

    return result;
  }

  private getItem(t: string | Bytecode, ctx: CONTEXT_TYPE, linkIndex: number, allowRxLink: boolean): string {
    if (typeof t === "string") return t;

    return this.runVMProgramForContext(ctx, t, linkIndex, allowRxLink);
  }

  private execBytecode(
    ctx: CONTEXT_TYPE,
    bc: BytecodeArr | Bytecode,
    linkIndex: number,
    allowRxLink: boolean
  ) {
    if (!Array.isArray(bc)) {
      return this.getItem(bc, ctx, linkIndex, allowRxLink);
    }

    let out = new Array(bc.length);
    for (let i = 0; i < bc.length; i++) out[i] = this.getItem(bc[i], ctx, linkIndex, allowRxLink);
    return out.join('');
  }

  private childNodeIsDynamic(el: HTMLElement) {
    if (el.hasAttribute("repeat") || el.hasAttribute("attached")) return true;

    return this.root.areas[+el.getAttribute("area-index")].hasBindings;
  }

  private addClone(node: HTMLElement, self: SelfFunction, cloneIndex: number) {
    const clone = new Template({
      parent: this.parent,
      node,
      self,
      root: this.root,
      cloneIndex,
    });

    this.clones.push(clone);
    return clone;
  }

  private addChildren(node: HTMLElement) {
    return new Template({
      node,
      self: this.self,
      root: this.root,
      cloneIndex: this.cloneIndex,
    });
  }

  private areaFactory(): TemplateArea {
    return {
      hasBindings: false,
      nodeTemplateByIndex: null,
      attrNameByIndex: null,
      attrTemplateByIndex: null,
      varNameByIndex: null,
      varBytecodeByIndex: null,
      textNodes: null,
      contentAttributes: null,
      varAttributes: null,
      eventAttributes: null,
      events: null,
      templateNodeForClone: null,
      filled: false,
      innerHtmlTemplateBC: null,
    };
  }

  private createAreas(node: HTMLElement): void {
    node.setAttribute("area-index", String(this.root.areas.length));

    const area = this.areaFactory();
    this.root.areas.push(area);

    const hasInnerHtml = node.hasAttribute("inner-html");

    area.hasBindings =
      this.hasBindingAttributes(node) ||
      this.hasTemplateTextChild(node);

    if (hasInnerHtml) return;

    for (let child = node.firstElementChild; child; child = child.nextElementSibling) this.createAreas(child as HTMLElement)
  }

  private hasBindingAttributes(node: HTMLElement): boolean {
    for (const attr of Array.from(node.attributes)) if (this.isTemplate(attr.value)) return true;
    return false;
  }

  private hasTemplateTextChild(node: HTMLElement): boolean {
    for (let ch = node.firstChild; ch; ch = ch.nextSibling) if (ch.nodeType === Node.TEXT_NODE && this.isTemplate(ch.textContent)) return true
    return false;
  }

  private handleChildrens(node: HTMLElement) {
    let childNode: ChildNode = node.firstChild;

    while (childNode) {
      const next = childNode.nextSibling;

      if (childNode.nodeType === 1) {
        const el = childNode as HTMLElement;

        if (this.childNodeIsDynamic(el)) {
          const t = this.addChildren(el);
          t.parent = this;
          this.children ??= [];
          this.children.push(t);
        } else {
          this.handleChildrens(el);
        }
      } else if (childNode.nodeType === 3) {
        const template = childNode.textContent;

        if (this.isTemplate(template)) {
          this.nodeByIndex ??= [];
          this.nodeValueByIndex ??= [];
          const idx = this.nodeByIndex.push(childNode) - 1;

          if (!this.area.filled) {
            this.area.nodeTemplateByIndex ??= [];
            this.area.nodeTemplateByIndex.push(this.getTemplateBytecode(template));
            this.area.textNodes ??= [];
            this.area.textNodes.push(idx);
          }
        }
      }

      childNode = next;
    }
  }

  private resetDetectingUpTree() {
    let t: Template = this;
    while (t) {
      t.detecting = false;
      t = t.parent;
    }
  }

  private handleError(
    err: Error,
    stage: string,
    bc: Bytecode = null,
    fullTemplate = '',
    expr = '',
    ctx: CONTEXT_TYPE = null,
  ) {
    const arr = expr ? [expr] : [];

    if (fullTemplate) arr.push(fullTemplate);
    if (this.root.selector) arr.push(this.root.selector);

    let file = arr.join(" at ");

    if (this.root.debug.__tplFile) file += ` (${this.root.debug.__tplFile})`

    let ctxMsg = ctx ? ', ' + CONTEXT_TYPE[ctx] : '';

    err.message = `${stage}${ctxMsg}: ${err.message} in ${file}`;

    if (bc) {
      console.log(file);
      bc.log();
    }

    throw err;
  }

  public handleSafeError(message: string, expr = '') {
    const arr = expr ? [expr] : [];
    if (this.root.selector) arr.push(this.root.selector);
    let file = arr.join(" at ");
    if (this.root.debug.__tplFile) {
      file += ` (${this.root.debug.__tplFile})`;
    }
    console.error(`${message} in ${file}`);
  }

  private getSingleBytecode(expr: string, fullTemplate?: string) {
    expr = expr.trim();

    let bc = VM_CACHE.get(expr);

    if (!bc) {
      try {
        const tokens = tokenizeExpr(expr);
        bc = new VMProgramCompiler(tokens).getBytecode(expr);
        VM_CACHE.set(expr, bc);
      } catch (e) {
        this.handleError(e as Error, "vm compile", bc, fullTemplate, expr);
      }
    }

    return bc;
  }

  private linkRxToTemplate(ctx: CONTEXT_TYPE, rx: Rx<any>, linkIndex: number) {
    if (ctx === CONTEXT_TYPE.ATTRIBUTE) {
      const attrName = this.area.attrNameByIndex[linkIndex];

      if (attrName && FORBIDDEN_REACTIVE_ATTRS.has(attrName)) {
        throw new Error(
          `::rx is not allowed in "${attrName}".`
        );
      }
    }

    let updateRxData = this.root.rxAcc.get(rx);

    if (!updateRxData) {
      updateRxData = new Map();
      this.root.rxAcc.set(rx, updateRxData);
    }

    let updateTemplateData = updateRxData.get(this);

    if (!updateTemplateData) {
      updateTemplateData = [null, null, 0, 0, 0, 0];
      updateRxData.set(this, updateTemplateData);
    }

    if (ctx === CONTEXT_TYPE.TEXT_NODE) {
      updateTemplateData[0] ??= new Set();

      updateTemplateData[0].add(linkIndex);
    } else if (ctx === CONTEXT_TYPE.ATTRIBUTE) {
      updateTemplateData[1] ??= new Set();

      updateTemplateData[1].add(linkIndex);
    } else if (ctx === CONTEXT_TYPE.ATTACHED) {
      updateTemplateData[2] = 1;
    } else if (ctx === CONTEXT_TYPE.REPEAT) {
      updateTemplateData[3] = 1;
    } else if (ctx === CONTEXT_TYPE.LEXICAL_ENV) {
      updateTemplateData[4] = 1;
    } else if (ctx === CONTEXT_TYPE.INNER_HTML) {
      updateTemplateData[5] = 1;
    }

    rx.setPostUpdate(this.root.onRxUpdate);
  }

  public getRxValue(ctx: CONTEXT_TYPE, rx: Rx<any>, linkIndex: number, allowRxLink: boolean, onceMod: boolean) {
    if (ctx === CONTEXT_TYPE.EVENT || onceMod) return rx.actual;
    if (allowRxLink) this.linkRxToTemplate(ctx, rx, linkIndex);

    return rx.actual;
  }

  public getVarFromLexicalEnv(name: string): any {
    if (this.lexicalEnv && name in this.lexicalEnv) {
      return this.lexicalEnv[name];
    }

    return this.parent ? this.parent.getVarFromLexicalEnv(name) : undefined;
  }

  private getThisArg(allowRxLink: boolean) {
    if (typeof this.cloneIndex === "number") {
      return this.self(allowRxLink)[this.cloneIndex];
    }

    return this.self();
  }

  private runVMProgramForContext(
    ctx: CONTEXT_TYPE,
    bc: Bytecode,
    linkIndex: number,
    allowRxLink: boolean,
    event: Event = null,
  ) {
    try {
      if (this.repeatBC && ctx !== CONTEXT_TYPE.REPEAT) {
        return;
      }

      if (bc.noRunNeeded(this)) {
        return this.onceMap.get(bc);
      }

      return bc.run(
        this,
        ctx,
        linkIndex,
        Template.appVariables,
        allowRxLink,
        event,
      );
    } catch (e) {
      this.resetDetectingUpTree();
      this.handleError(e as Error, "vm run", bc, bc.expr, null, ctx);
    }
  }

  private handleAttributesFilledArea() {
    const attrs = Array.from(this.node.attributes);

    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];

      if (attr.name === "attached" && !this.repeatBC) {
        this.setPointer();
        this.attachedBC = this.getTemplateBytecode(attr.value, true, attr.name) as Bytecode;
      }

      if (attr.name === "inner-html") {
        this.node.removeAttribute("inner-html");
      }
    }

    if (!this.area.eventAttributes) return;

    for (let i = 0; i < this.area.eventAttributes.length; i++) {
      this.node.removeAttribute(this.area.eventAttributes[i]);
    }
  }

  private handleAttributes() {
    const attrs = Array.from(this.node.attributes);

    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];

      if (attr.name === "repeat" || !this.isTemplate(attr.value)) continue;

      if (attr.name.indexOf("on") === 0) {
        this.area.eventAttributes ??= [];
        this.area.eventAttributes.push(attr.name);
        this.area.events ??= Object.create(null);
        this.area.events[attr.name.slice(2)] = this.getTemplateBytecode(attr.value, true, attr.name) as Bytecode;
      } else if (attr.name === "attached" && !this.repeatBC) {
        this.setPointer();
        this.attachedBC = this.getTemplateBytecode(attr.value, true, attr.name) as Bytecode;
      } else if (attr.name === "inner-html") {
        this.area.innerHtmlTemplateBC = this.getTemplateBytecode(attr.value, true, attr.name) as Bytecode;
        this.node.removeAttribute("inner-html");
      } else if (attr.name.indexOf("let-") === 0) {
        this.area.varNameByIndex ??= [];
        const idx = this.area.varNameByIndex.push(Template.kebabToCamel(attr.name.slice(4))) - 1;

        this.area.varBytecodeByIndex ??= [];
        this.area.varBytecodeByIndex.push(this.getTemplateBytecode(attr.value, true, attr.name) as Bytecode);
        this.area.varAttributes ??= [];
        this.area.varAttributes.push(idx);
      } else {
        this.area.attrNameByIndex ??= [];
        const idx = this.area.attrNameByIndex.push(attr.name) - 1;
        this.area.attrTemplateByIndex ??= [];
        this.area.attrTemplateByIndex.push(this.getTemplateBytecode(attr.value));
        this.area.contentAttributes ??= [];
        this.area.contentAttributes.push(idx);
      }
    }

    if (!this.area.eventAttributes) return;

    for (let i = 0; i < this.area.eventAttributes.length; i++) {
      this.node.removeAttribute(this.area.eventAttributes[i]);
    }
  }

  private markDomStructureChanged() {
    if (typeof this.root.domStructureChanged !== 'function') return;

    if (this.root.domChangedScheduled) return;

    this.root.domChangedScheduled = true;

    queueMicrotask(() => {
      this.root.domChangedScheduled = false;
      this.root.domStructureChanged();
    });
  }

  private getRxUpdate() {
    return (rx: Rx<any>) => {
      this.root.rxUpdated ??= new Set();
      this.root.rxUpdated.add(rx);

      if (this.root.rxUpdatedScheduled) return;

      this.root.rxUpdatedScheduled = true;

      queueMicrotask(() => {
        this.root.rxUpdatedScheduled = false;

        if (!this.root.rxUpdated || !this.root.rxAcc) {
          this.root.rxUpdated = null;
          return;
        }

        for (const rx of this.root.rxUpdated) {
          const map = this.root.rxAcc.get(rx);
          if (!map) continue;

          for (const item of map) {
            const template = item[0];
            const data = item[1];

            if (data[2]) {
              template.reactiveUpdateAttachedAttr();
              continue;
            }

            if (data[4]) {
              template.reactiveUpdateLexicalEnv();
              continue;
            }

            if (data[0]) {
              for (const linkIndex of data[0]) {
                template.reactiveUpdateNode(linkIndex);
              }
            }

            if (data[1]) {
              for (const linkIndex of data[1]) {
                template.reactiveUpdateAttr(linkIndex);
              }
            }

            if (data[3]) {
              template.reactiveUpdateRepeat();
            }

            if (data[5]) {
              template.reactiveUpdateInnerHtml();
            }
          }
        }

        this.root.rxUpdated = null;
      });
    };
  }

  constructor(params: TemplateParams) {
    Object.assign(this, params);

    if (typeof this.self !== "function") {
      throw new Error("Invalid self param");
    }

    if (!this.root) {
      this.root = this;
      this.areas = [];
      this.debug = {
        selector: params.selector,
        __tplFile: params.__tplFile,
      };
      this.createAreas(this.node);
      this.onRxUpdate = this.getRxUpdate();
    }

    const areaIndex = +this.node.getAttribute("area-index");
    this.area = this.root.areas[areaIndex];

    const repeatExpr = this.node.getAttribute("repeat");

    if (repeatExpr) {
      this.setPointer();

      this.repeatBC = this.getTemplateBytecode(repeatExpr, true, 'repeat') as Bytecode;

      if (!this.area.filled) {
        this.area.templateNodeForClone = this.node.cloneNode(
          true,
        ) as HTMLElement;
        this.area.templateNodeForClone.removeAttribute("repeat");
      }

      this.node.remove();
      this.clones = [];
    }

    if (this.area.filled) {
      this.handleAttributesFilledArea();
    } else {
      this.handleAttributes();
    }

    if (!this.area.innerHtmlTemplateBC) this.handleChildrens(this.node);
    this.setEvents();

    if (this.area.attrNameByIndex) {
      this.attrValueByIndex = [];
    }

    if (this.area.varNameByIndex) {
      this.lexicalEnv = Object.create(null);
    }

    this.area.filled = true;
  }

  private insertFragmentAfter(node: ChildNode, frag: DocumentFragment) {
    const parent = node.parentNode!;
    const next = node.nextSibling;
    if (next) parent.insertBefore(frag, next);
    else parent.appendChild(frag);
  }

  private removePointer() {
    if (!this.pointer) return;

    this.pointer.remove();
  }

  private getPointer() {
    if (!this.pointer) {
      throw new Error(
        [
          `Template initialization error: "pointer" is missing.`,
          `This usually means the Template was created when its node was not in the DOM.`,
          `You need to call setPointer() after inserting the node into the DOM.`,
          `Node: ${this.node.tagName || this.node}`,
        ].join("\n"),
      );
    }

    return this.pointer;
  }

  private setPointer() {
    if (!this.node.parentNode) return;

    this.pointer = this.node.parentNode.insertBefore(
      document.createComment("p"),
      this.node,
    );
  }
}
