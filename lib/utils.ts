export function arrayToHash<I extends Record<PropertyKey, any>, K extends keyof I>(
  arr: I[],
  key: K
): Record<string, I> {
  const out: Record<string, I> = {};
  for (const item of arr) out[item[key]] = item;
  return out;
}

export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

export function debounce<T extends (...args: any[]) => any>(
  ms: number,
  cb: T
) {
  let tm: any;

  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(tm);

    tm = setTimeout(() => {
      cb.apply(this, args);
    }, ms);
  };
}
