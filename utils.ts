export function arrayToHash<I extends Record<PropertyKey, any>, K extends keyof I>(
  arr: I[],
  key: K
): Record<string, I> {
  const hash: Record<string, I> = {};

  for (const item of arr) {
    hash[item[key]] = item;
  }

  return hash;
}

export function roundValue(value: string | number, n = 2) {
  return parseFloat((+value).toFixed(n));
}

export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

export function debounce<A1,A2,A3,A4,B>(
  ms: number,
  cb: (a1?: A1, a2?: A2, a3?: A3, a4?: A4) => B
) {
  let currentTmId: any;

  return (a1?: A1, a2?: A2, a3?: A3, a4?: A4) => {
    return new Promise<B>((resolve) => {
      let tmId = setTimeout(() => {
        if (currentTmId !== tmId) {
          return;
        }

        resolve(cb(a1, a2, a3, a4));
      }, ms);

      currentTmId = tmId;
    })
  };
}
