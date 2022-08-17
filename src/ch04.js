const bucket = new WeakMap();

const data = { text: "HW" };

let activeEffect;
function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn;
    fn();
  };
  effectFn.deps = [];
  effectFn();
}

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newVal) {
    target[key] = newVal;
    trigger(target, key);
    return true;
  }
});

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  if (!effects) return;
  effects.forEach((effect) => effect());
}

effect(() => {
  console.log("effect func run");
  document.body.innerText = obj.text;
});

obj.text = "HHW";
