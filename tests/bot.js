// 自動プレイボット（テストとデバッグで共用）
const assert = require('assert');
const { load } = require('../tools/load');
const { D, C } = load();


const SUS = ['c1_sus_gonzalez', 'c1_sus_bosston', 'c1_sus_chef', 'c1_sus_madame'];
const ROUTES = ['route_A', 'route_B', 'route_C', 'route_D'];
const TRUST = ['trust_buhita', 'trust_madame', 'trust_bosston', 'trust_chef'];
const DISC = ['disclose', 'conceal'];

function runScene(st, plan) {
  for (let guard = 0; guard < 5000; guard++) {
    const r = C.resolve(st);
    const s = r.step;
    if (s.type === 'line' || s.type === 'card') { C.advance(st); continue; }
    if (s.type === 'choice') {
      const opt = s.options.find(o => plan.includes(o.id)) || s.options[0];
      assert(opt, 'choice with no options at ' + st.scene.id);
      C.choose(st, opt); continue;
    }
    return s; // hub / final / ending
  }
  throw new Error('scene runaway');
}

function sig(st) {
  return [st.evidence.length, st.secrets.length, st.deductions.length, st.testimonies.length,
    Object.keys(st.flags).length, Object.keys(st.heard).length, Object.values(st.investigated).flat().length].join(',');
}

// 「知識を持った」プレイヤー：正解の指摘・条件を満たす追及だけを行う
function explore(st, opts = {}) {
  let before;
  let rounds = 0;
  do {
    before = sig(st);
    if (++rounds > 50) throw new Error('explore did not converge');
    for (const loc of C.locations(st)) {
      st.loc = loc.id;
      for (const t of C.targets(st, loc.id)) {
        const s = C.targetStatus(st, t);
        if (s === 'new' || s === 'again') C.investigate(st, t.id);
      }
      for (const p of C.peopleHere(st)) {
        for (const deep of [false, true]) for (const tp of C.topics(st, p, deep)) if (!st.heard[tp.id]) C.talk(st, p, tp.id);
        for (const ev of st.evidence.slice()) C.present(st, p, ev);
        for (const c of C.contradictions(st, p)) {
          if (st.heard['contra:' + c.id]) continue;
          const ev = c.ev.find(e => st.evidence.includes(e));
          if (ev && C.evalCond(st, c.cond)) C.contradict(st, p, c.testimony, ev);
        }
        for (const pr of C.presses(st, p)) {
          if (!st.heard['press:' + pr.id] && C.evalCond(st, pr.cond)) C.press(st, p, pr.id);
        }
      }
    }
    const ev = st.evidence.slice();
    for (let i = 0; i < ev.length; i++) for (let j = i + 1; j < ev.length; j++) {
      const ok = D.deductions.some(d => d.pairs.some(p => (p[0] === ev[i] && p[1] === ev[j]) || (p[1] === ev[i] && p[0] === ev[j])));
      if (ok) C.combine(st, ev[i], ev[j]);
    }
  } while (sig(st) !== before);
}

function combineAll(st) {
  const ev = st.evidence.slice();
  for (let i = 0; i < ev.length; i++) for (let j = i + 1; j < ev.length; j++) {
    const ok = D.deductions.some(d => d.pairs.some(p => (p[0] === ev[i] && p[1] === ev[j]) || (p[1] === ev[i] && p[0] === ev[j])));
    if (ok) C.combine(st, ev[i], ev[j]);
  }
}

// 下手なプレイ：会える犬全員に、手持ち証拠で片っ端から間違った指摘・失敗する追及をする
function sabotage(st) {
  for (const loc of C.locations(st)) {
    st.loc = loc.id;
    for (const p of C.peopleHere(st)) {
      for (const t of C.testimoniesOf(st, p)) for (const ev of st.evidence) {
        const right = (D.talks[p].contra || []).some(c => c.testimony === t && c.ev.includes(ev));
        if (!right) C.contradict(st, p, t, ev);
      }
      for (const pr of C.presses(st, p)) if (!C.evalCond(st, pr.cond)) C.press(st, p, pr.id);
    }
  }
}

function playToFinal(plan, opts = {}) {
  const st = C.createState();
  let s = runScene(st, plan);
  while (s.type === 'hub') {
    // 1回だけ軽く調べてから下手なプレイ → 正しいプレイ
    if (opts.sabotage) { explore(st); sabotage(st); sabotage(st); }
    explore(st);
    const missing = C.goals(st).filter(g => !g.done).map(g => g.label);
    assert.deepStrictEqual(missing, [], `ch${st.chapter} softlock with plan ${plan.join('/')}${opts.sabotage ? ' (sabotage)' : ''}: ${missing}`);
    C.finishChapter(st);
    s = runScene(st, plan);
  }
  assert.strictEqual(s.type, 'final', 'expected final deduction');
  // 最終推理画面でも推理ノート（組み合わせ）は使える
  combineAll(st);
  return st;
}

function reachableEndings(st) {
  const found = {};
  const O = D.finalOptions;
  for (const su of O.suspects) for (const mo of O.motives) for (const tr of O.tricks) for (const ev of st.evidence) {
    const t = C.clone(st);
    const r = C.evaluateEnding(t, { suspect: su.id, motive: mo.id, trick: tr.id, evidence: ev });
    if (!found[r.id]) found[r.id] = { suspect: su.id, motive: mo.id, trick: tr.id, evidence: ev, missing: r.missing };
  }
  return found;
}


module.exports = { combineAll, D, C, SUS, ROUTES, TRUST, DISC, runScene, explore, sabotage, playToFinal, reachableEndings };
