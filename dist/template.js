var T = Object.defineProperty;
var N = (a, e, t) => e in a ? T(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var i = (a, e, t) => N(a, typeof e != "symbol" ? e + "" : e, t);
import { Bytecode as U, tokenizeExpr as V, VMProgramCompiler as w } from "./vm.js";
const y = "{{", M = "}}";
var b = /* @__PURE__ */ ((a) => (a[a.REPEAT = 1] = "REPEAT", a[a.EVENT = 2] = "EVENT", a[a.TEXT_NODE = 3] = "TEXT_NODE", a[a.ATTRIBUTE = 4] = "ATTRIBUTE", a[a.ATTACHED = 5] = "ATTACHED", a[a.LEXICAL_ENV = 6] = "LEXICAL_ENV", a[a.INNER_HTML = 7] = "INNER_HTML", a))(b || {});
class I {
  constructor(e = 5e3) {
    i(this, "map", /* @__PURE__ */ new Map());
    this.limit = e;
  }
  get(e) {
    return this.map.get(e);
  }
  set(e, t) {
    if (!this.map.has(e) && (this.map.set(e, t), this.map.size > this.limit)) {
      const n = this.map.keys().next().value;
      this.map.delete(n);
    }
  }
}
const C = new I(5e3), B = new I(5e3), R = {
  checked: "checked",
  selected: "selected",
  disabled: "disabled",
  hidden: "hidden",
  readonly: "readOnly",
  required: "required",
  open: "open"
}, S = /* @__PURE__ */ new Set(["component-id", "bucket-id"]);
let g = null;
const D = { bubbles: !1 }, f = class f {
  constructor(e) {
    i(this, "root", null);
    i(this, "debug", null);
    i(this, "parent", null);
    i(this, "self", null);
    i(this, "lexicalEnv", null);
    i(this, "selector", "");
    i(this, "children", null);
    i(this, "clones", null);
    i(this, "rxAcc", null);
    i(this, "pointer", null);
    i(this, "cloneIndex", null);
    i(this, "parentNode", null);
    i(this, "attached", !0);
    i(this, "detecting", !1);
    i(this, "repeatBC", null);
    i(this, "attachedBC", null);
    i(this, "templateNodeForClone", null);
    i(this, "innerHtmlTemplateBC", null);
    i(this, "nodeByIndex", null);
    i(this, "nodeValueByIndex", null);
    i(this, "nodeTemplateByIndex", null);
    i(this, "varNameByIndex", null);
    i(this, "varBytecodeByIndex", null);
    i(this, "varAttributes", null);
    i(this, "attrNameByIndex", null);
    i(this, "attrTemplateByIndex", null);
    i(this, "attrValueByIndex", null);
    i(this, "textNodes", null);
    i(this, "contentAttributes", null);
    i(this, "eventAttributes", null);
    i(this, "innerHTMLValue", "");
    i(this, "eventsFns", null);
    i(this, "eventsBC", null);
    i(this, "onRxUpdate", null);
    i(this, "rxUpdated", null);
    i(this, "rxUpdatedScheduled", !1);
    i(this, "domStructureChanged", null);
    i(this, "domChangedScheduled", !1);
    i(this, "onceMap", null);
    i(this, "node", null);
    if (Object.assign(this, e), typeof this.self != "function")
      throw new Error("Invalid self param");
    this.root || (this.root = this, this.debug = {
      selector: e.selector,
      __tplFile: e.__tplFile
    }, this.onRxUpdate = this.getRxUpdate()), this.handleDomAttributes(), this.handleAttributes(), this.innerHtmlTemplateBC || this.handleChildrens(this.node), this.setEvents();
  }
  static getChangeAttrEvent(e, t, n) {
    return new CustomEvent(
      "onchangeattr",
      Object.assign({ detail: { name: e, prev: t, next: n } }, D)
    );
  }
  static allowAttributeEvent(e, t) {
    g ?? (g = /* @__PURE__ */ new WeakMap()), g.set(e, t);
  }
  static stringToNode(e) {
    const t = document.createElement("template");
    t.innerHTML = e.trim();
    const n = t.content.firstElementChild;
    if (!n)
      throw new Error("Template.stringToNode(): empty template HTML");
    return n;
  }
  static setAppVariables(e) {
    f.appVariables = e;
  }
  detectChanges() {
    this.root.completelyClearRxAcc(), this.root.rxAcc = /* @__PURE__ */ new Map(), this.root.internalDetectChanges(!0);
  }
  internalDetectChanges(e) {
    if (this.detecting) {
      const t = ["Template error: detectChanges() called during detectChanges()"];
      throw this.root.selector && t.push(this.root.selector), new Error(
        t.join(" at ")
      );
    }
    if (this.detecting = !0, this.updateVars(e), this.attachedBC && this.handleAttachedAttr(e), !this.attached) {
      this.detecting = !1;
      return;
    }
    this.repeatBC ? this.updateRepeat(e) : (this.updateAllTextNodes(e), this.updateAllChildren(e), this.updateAttributes(e), this.updateInnerHtml(e)), this.detecting = !1;
  }
  completelyClearRxAcc() {
    if (this.root.rxAcc) {
      for (const e of this.root.rxAcc) {
        const t = e[0], n = e[1];
        for (const r of n) {
          const s = r[0];
          t.postUpdateFns.delete(s.root.onRxUpdate);
        }
      }
      this.root.rxAcc = null, this.root.rxUpdated = null;
    }
  }
  clearRxAccLocally() {
    if (this.root.rxAcc)
      for (const e of this.root.rxAcc) {
        const t = e[0], n = e[1];
        n.delete(this), n.size === 0 && t.postUpdateFns.delete(this.root.onRxUpdate);
      }
  }
  fullDestroy() {
    this.completelyClearRxAcc(), this.removeEvents(), this.node && (this.node.innerHTML = ""), this.removePointer();
  }
  destroyAllClones() {
    if (this.clones) {
      for (; this.clones.length; )
        this.destroyLastClone();
      this.markDomStructureChanged();
    }
  }
  locallyDestroyAllChildren() {
    if (this.children)
      for (let e = 0; e < this.children.length; e++)
        this.children[e].locallyDestroy();
  }
  setEventsRec() {
    if (this.setEvents(), !!this.children)
      for (let e = 0; e < this.children.length; e++)
        this.children[e].setEventsRec();
  }
  destroyLastClone() {
    const e = this.clones.pop();
    e.node && e.node.remove(), e.locallyDestroy(), e.removePointer();
  }
  locallyDestroy() {
    this.clearRxAccLocally(), this.removeEvents(), this.locallyDestroyAllChildren(), this.repeatBC && this.destroyAllClones();
  }
  attach() {
    const t = this.getPointer().nextSibling;
    t ? this.parentNode.insertBefore(this.node, t) : this.parentNode.appendChild(this.node), this.attached = !0, this.setEventsRec(), this.parentNode = null, this.markDomStructureChanged();
  }
  linkRxWhenDetach() {
    this.updateVars(!0), this.attachedBC && this.runVMProgramForContext(
      5,
      this.attachedBC,
      0,
      !0
    );
  }
  detach() {
    this.locallyDestroy(), this.linkRxWhenDetach(), this.parentNode = this.node.parentNode, this.node.remove(), this.attached = !1, this.markDomStructureChanged();
  }
  static kebabToCamel(e) {
    return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
  }
  execRepeatExpr(e) {
    const t = this.runVMProgramForContext(1, this.repeatBC, 0, e) ?? [], n = typeof t;
    if (n === "number")
      try {
        const r = new Array(t);
        for (let s = 0; s < t; s++) r[s] = s;
        return r;
      } catch (r) {
        this.handleError(
          r,
          "vm run",
          this.repeatBC,
          this.repeatBC.expr,
          null,
          1
          /* REPEAT */
        );
      }
    else Array.isArray(t) || this.handleError(
      new Error(
        `Repeat expression must return array or number, got ${n}`
      ),
      "vm run",
      this.repeatBC,
      this.repeatBC.expr,
      null,
      1
      /* REPEAT */
    );
    return t;
  }
  rebuildClones(e = !1) {
    const t = this.execRepeatExpr(e), n = t.length - this.clones.length;
    if (n !== 0)
      if (n > 0) {
        const r = this.clones.length, s = r === 0 ? this.getPointer() : this.clones[r - 1].node, o = document.createDocumentFragment(), l = (d) => this.execRepeatExpr(d);
        for (let d = 0; d < n; d++) {
          const p = this.templateNodeForClone.cloneNode(!0);
          o.appendChild(p), this.addClone(p, l, r + d);
        }
        this.insertFragmentAfter(s, o), this.markDomStructureChanged();
      } else {
        for (; this.clones.length > t.length; )
          this.destroyLastClone();
        this.markDomStructureChanged();
      }
  }
  updateAttributes(e) {
    if (this.contentAttributes)
      for (let t = 0; t < this.contentAttributes.length; t++) this.updateAttr(this.contentAttributes[t], e);
  }
  updateVars(e) {
    if (this.varAttributes)
      for (let t = 0; t < this.varAttributes.length; t++) {
        const n = this.varAttributes[t];
        this.updateVar(n, e);
      }
  }
  removeEvents() {
    if (this.eventsFns) {
      for (const e in this.eventsFns) this.node.removeEventListener(e, this.eventsFns[e]);
      this.eventsFns = null;
    }
  }
  setEvents() {
    if (this.attached) {
      this.eventsFns ?? (this.eventsFns = /* @__PURE__ */ Object.create(null));
      for (const e in this.eventsBC) {
        const t = (n) => {
          this.runVMProgramForContext(
            2,
            this.eventsBC[e],
            0,
            !1,
            n
          );
        };
        this.eventsFns[e] = t, this.node.addEventListener(e, t);
      }
    }
  }
  handleAttachedAttr(e) {
    const t = this.runVMProgramForContext(
      5,
      this.attachedBC,
      0,
      e
    );
    t && !this.attached ? this.attach() : !t && this.attached && this.detach();
  }
  updateRepeat(e = !1) {
    this.rebuildClones(e), this.updateAllClones(e);
  }
  reactiveUpdateAttachedAttr() {
    this.internalDetectChanges(!0);
  }
  reactiveUpdateLexicalEnv() {
    this.internalDetectChanges(!0);
  }
  reactiveUpdateRepeat() {
    this.attached && this.updateRepeat(!0);
  }
  reactiveUpdateNode(e) {
    this.attached && this.updateTextNode(e, !1);
  }
  reactiveUpdateAttr(e) {
    this.attached && this.updateAttr(e, !1);
  }
  reactiveUpdateInnerHtml() {
    this.attached && this.updateInnerHtml(!1);
  }
  updateTextNode(e, t) {
    const n = this.nodeByIndex[e], r = this.nodeTemplateByIndex[e], s = this.execBytecode(
      3,
      r,
      e,
      t
    );
    this.nodeValueByIndex[e] === s && e in this.nodeValueByIndex || (n.textContent = s, this.nodeValueByIndex[e] = s);
  }
  updateAttr(e, t) {
    var d;
    const n = this.execBytecode(
      4,
      this.attrTemplateByIndex[e],
      e,
      t
    );
    let r = this.attrNameByIndex[e];
    r === "data-src" && (r = "src");
    const s = this.attrValueByIndex[e];
    if (s === n && e in this.attrValueByIndex) return;
    const o = n === f.REMOVE_ATTR;
    o ? this.node.removeAttribute(r) : this.node.setAttribute(r, n);
    const l = R[r];
    l && (this.node[l] = o ? !1 : !!n), this.attrValueByIndex[e] = n, (d = g == null ? void 0 : g.get(this.node)) != null && d.has(r) && this.node.dispatchEvent(f.getChangeAttrEvent(r, s, n));
  }
  updateInnerHtml(e) {
    if (!this.innerHtmlTemplateBC) return;
    const t = this.runVMProgramForContext(
      7,
      this.innerHtmlTemplateBC,
      0,
      e
    );
    this.innerHTMLValue !== t && (this.node.innerHTML = t, this.innerHTMLValue = t);
  }
  updateVar(e, t) {
    this.lexicalEnv[this.varNameByIndex[e]] = this.runVMProgramForContext(
      6,
      this.varBytecodeByIndex[e],
      e,
      t
    );
  }
  updateAllTextNodes(e) {
    if (this.textNodes)
      for (let t = 0; t < this.textNodes.length; t++)
        this.updateTextNode(this.textNodes[t], e);
  }
  updateAllClones(e) {
    if (this.clones)
      for (let t = 0; t < this.clones.length; t++)
        this.clones[t].internalDetectChanges(e);
  }
  updateAllChildren(e) {
    if (this.children)
      for (let t = 0; t < this.children.length; t++)
        this.children[t].internalDetectChanges(e);
  }
  isTemplate(e) {
    if (!e) return !1;
    const t = e.indexOf(y);
    return t === -1 ? !1 : e.indexOf(M, t + 2) !== -1;
  }
  handleTemplateParseError(e, t, n, r) {
    const s = e.slice(t, Math.min(t + 40, n)) + (n > t + 40 ? "..." : "");
    this.handleError(new Error(r), "template parse", null, e, s);
  }
  getNodeForError() {
    return this.node.outerHTML.split(">")[0] + ">";
  }
  getTemplateBytecode(e, t, n) {
    const r = B.get(e);
    if (r) return r;
    const s = [], o = e.length;
    let l = 0;
    for (; l < o; ) {
      const p = e.indexOf(y, l);
      if (p === -1) {
        l < o && s.push(e.slice(l));
        break;
      }
      p > l && s.push(e.slice(l, p));
      const m = p + 2, h = [];
      let c = m, x = null, A = -1;
      for (; c < o; ) {
        const u = e[c];
        if (x !== null) {
          if (u === "\\") {
            c += 2;
            continue;
          }
          if (u === x) {
            x = null, c++;
            continue;
          }
          c++;
          continue;
        }
        if (u === "'" || u === '"' || u === "`") {
          x = u, c++;
          continue;
        }
        if (u === "(" || u === "[" || u === "{") {
          h.push(u), c++;
          continue;
        }
        if (u === ")") {
          (!h.length || h[h.length - 1] !== "(") && this.handleTemplateParseError(e, m, o, `Unmatched ")" at position ${c}`), h.pop(), c++;
          continue;
        }
        if (u === "]") {
          (!h.length || h[h.length - 1] !== "[") && this.handleTemplateParseError(e, m, o, `Unmatched "]" at position ${c}`), h.pop(), c++;
          continue;
        }
        if (u === "}") {
          if (h.length && h[h.length - 1] === "{") {
            h.pop(), c++;
            continue;
          }
          if (h.length === 0 && e[c + 1] === "}") {
            A = c;
            break;
          }
          if (h.length > 0) {
            const v = h[h.length - 1] === "(" ? ")" : "]";
            this.handleTemplateParseError(e, m, o, `Expected "${v}" but got "}" at position ${c}`);
          }
          this.handleTemplateParseError(e, m, o, `Unexpected "}" at position ${c}`);
        }
        c++;
      }
      if (A === -1) {
        if (h.length > 0) {
          const u = h[h.length - 1], v = u === "(" ? ")" : u === "[" ? "]" : "}";
          this.handleTemplateParseError(e, m, o, `Unclosed "${u}": expected "${v}" before end of expression`);
        }
        s.push(this.getSingleBytecode(e.slice(m).trim(), e));
        break;
      }
      s.push(this.getSingleBytecode(e.slice(m, A).trim(), e)), l = A + 2;
    }
    t && s.length > 1 ? this.handleError(new Error("Template has multi expressions, only single expression is allowed here"), "vm compile", null, e) : s.filter((p) => p instanceof U).length || this.handleError(new Error(`Expression not found, ${this.getNodeForError()} in ${n} attr`), "vm compile", null, e);
    const d = s.length === 1 ? s[0] : s;
    return B.set(e, d), d;
  }
  getItem(e, t, n, r) {
    return typeof e == "string" ? e : this.runVMProgramForContext(t, e, n, r);
  }
  execBytecode(e, t, n, r) {
    if (!Array.isArray(t))
      return this.getItem(t, e, n, r);
    let s = new Array(t.length);
    for (let o = 0; o < t.length; o++) s[o] = this.getItem(t[o], e, n, r);
    return s.join("");
  }
  addClone(e, t, n) {
    const r = new f({
      parent: this.parent,
      node: e,
      self: t,
      root: this.root,
      cloneIndex: n
    });
    return this.clones.push(r), r;
  }
  addChildren(e) {
    return new f({
      node: e,
      self: this.self,
      root: this.root,
      cloneIndex: this.cloneIndex
    });
  }
  hasBindingAttributes(e) {
    for (const t of Array.from(e.attributes)) if (this.isTemplate(t.value)) return !0;
    return !1;
  }
  hasTemplateTextChild(e) {
    for (let t = e.firstChild; t; t = t.nextSibling) if (t.nodeType === Node.TEXT_NODE && this.isTemplate(t.textContent)) return !0;
    return !1;
  }
  handleChildrens(e) {
    const t = [];
    for (let n = e.lastChild; n; n = n.previousSibling)
      t.push(n);
    for (; t.length; ) {
      const n = t.pop();
      if (n.nodeType === 1) {
        const r = n;
        if (this.hasBindingAttributes(r) || this.hasTemplateTextChild(r)) {
          const s = this.addChildren(r);
          s.parent = this, this.children ?? (this.children = []), this.children.push(s);
        } else
          for (let s = r.lastChild; s; s = s.previousSibling)
            t.push(s);
      } else if (n.nodeType === 3) {
        const r = n.textContent;
        if (this.isTemplate(r)) {
          this.nodeByIndex ?? (this.nodeByIndex = []), this.nodeValueByIndex ?? (this.nodeValueByIndex = []);
          const s = this.nodeByIndex.push(n) - 1;
          this.nodeTemplateByIndex ?? (this.nodeTemplateByIndex = []), this.nodeTemplateByIndex.push(this.getTemplateBytecode(r)), this.textNodes ?? (this.textNodes = []), this.textNodes.push(s);
        }
      }
    }
  }
  resetDetectingUpTree() {
    let e = this;
    for (; e; )
      e.detecting = !1, e = e.parent;
  }
  handleError(e, t, n = null, r = "", s = "", o = null) {
    const l = s ? [s] : [];
    r && l.push(r), this.root.selector && l.push(this.root.selector);
    let d = l.join(" at ");
    this.root.debug.__tplFile && (d += ` (${this.root.debug.__tplFile})`);
    let p = o ? ", " + b[o] : "";
    throw e.message = `${t}${p}: ${e.message} in ${d}`, n && (console.log(d), n.log()), e;
  }
  handleSafeError(e, t = "") {
    const n = t ? [t] : [];
    this.root.selector && n.push(this.root.selector);
    let r = n.join(" at ");
    this.root.debug.__tplFile && (r += ` (${this.root.debug.__tplFile})`), console.error(`${e} in ${r}`);
  }
  getSingleBytecode(e, t) {
    e = e.trim();
    let n = C.get(e);
    if (!n)
      try {
        const r = V(e);
        n = new w(r).getBytecode(e), C.set(e, n);
      } catch (r) {
        this.handleError(r, "vm compile", n, t, e);
      }
    return n;
  }
  linkRxToTemplate(e, t, n) {
    if (e === 4) {
      const o = this.attrNameByIndex[n];
      if (o && S.has(o))
        throw new Error(
          `::rx is not allowed in "${o}".`
        );
    }
    let r = this.root.rxAcc.get(t);
    r || (r = /* @__PURE__ */ new Map(), this.root.rxAcc.set(t, r));
    let s = r.get(this);
    s || (s = [null, null, 0, 0, 0, 0], r.set(this, s)), e === 3 ? (s[0] ?? (s[0] = /* @__PURE__ */ new Set()), s[0].add(n)) : e === 4 ? (s[1] ?? (s[1] = /* @__PURE__ */ new Set()), s[1].add(n)) : e === 5 ? s[2] = 1 : e === 1 ? s[3] = 1 : e === 6 ? s[4] = 1 : e === 7 && (s[5] = 1), t.setPostUpdate(this.root.onRxUpdate);
  }
  getRxValue(e, t, n, r, s) {
    return e === 2 || s || r && this.linkRxToTemplate(e, t, n), t.actual;
  }
  getVarFromLexicalEnv(e) {
    let t = this;
    for (; t; ) {
      if (t.lexicalEnv && e in t.lexicalEnv)
        return t.lexicalEnv[e];
      t = t.parent;
    }
  }
  getThisArg(e) {
    return typeof this.cloneIndex == "number" ? this.self(e)[this.cloneIndex] : this.self();
  }
  runVMProgramForContext(e, t, n, r, s = null) {
    try {
      return this.repeatBC && e !== 1 ? void 0 : t.noRunNeeded(this) ? this.onceMap.get(t) : t.run(
        this,
        e,
        n,
        f.appVariables,
        r,
        s
      );
    } catch (o) {
      this.resetDetectingUpTree(), this.handleError(o, "vm run", t, t.expr, null, e);
    }
  }
  handleDomAttributes() {
    const e = this.node.getAttribute("repeat"), t = this.node.getAttribute("attached");
    e ? (this.setPointer(), this.repeatBC = this.getTemplateBytecode(e, !0, "repeat"), this.templateNodeForClone = this.node.cloneNode(!0), this.templateNodeForClone.removeAttribute("repeat"), this.node.remove(), this.clones = []) : t && (this.setPointer(), this.attachedBC = this.getTemplateBytecode(t, !0, "attached"), this.node.removeAttribute("attached"));
  }
  handleAttributes() {
    const e = Array.from(this.node.attributes);
    for (let t = 0; t < e.length; t++) {
      const n = e[t];
      if (!(n.name === "attached" || n.name === "repeat" || !this.isTemplate(n.value)))
        if (n.name.indexOf("on") === 0)
          this.eventAttributes ?? (this.eventAttributes = []), this.eventAttributes.push(n.name), this.eventsBC ?? (this.eventsBC = /* @__PURE__ */ Object.create(null)), this.eventsBC[n.name.slice(2)] = this.getTemplateBytecode(n.value, !0, n.name), this.node.removeAttribute(n.name);
        else if (n.name === "inner-html")
          this.innerHtmlTemplateBC = this.getTemplateBytecode(n.value, !0, n.name), this.node.removeAttribute(n.name);
        else if (n.name.indexOf("let-") === 0) {
          this.varNameByIndex ?? (this.varNameByIndex = []), this.lexicalEnv ?? (this.lexicalEnv = /* @__PURE__ */ Object.create(null));
          const r = this.varNameByIndex.push(f.kebabToCamel(n.name.slice(4))) - 1;
          this.varBytecodeByIndex ?? (this.varBytecodeByIndex = []), this.varBytecodeByIndex.push(this.getTemplateBytecode(n.value, !0, n.name)), this.varAttributes ?? (this.varAttributes = []), this.varAttributes.push(r), this.node.removeAttribute(n.name);
        } else {
          this.attrNameByIndex ?? (this.attrNameByIndex = []), this.attrValueByIndex ?? (this.attrValueByIndex = []);
          const r = this.attrNameByIndex.push(n.name) - 1;
          this.attrTemplateByIndex ?? (this.attrTemplateByIndex = []), this.attrTemplateByIndex.push(this.getTemplateBytecode(n.value, !1, n.name)), this.contentAttributes ?? (this.contentAttributes = []), this.contentAttributes.push(r), this.node.removeAttribute(n.name);
        }
    }
  }
  markDomStructureChanged() {
    typeof this.root.domStructureChanged == "function" && (this.root.domChangedScheduled || (this.root.domChangedScheduled = !0, queueMicrotask(() => {
      this.root.domChangedScheduled = !1, this.root.domStructureChanged();
    })));
  }
  getRxUpdate() {
    return (e) => {
      var t;
      (t = this.root).rxUpdated ?? (t.rxUpdated = /* @__PURE__ */ new Set()), this.root.rxUpdated.add(e), !this.root.rxUpdatedScheduled && (this.root.rxUpdatedScheduled = !0, queueMicrotask(() => {
        if (this.root.rxUpdatedScheduled = !1, !this.root.rxUpdated || !this.root.rxAcc) {
          this.root.rxUpdated = null;
          return;
        }
        for (const n of this.root.rxUpdated) {
          const r = this.root.rxAcc.get(n);
          if (r)
            for (const s of r) {
              const o = s[0], l = s[1];
              if (l[2]) {
                o.reactiveUpdateAttachedAttr();
                continue;
              }
              if (l[4]) {
                o.reactiveUpdateLexicalEnv();
                continue;
              }
              if (l[0])
                for (const d of l[0])
                  o.reactiveUpdateNode(d);
              if (l[1])
                for (const d of l[1])
                  o.reactiveUpdateAttr(d);
              l[3] && o.reactiveUpdateRepeat(), l[5] && o.reactiveUpdateInnerHtml();
            }
        }
        this.root.rxUpdated = null;
      }));
    };
  }
  insertFragmentAfter(e, t) {
    const n = e.parentNode, r = e.nextSibling;
    r ? n.insertBefore(t, r) : n.appendChild(t);
  }
  removePointer() {
    this.pointer && this.pointer.remove();
  }
  getPointer() {
    if (!this.pointer)
      throw new Error(
        [
          'Template initialization error: "pointer" is missing.',
          "This usually means the Template was created when its node was not in the DOM.",
          "You need to call setPointer() after inserting the node into the DOM.",
          `Node: ${this.node.tagName || this.node}`
        ].join(`
`)
      );
    return this.pointer;
  }
  setPointer() {
    this.node.parentNode && (this.pointer = this.node.parentNode.insertBefore(
      document.createComment("p"),
      this.node
    ));
  }
};
i(f, "REMOVE_ATTR", {}), i(f, "appVariables", {});
let E = f;
export {
  E as Template
};
//# sourceMappingURL=template.js.map
