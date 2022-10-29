// packages/shared/src/index.ts
var isObject = (val) => {
  return val !== null && typeof val === "object";
};
function isFunction(value) {
  return typeof value === "function";
}

// packages/reactivity/src/effect.ts
var activeEffect;
function cleanupEffect(effect) {
  let { deps } = effect;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect);
  }
  effect.deps.length = 0;
}
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    this.parent = void 0;
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    try {
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
    }
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
    }
  }
};

// packages/reactivity/src/reactive.ts
function isReactive(target) {
  return !!(target && target["__v_isReactive" /* IS_REACTIVE */]);
}

// packages/runtime-core/src/apiWatch.ts
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function traverse(source, s = /* @__PURE__ */ new Set()) {
  if (!isObject(source)) {
    return source;
  }
  if (s.has(source)) {
    return source;
  }
  s.add(source);
  for (let key in source) {
    traverse(source[key], s);
  }
  return source;
}
function doWatch(source, cb, options) {
  let getter;
  if (isReactive(source)) {
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldValue;
  const job = () => {
    let newValue = effect.run();
    cb(newValue, oldValue);
    oldValue = newValue;
  };
  const effect = new ReactiveEffect(getter, job);
  if (options.immediate) {
    return job();
  }
  oldValue = effect.run();
}
export {
  watch
};
//# sourceMappingURL=runtime-core.esm.js.map
