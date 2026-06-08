var u = Object.defineProperty;
var d = (c, t, e) => t in c ? u(c, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : c[t] = e;
var i = (c, t, e) => d(c, typeof t != "symbol" ? t + "" : t, e);
import { componentsRegistryService as o } from "./components-registry.service.js";
import { Template as l } from "./template.js";
import { Rx as a, RxFunc as f } from "./rx.js";
class B {
  constructor() {
    i(this, "id", "");
    i(this, "index", "");
    i(this, "selector", "");
    i(this, "node", null);
    i(this, "http", null);
    i(this, "outerBucket", null);
    i(this, "innerBucket", null);
    i(this, "destroyed", !1);
    i(this, "ac", null);
    i(this, "dependencies", null);
    i(this, "connectedDependencies", null);
    i(this, "hasOuterBucket", !1);
    i(this, "hasConfig", !1);
    i(this, "isDirective", !1);
    i(this, "template", null);
    i(this, "rxList", null);
    i(this, "value$", this.newRx());
    i(this, "value", null);
    i(this, "state$", this.newRx());
    i(this, "state", null);
    i(this, "config", null);
    i(this, "config$", this.newRx());
    i(this, "__tplFile", "");
    i(this, "onUpdateValue", (t, e, s) => {
      this.index !== e || this.value === t || this.setValue(s);
    });
    i(this, "onUpdateState", (t, e, s) => {
      this.index !== e || this.state === t || this.setState(s);
    });
    i(this, "onUpdateConfig", (t) => {
      this.config !== t && this.setConfig();
    });
  }
  disconnectedCallback(t = !1) {
    if (this.destroyed = !0, this.ac && this.ac.abort(), this.template && this.template.fullDestroy(), t && this.node && !this.isDirective && this.node.remove(), this.connectedDependencies && o.removeComponents(this.connectedDependencies), this.rxList) for (; this.rxList.length; ) this.rxList.pop().unsubscribe();
    this.innerBucket && o.disconnectBucket(this.innerBucket);
  }
  getBucket() {
    const t = this.getBucketId(), e = o.buckets[t];
    if (t && !e)
      throw new Error(
        `Bucket "${t}" not found for selector "${this.selector}" (component-id="${this.id}")`
      );
    return e;
  }
  connectedCallback(t = null) {
    if (this.id = this.getId(), this.index = this.getIndex() || "0", this.outerBucket = this.getBucket(), this.hasOuterBucket && this.outerBucket) {
      this.rxList ?? (this.rxList = []), this.setValue(), this.outerBucket.newRxValue(
        this.id,
        this.onUpdateValue,
        this.rxList,
        this.outerBucket.getValue(this.id, this.index),
        this.index
      ), this.setState(), this.outerBucket.newRxState(
        this.id,
        this.onUpdateState,
        this.rxList,
        this.outerBucket.getState(this.id, this.index),
        this.index
      );
      const e = this.outerBucket.descriptors[this.id];
      if (this.hasConfig) {
        if (!e)
          throw new Error(
            `Descriptor not found for selector "${this.selector}" id "${this.id}" in bucket "${this.getBucketId()}"`
          );
        if (!e.config)
          throw new Error(
            `Config in descriptor not found for selector "${this.selector}" id "${this.id}" in bucket "${this.getBucketId()}"`
          );
        this.setConfig(), this.newRxFunc(this.onUpdateConfig, this.outerBucket.getConfigRx(this.id));
      }
    }
    if (this.innerBucket && o.connectBucket(this.innerBucket), !this.isDirective && !(t != null && t.disableTemplate) && this.initTemplate(), t != null && t.httpFactory) {
      this.ac = new AbortController();
      const e = Object.keys(t.httpFactory);
      this.http = /* @__PURE__ */ Object.create(null);
      for (const s of e)
        this.http[s] = t.httpFactory[s](this.ac.signal);
    }
  }
  getBucketId() {
    return this.node.getAttribute("bucket-id");
  }
  getId() {
    return this.node.getAttribute("component-id");
  }
  getIndex() {
    return this.node.getAttribute("component-index");
  }
  getHTML() {
    return "";
  }
  setValue(t = !1) {
    this.value = this.outerBucket.getValue(this.id, this.index), this.value$.update(this.value);
  }
  setState(t = !1) {
    this.state = this.outerBucket.getState(this.id, this.index), this.state$.update(this.state);
  }
  setConfig() {
    this.config = this.outerBucket.descriptors[this.id].config, this.config$.update(this.config);
  }
  updateDependencies() {
    if (!(!this.dependencies || !this.dependencies.size)) {
      if (this.connectedDependencies) {
        let t = null, e = null;
        for (const s of this.connectedDependencies)
          document.contains(s.node) ? (e ?? (e = []), e.push(s)) : (t ?? (t = []), t.push(s));
        this.connectedDependencies = e, t && o.removeComponents(t);
      }
      for (const t of this.dependencies) this.connectDependency(t);
    }
  }
  connectDependency(t) {
    return this.connectedDependencies ?? (this.connectedDependencies = []), o.connectBySelector(
      t,
      this.connectedDependencies,
      this.node
    );
  }
  addDependencies(t) {
    this.dependencies ?? (this.dependencies = /* @__PURE__ */ new Set());
    for (const e of t) this.dependencies.add(e);
  }
  initTemplate() {
    const t = this.getHTML();
    t && (this.node.innerHTML = t, this.template = new l({
      node: this.node,
      self: () => this,
      selector: this.selector,
      __tplFile: this.__tplFile,
      domStructureChanged: () => {
        this.domStructureChanged();
      }
    }), this.template.detectChanges(), this.updateDependencies());
  }
  domStructureChanged() {
    this.updateDependencies();
  }
  newRx(t = null) {
    this.rxList ?? (this.rxList = []);
    const e = new a(this.rxList, (s) => s);
    return e.update(t), e;
  }
  newRxFunc(t, ...e) {
    return this.rxList ?? (this.rxList = []), new f(this.rxList, t, { immediate: !0 }, ...e);
  }
  newRxEventFromBucket(t, e, s) {
    return this.rxList ?? (this.rxList = []), t.newRxEvent(e, s, (n) => n, this.rxList);
  }
  newRxValueFromBucket(t, e, s = "0") {
    return this.rxList ?? (this.rxList = []), t.newRxValue(e, (n) => n, this.rxList, t.getValue(e, s), s);
  }
  newRxStateFromBucket(t, e, s = "0") {
    return this.rxList ?? (this.rxList = []), t.newRxState(e, (n) => n, this.rxList, t.getState(e, s), s);
  }
  newRxEventFromBucketByIndex(t, e, s) {
    this.rxList ?? (this.rxList = []);
    const n = {};
    return t.newRxEvent(e, s, (h, r) => (n[r] = h, n), this.rxList);
  }
}
export {
  B as AbstractComponent
};
//# sourceMappingURL=component.js.map
