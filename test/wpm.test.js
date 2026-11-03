const test = require('node:test');
const assert = require('node:assert');
const { Tracker } = require('../src/wpm');

test('idle is zero', () => assert.strictEqual(new Tracker().wpm(1000), 0));

test('60 chars over 12 s window-capped is ~60 wpm steady state', () => {
  const t = new Tracker({ windowMs: 8000 });
  // 5 chars/sec = 60 wpm, for 20 s
  for (let ms = 0; ms < 20000; ms += 200) t.type(ms);
  assert.ok(Math.abs(t.wpm(20000) - 60) <= 3, `got ${t.wpm(20000)}`);
});

test('backspaces reduce speed', () => {
  const t = new Tracker();
  for (let ms = 0; ms < 5000; ms += 200) t.type(ms);
  const before = t.wpm(5000);
  for (let ms = 5000; ms < 6000; ms += 200) t.backspace(ms);
  assert.ok(t.wpm(6000) < before);
});

test('decays to zero after typing stops', () => {
  const t = new Tracker();
  for (let ms = 0; ms < 3000; ms += 200) t.type(ms);
  assert.strictEqual(t.wpm(30000), 0);
});

test('a single burst does not spike', () => {
  const t = new Tracker();
  t.type(0); t.type(50);
  assert.ok(t.wpm(100) < 10);
});

test('speed tiers', () => {
  const { tier } = require('../src/wpm');
  assert.deepStrictEqual([0, 39, 40, 64, 65, 100, 101].map(tier),
    ['red', 'red', 'yellow', 'yellow', 'green', 'green', 'blue']);
});
