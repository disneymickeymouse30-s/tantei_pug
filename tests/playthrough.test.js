// 全分岐総当たりテスト：
//  - 第1章の疑い(4) × 第3章ルート(4) × 第4章の信頼(4) × 伝票の公表/伏せる(2) = 128 通りを自動プレイ
//  - 各章で進行不能にならないこと（目標が全て達成可能）
//  - 最終推理の全組み合わせを試し、各エンディングに到達可能な経路が存在すること
//  - 「下手なプレイ」（間違った指摘で信頼度を下げまくる）でも進行不能にならないこと
//  - 各エンディングのシーンを最後まで再生できること
const assert = require('assert');
const { D, C, SUS, ROUTES, TRUST, DISC, runScene, playToFinal, reachableEndings } = require('./bot');

let total = 0;
const endingPaths = {};
const perRouteTrue = {};
for (const sus of SUS) for (const route of ROUTES) for (const tr of TRUST) for (const di of DISC) {
  const plan = [sus, route, tr, di];
  const st = playToFinal(plan);
  const found = reachableEndings(st);
  assert(found.end5, 'END5 must always be reachable');
  for (const id of Object.keys(found)) (endingPaths[id] = endingPaths[id] || []).push(plan.join('/'));
  if (found.end6) perRouteTrue[route] = (perRouteTrue[route] || 0) + 1;
  total++;
}
console.log(`played ${total} branch combinations without softlock`);

// 下手なプレイでも詰まないこと（各ルート×信頼）
let sab = 0;
for (const route of ROUTES) for (const tr of TRUST) {
  playToFinal(['c1_sus_madame', route, tr, 'disclose'], { sabotage: true });
  sab++;
}
console.log(`sabotage playthroughs: ${sab} OK`);

for (const id of D.endingOrder) {
  assert(endingPaths[id] && endingPaths[id].length, `ending ${id} is unreachable`);
  console.log(`${id}: reachable in ${endingPaths[id].length}/128 paths  e.g. ${endingPaths[id][0]}`);
}
for (const r of ROUTES) assert(perRouteTrue[r] > 0, `true end unreachable from ${r}`);
console.log('true end reachable from every route:', JSON.stringify(perRouteTrue));

// ルートごとのエンディング条件の違いを検証
const only = (id, pred) => endingPaths[id].every(p => pred(p));
assert(only('end1', p => p.includes('route_A')), 'END1 must require route A');
assert(only('end3', p => p.includes('route_C')), 'END3 must require route C');
assert(only('end2', p => p.includes('route_B') || p.includes('trust_chef')), 'END2 needs B or chef');
assert(only('end4', p => p.includes('route_D') || p.includes('trust_madame')), 'END4 needs D or madame');
assert(only('end6', p => p.includes('route_D') || p.includes('trust_buhita') || p.includes('trust_madame')), 'END6 needs stunt evidence');
console.log('route-specific ending conditions: OK');

// 各エンディングのシーンを最後まで再生
for (const id of D.endingOrder) {
  const plan = endingPaths[id][0].split('/');
  const st = playToFinal(plan);
  const acc = reachableEndings(st)[id];
  const res = C.evaluateEnding(st, acc);
  assert.strictEqual(res.id, id);
  if (id === 'end5') assert(res.missing.length > 0, 'END5 must list what was missed');
  C.startScene(st, D.endings[id].scene);
  const s = runScene(st, plan);
  assert.strictEqual(s.type, 'ending'); assert.strictEqual(s.id, id);
}
console.log('all 6 ending scenes play to completion');

// END5 の全分岐（告発相手ごと）を再生
{
  const st0 = playToFinal(['c1_sus_gonzalez', 'route_A', 'trust_buhita', 'conceal']);
  for (const su of D.finalOptions.suspects) {
    const st = C.clone(st0);
    const r = C.evaluateEnding(st, { suspect: su.id, motive: 'greed', trick: 'rain_entry', evidence: st.evidence[0] });
    assert.strictEqual(r.id, 'end5');
    C.startScene(st, 'end5_s');
    assert.strictEqual(runScene(st, []).id, 'end5');
  }
  console.log('END5 variants for every accused suspect play OK');
}

// トゥルーエンドは推理不足だと解放されない
{
  const st = playToFinal(['c1_sus_chef', 'route_A', 'trust_bosston', 'disclose']);
  const r = C.evaluateEnding(st, { suspect: 'multi', motive: 'publicity', trick: 'lift_mixup', evidence: 'ev_waybill' });
  assert.strictEqual(r.id, 'end5', 'true end must be locked without stunt evidence');
  assert(r.missing.some(m => m.includes('「消失」の目的')));
  console.log('true end is locked without required deductions: OK');
}
console.log('\nplaythrough: ALL PASSED');
