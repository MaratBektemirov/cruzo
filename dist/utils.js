function r(t, e) {
  const n = {};
  for (const o of t) n[o[e]] = o;
  return n;
}
function u(t) {
  return new Promise((e) => {
    setTimeout(() => {
      e(!0);
    }, t);
  });
}
function i(t, e) {
  let n;
  return function(...o) {
    clearTimeout(n), n = setTimeout(() => {
      e.apply(this, o);
    }, t);
  };
}
export {
  r as arrayToHash,
  i as debounce,
  u as delay
};
//# sourceMappingURL=utils.js.map
