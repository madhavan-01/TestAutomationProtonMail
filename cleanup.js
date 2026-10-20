const fns = [];
export const addCleanup = (fn) => fns.push(fn);
export const runCleanups = () => {
  while (fns.length) fns.pop()();
};
