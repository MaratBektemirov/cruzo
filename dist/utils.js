function r(t, e) {
  const o = {};
  for (const n of t) o[n[e]] = n;
  return o;
}
function u(t) {
  return new Promise((e) => {
    setTimeout(() => {
      e(!0);
    }, t);
  });
}
function i(t, e) {
  let o;
  return function(...n) {
    clearTimeout(o), o = setTimeout(() => {
      e.apply(this, n);
    }, t);
  };
}
export {
  r as arrayToHash,
  i as debounce,
  u as delay
};
//# sourceMappingURL=utils.js.map
