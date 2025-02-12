if (typeof global.setImmediate === "undefined") {
  global.setImmediate = (fn, ...args) => {
    return setTimeout(fn, 0, ...args);
  };
}
