function c(e, t) {
  const r = {};
  for (const n of e)
    r[n[t]] = n;
  return r;
}
function f(e, t = 2) {
  return parseFloat((+e).toFixed(t));
}
function m(e) {
  return new Promise((t) => {
    setTimeout(() => {
      t(!0);
    }, e);
  });
}
function d(e, t) {
  let r;
  return (n, u, i, s) => new Promise((a) => {
    let o = setTimeout(() => {
      r === o && a(t(n, u, i, s));
    }, e);
    r = o;
  });
}
export {
  c as arrayToHash,
  d as debounce,
  m as delay,
  f as roundValue
};
//# sourceMappingURL=utils.js.map
