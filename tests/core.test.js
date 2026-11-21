// コアの単体テスト：セーブの壊れ・旧形式移行・条件式・第3章プリセットからの到達性
const assert = require('assert');
const { D, C, explore, runScene, reachableEndings, combineAll } = require('./bot');

// 壊れたデータ
assert.strictEqual(C.deserialize('{oops'), null);
assert.strictEqual(C.deserialize('null'), null);
assert.strictEqual(C.deserialize(JSON.stringify({ ver: 99 })), null, '未来の形式は読み込まない');
assert.strictEqual(C.deserialize(JSON.stringify({ ver: 2, mode: 'scene', scene: { id: 'no_such_scene', idx: 0 } })), null);
// 旧形式 v1 の移行
const v1 = C.deserialize(JSON.stringify({ chapter: 2, mode: 'hub', trust: [80, 10], talked: { b1_case: true }, evidence: ['ev_clock', 'bogus'], deductions: ['d_clock', 'd_bogus'] }));
assert.strictEqual(v1.ver, 2); assert.strictEqual(v1.trust.buhita, 80); assert.strictEqual(v1.trust.bosston, 10); assert.strictEqual(v1.trust.madame, 50);
assert.deepStrictEqual(v1.evidence, ['ev_clock']); assert.deepStrictEqual(v1.deductions, ['d_clock']); assert(v1.heard.b1_case);
// 往復
const st = C.createState(); st.evidence.push('ev_drool'); st.flags.x = true; st.trust.chef = 12;
assert.deepStrictEqual(C.deserialize(C.serialize(st)), st);
// 条件式
assert(C.evalCond(st, { all: [{ has: 'ev_drool' }, { not: { has: 'ev_clock' } }, { trust: ['chef', '<', 20] }] }));
assert.throws(() => C.evalCond(st, { nonsense: 1 }));
// 信頼度は0〜100に収まる
C.applyEffects(st, [{ trust: ['chef', -500] }]); assert.strictEqual(st.trust.chef, 0);
console.log('save/migration/conditions: OK');

// 第3章プリセット（2周目）から全ルートで最終推理に到達し、ルート固有のエンドが取れる
const want = { route_A: 'end1', route_B: 'end2', route_C: 'end3', route_D: 'end4' };
for (const route of Object.keys(want)) {
  const s = C.chapterPreset(3);
  let r = runScene(s, [route, 'trust_buhita', 'conceal']);
  while (r.type === 'hub') { explore(s); assert(C.canFinishChapter(s), 'preset softlock ' + route); C.finishChapter(s); r = runScene(s, [route, 'trust_madame', 'conceal']); }
  assert.strictEqual(r.type, 'final');
  combineAll(s);
  const f = reachableEndings(s);
  assert(f[want[route]], 'preset ' + route + ' cannot reach ' + want[route]);
  assert(f.end6, 'preset ' + route + ' cannot reach true end');
}
console.log('chapter-3 preset: every route reaches its own ending and the true end: OK');
console.log('\ncore: ALL PASSED');
