const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Exercise the production controller with deterministic browser event ordering.
// No authenticated account or changes to real conversations are needed.
const source = fs.readFileSync(path.join(__dirname, "../src/components/useChatScroll.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const moduleUnderTest = { exports: {} };
new Function("require", "module", "exports", compiled)(require, moduleUnderTest, moduleUnderTest.exports);
const { createChatScrollController } = moduleUnderTest.exports;

let frames;
let observers;
beforeEach(() => {
  frames = new Map();
  observers = [];
  let nextFrame = 0;
  global.requestAnimationFrame = (callback) => { frames.set(++nextFrame, callback); return nextFrame; };
  global.cancelAnimationFrame = (id) => frames.delete(id);
  global.ResizeObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  };
});

class History extends EventTarget {
  scrollHeight = 2000;
  clientHeight = 500;
  top = 0;
  get scrollTop() { return this.top; }
  set scrollTop(value) { this.top = Math.max(0, Math.min(value, this.scrollHeight - this.clientHeight)); }
  closest() { return null; }
}
function emit(history, type, properties = {}) {
  const event = new Event(type);
  Object.assign(event, properties);
  history.dispatchEvent(event);
}
function flush() {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((callback) => callback());
}
function resize() { observers.filter((observer) => !observer.disconnected).forEach((observer) => observer.callback()); }
function setup() {
  const history = new History();
  const controller = createChatScrollController(history, {});
  flush();
  emit(history, "scroll");
  return { history, controller };
}

test("diagnostic: the previous 100px rule pulls a reader back down after scrolling up 40px", () => {
  const history = new History();
  history.scrollTop = 1460;
  const previousNearBottom = history.scrollHeight - history.scrollTop - history.clientHeight < 100;
  assert.equal(previousNearBottom, true);
  if (previousNearBottom) history.scrollTop = history.scrollHeight;
  assert.equal(history.scrollTop, 1500);
});

test("scrolling up even one pixel preserves the reading position across message updates", () => {
  const { history, controller } = setup();
  history.scrollTop -= 1;
  emit(history, "scroll");
  controller.refresh();
  flush();
  assert.equal(history.scrollTop, 1499);
});

test("upward wheel input cancels a pending jump before the browser emits scroll", () => {
  const { history, controller } = setup();
  history.scrollHeight += 100;
  controller.refresh();
  emit(history, "wheel", { deltaY: -40 });
  history.scrollTop -= 40;
  flush();
  assert.equal(history.scrollTop, 1460);
});

test("a phone swipe cancels pending auto-scroll before its scroll event", () => {
  const { history, controller } = setup();
  history.scrollHeight += 100;
  controller.refresh();
  emit(history, "touchstart", { touches: [{ clientY: 200 }] });
  emit(history, "touchmove", { touches: [{ clientY: 240 }] });
  history.scrollTop -= 40;
  flush();
  assert.equal(history.scrollTop, 1460);
});

test("reading older messages survives live updates, image loads and keyboard resizing", () => {
  const { history, controller } = setup();
  history.scrollTop = 900;
  emit(history, "scroll");
  history.scrollHeight += 300;
  controller.refresh();
  resize();
  history.clientHeight = 250;
  resize();
  flush();
  assert.equal(history.scrollTop, 900);
});

test("at the bottom, new messages and late image sizing keep the latest message visible", () => {
  const { history, controller } = setup();
  history.scrollHeight += 100;
  controller.refresh();
  flush();
  emit(history, "scroll");
  assert.equal(history.scrollTop, 1600);
  history.scrollHeight += 300;
  resize();
  flush();
  assert.equal(history.scrollTop, 1900);
});

test("scrolling down within the old 100px zone does not resume following until the bottom", () => {
  const { history, controller } = setup();
  history.scrollTop = 900;
  emit(history, "scroll");
  history.scrollTop = 1460;
  emit(history, "scroll");
  controller.refresh();
  flush();
  assert.equal(history.scrollTop, 1460);
  history.scrollTop = 1500;
  emit(history, "scroll");
  history.scrollHeight += 100;
  controller.refresh();
  flush();
  assert.equal(history.scrollTop, 1600);
});

test("PageUp cancels pending scroll work", () => {
  const { history, controller } = setup();
  history.scrollHeight += 100;
  controller.refresh();
  emit(history, "keydown", { key: "PageUp" });
  history.scrollTop = 1000;
  flush();
  assert.equal(history.scrollTop, 1000);
});

test("keyboard closing may clamp scrollTop upward without disabling following", () => {
  const { history, controller } = setup();
  history.clientHeight = 800;
  history.scrollTop = history.scrollTop;
  emit(history, "scroll");
  resize();
  flush();
  history.scrollHeight += 100;
  controller.refresh();
  flush();
  assert.equal(history.scrollTop, 1300);
});

test("layout changes reaching the bottom do not reactivate following while reading", () => {
  const { history, controller } = setup();
  history.scrollTop = 900;
  emit(history, "scroll");
  history.scrollHeight = 1400;
  history.scrollTop = history.scrollTop;
  emit(history, "scroll");
  history.scrollHeight += 300;
  controller.refresh();
  flush();
  assert.equal(history.scrollTop, 900);
});

test("sending a message explicitly returns to the latest message", () => {
  const { history, controller } = setup();
  history.scrollTop = 900;
  emit(history, "scroll");
  history.scrollHeight += 100;
  controller.scrollToLatest();
  flush();
  assert.equal(history.scrollTop, 1600);
});

test("leaving a thread cancels queued scrolling and disconnects its observer", () => {
  const { history, controller } = setup();
  history.scrollHeight += 100;
  controller.refresh();
  controller.dispose();
  resize();
  flush();
  assert.equal(history.scrollTop, 1500);
  assert.equal(observers[0].disconnected, true);
});
