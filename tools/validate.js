// シナリオデータの静的検証：存在しないID・終端のないシーン・到達不能なシーン・入手不能な証拠を検出
const { load } = require('./load');
const { D, C } = load();

const errors = [], warns = [];
const err = (m) => errors.push(m);
const FACES = ['normal', 'think', 'sweat', 'shout', 'surprised', 'smug', 'drool', 'excited', 'angry', 'sad', 'happy', 'sleep'];
const TERMINAL = ['jump', 'branch', 'choice', 'hub', 'final', 'ending', 'title'];
const evIds = new Set(Object.keys(D.evidence));
const dedIds = new Set(D.deductions.map(d => d.id));
const sources = { give: new Set(), testimony: new Set(), secret: new Set(), set: new Set() };
const usedFlags = new Set();

function checkCond(c, where) {
  if (c === undefined || c === null || typeof c === 'boolean') return;
  if (Array.isArray(c)) return c.forEach(x => checkCond(x, where));
  if (c.all) return c.all.forEach(x => checkCond(x, where));
  if (c.any) return c.any.forEach(x => checkCond(x, where));
  if (c.not) return checkCond(c.not, where);
  if (c.has && !evIds.has(c.has)) err(`${where}: unknown evidence in cond ${c.has}`);
  if (c.deduced && !dedIds.has(c.deduced)) err(`${where}: unknown deduction ${c.deduced}`);
  if (c.secret && !D.secrets[c.secret]) err(`${where}: unknown secret ${c.secret}`);
  if (c.testimony && !D.testimonies[c.testimony]) err(`${where}: unknown testimony ${c.testimony}`);
  if (c.trust && !D.characters[c.trust[0]]) err(`${where}: unknown char ${c.trust[0]}`);
  if (c.flag) usedFlags.add(c.flag);
  if (c.noflag) usedFlags.add(c.noflag);
  if (c.route && !['A', 'B', 'C', 'D'].includes(c.route)) err(`${where}: bad route ${c.route}`);
  if (c.countEv) c.countEv.ids.forEach(i => evIds.has(i) || err(`${where}: unknown ev ${i}`));
  try { C.evalCond(C.createState(), c); } catch (e) { err(`${where}: ${e.message}`); }
}
function checkEffects(effs, where) {
  (effs || []).forEach(e => {
    if (e.give) { evIds.has(e.give) ? sources.give.add(e.give) : err(`${where}: unknown evidence ${e.give}`); }
    if (e.testimony) { D.testimonies[e.testimony] ? sources.testimony.add(e.testimony) : err(`${where}: unknown testimony ${e.testimony}`); }
    if (e.secret) { D.secrets[e.secret] ? sources.secret.add(e.secret) : err(`${where}: unknown secret ${e.secret}`); }
    if (e.deduce && !dedIds.has(e.deduce)) err(`${where}: unknown deduction ${e.deduce}`);
    if (e.trust && !D.characters[e.trust[0]]) err(`${where}: unknown char ${e.trust[0]}`);
    if (e.set) sources.set.add(e.set);
  });
}
function checkLine(raw, where) {
  const ln = C.parseLine(raw);
  if (ln.who && !D.characters[ln.who]) err(`${where}: unknown speaker ${ln.who}`);
  if (ln.who && !FACES.includes(ln.face)) err(`${where}: unknown face ${ln.face}`);
  if (!ln.text || !ln.text.trim()) err(`${where}: empty line`);
}
function checkSteps(steps, where, isScene) {
  steps.forEach((st, i) => {
    const w = `${where}#${i}`;
    const t = C.stepType(st);
    if (t === 'unknown') err(`${w}: unknown step ${JSON.stringify(st)}`);
    if (t === 'line') checkLine(st, w);
    if (t === 'effects') checkEffects(st.effects, w);
    if (t === 'show') st.show.forEach(c => D.characters[c] || err(`${w}: unknown char ${c}`));
    if (!isScene && TERMINAL.includes(t)) err(`${w}: control step not allowed in inline lines`);
    if (t === 'jump' && !D.scenes[st.jump]) err(`${w}: jump to missing scene ${st.jump}`);
    if (t === 'branch') {
      st.branch.forEach(b => { checkCond(b.cond, w); D.scenes[b.next] || err(`${w}: branch to missing ${b.next}`); });
      if (!D.scenes[st['else']]) err(`${w}: branch else missing ${st['else']}`);
    }
    if (t === 'choice') {
      const ids = new Set();
      st.choice.forEach(o => {
        if (!o.id) err(`${w}: choice option without id`);
        if (ids.has(o.id)) err(`${w}: duplicate choice id ${o.id}`);
        ids.add(o.id);
        checkCond(o.cond, w); checkEffects(o.effects, w);
        D.scenes[o.next] || err(`${w}: choice to missing ${o.next}`);
      });
    }
    if (t === 'hub' && !D.chapterGoals[st.hub]) err(`${w}: hub chapter without goals ${st.hub}`);
    if (t === 'hub' && st.loc && !D.locations.find(l => l.id === st.loc)) err(`${w}: hub loc missing ${st.loc}`);
    if (t === 'ending' && !D.endings[st.ending]) err(`${w}: unknown ending ${st.ending}`);
  });
  if (isScene) {
    const last = steps[steps.length - 1];
    if (!TERMINAL.includes(C.stepType(last))) err(`${where}: scene does not end with a control step`);
    steps.slice(0, -1).forEach((st, i) => {
      const t = C.stepType(st);
      if (['jump', 'branch', 'choice', 'final', 'ending'].includes(t)) err(`${where}#${i}: unreachable steps after ${t}`);
    });
  }
}

/* シーン */
Object.entries(D.scenes).forEach(([id, steps]) => checkSteps(steps, `scene:${id}`, true));
/* 調査対象 */
const tIds = new Set();
D.targets.forEach(t => {
  if (tIds.has(t.id)) err(`duplicate target ${t.id}`); tIds.add(t.id);
  if (!D.locations.find(l => l.id === t.loc)) err(`target ${t.id}: unknown loc ${t.loc}`);
  checkCond(t.cond, `target:${t.id}`);
  t.results.forEach((r, i) => { checkCond(r.cond, `target:${t.id}#${i}`); checkEffects(r.effects, `target:${t.id}#${i}`); checkSteps(r.lines, `target:${t.id}#${i}`, false); });
});
D.locations.forEach(l => { checkCond(l.cond, `loc:${l.id}`); Object.values(l.people || {}).flat().forEach(p => D.talks[p] || err(`loc:${l.id}: no talk data for ${p}`)); });
/* 聞き込み */
const topicIds = new Set();
Object.entries(D.talks).forEach(([cid, td]) => {
  if (!D.characters[cid]) err(`talk: unknown char ${cid}`);
  td.topics.forEach(tp => {
    if (topicIds.has(tp.id)) err(`duplicate topic ${tp.id}`); topicIds.add(tp.id);
    checkCond(tp.cond, `topic:${tp.id}`); checkEffects(tp.effects, `topic:${tp.id}`);
    if (tp.testimony) { D.testimonies[tp.testimony] ? sources.testimony.add(tp.testimony) : err(`topic ${tp.id}: unknown testimony`); }
    checkSteps(tp.lines, `topic:${tp.id}`, false);
    (tp.variants || []).forEach((v, i) => { checkCond(v.cond, `topic:${tp.id}/v${i}`); checkEffects(v.effects, `topic:${tp.id}/v${i}`); checkSteps(v.lines, `topic:${tp.id}/v${i}`, false); });
    if (!tp.lines.length && !(tp.variants || []).length) err(`topic ${tp.id}: no lines`);
  });
  td.topics.forEach(tp => { if (tp.parent && !topicIds.has(tp.parent) && !td.topics.find(x => x.id === tp.parent)) err(`topic ${tp.id}: unknown parent ${tp.parent}`); });
  (td.present || []).forEach((p, i) => { evIds.has(p.ev) || err(`present ${cid}: unknown ev ${p.ev}`); checkEffects(p.effects, `present:${cid}#${i}`); checkSteps(p.lines, `present:${cid}#${i}`, false); });
  (td.wrong || []).forEach((w, i) => checkSteps(Array.isArray(w) ? w : [w], `wrong:${cid}#${i}`, false));
  (td.contra || []).forEach(c => {
    D.testimonies[c.testimony] || err(`contra ${c.id}: unknown testimony`);
    if (D.testimonies[c.testimony] && D.testimonies[c.testimony].who !== cid) err(`contra ${c.id}: testimony belongs to another dog`);
    c.ev.forEach(e => evIds.has(e) || err(`contra ${c.id}: unknown ev ${e}`));
    checkCond(c.cond, `contra:${c.id}`); checkEffects(c.effects, `contra:${c.id}`); checkSteps(c.lines, `contra:${c.id}`, false);
  });
  (td.press || []).forEach(p => { if (!p.label) err(`press ${p.id}: no label`); checkCond(p.show, `press:${p.id}`); checkCond(p.cond, `press:${p.id}`); checkEffects(p.effects, `press:${p.id}`); checkSteps(p.lines, `press:${p.id}`, false); checkSteps(p.fail, `press:${p.id}/fail`, false); });
});
/* 推理 */
D.deductions.forEach(d => {
  d.pairs.forEach(p => p.forEach(e => evIds.has(e) || err(`deduction ${d.id}: unknown ev ${e}`)));
  checkEffects(d.effects, `deduction:${d.id}`); checkSteps(d.lines, `deduction:${d.id}`, false);
});
D.mysteries.forEach(m => { checkCond(m.solved, `mystery:${m.id}`); checkCond(m.cond, `mystery:${m.id}`); });
D.timeline.forEach((t, i) => checkCond(t.cond, `timeline#${i}`));
Object.entries(D.chapterGoals).forEach(([ch, gs]) => gs.forEach((g, i) => { checkCond(g.cond, `goal${ch}#${i}`); checkCond(g.show, `goal${ch}#${i}`); }));
Object.values(D.chapterEnd).forEach(s => D.scenes[s] || err(`chapterEnd: missing scene ${s}`));
/* エンディング */
Object.values(D.endings).forEach(e => {
  D.scenes[e.scene] || err(`ending ${e.id}: missing scene`);
  e.requires.forEach((r, i) => { checkCond(r.cond, `ending:${e.id}#${i}`); if (!r.hint) err(`ending ${e.id}#${i}: no hint`); });
  (e.match.evidence || []).forEach(x => evIds.has(x) || err(`ending ${e.id}: unknown ev ${x}`));
  ['suspect', 'motive', 'trick'].forEach((k, j) => {
    const group = ['suspects', 'motives', 'tricks'][j];
    if (e.match[k] && !D.finalOptions[group].find(o => o.id === e.match[k])) err(`ending ${e.id}: bad ${k}`);
  });
});
/* 入手経路の存在 */
evIds.forEach(e => sources.give.has(e) || err(`evidence ${e} can never be obtained`));
Object.keys(D.testimonies).forEach(t => sources.testimony.has(t) || err(`testimony ${t} can never be heard`));
usedFlags.forEach(f => sources.set.has(f) || err(`flag ${f} is checked but never set`));
Object.keys(D.secrets).forEach(s => sources.secret.has(s) || warns.push(`secret ${s} is never revealed`));

/* シーン到達性（prologue とエンディングから辿る）＋ ジャンプだけの循環 */
const reach = new Set();
const stack = ['prologue', ...Object.values(D.chapterEnd), ...Object.values(D.endings).map(e => e.scene)];
while (stack.length) {
  const id = stack.pop(); if (reach.has(id) || !D.scenes[id]) continue; reach.add(id);
  D.scenes[id].forEach(st => {
    if (st && st.jump) stack.push(st.jump);
    if (st && st.branch) { st.branch.forEach(b => stack.push(b.next)); stack.push(st['else']); }
    if (st && st.choice) st.choice.forEach(o => stack.push(o.next));
  });
}
Object.keys(D.scenes).forEach(id => reach.has(id) || err(`scene ${id} is unreachable`));
// ジャンプのみで構成される循環
Object.keys(D.scenes).forEach(start => {
  const seen = new Set(); let id = start;
  while (id && D.scenes[id]) {
    if (seen.has(id)) { err(`jump-only cycle from ${start}`); break; }
    seen.add(id);
    const sc = D.scenes[id];
    const onlyJump = sc.every(s => ['jump', 'bg', 'bgm', 'se', 'fx', 'show', 'effects'].includes(C.stepType(s)));
    id = onlyJump ? sc[sc.length - 1].jump : null;
  }
});

const lineCount = Object.values(D.scenes).flat().filter(s => typeof s === 'string').length
  + D.targets.flatMap(t => t.results.flatMap(r => r.lines)).filter(s => typeof s === 'string').length
  + Object.values(D.talks).flatMap(t => [...t.topics.flatMap(x => [...x.lines, ...(x.variants || []).flatMap(v => v.lines)]), ...(t.present || []).flatMap(p => p.lines), ...(t.contra || []).flatMap(c => c.lines), ...(t.press || []).flatMap(p => [...p.lines, ...p.fail])]).filter(s => typeof s === 'string').length;

console.log(`scenes=${Object.keys(D.scenes).length} targets=${D.targets.length} topics=${topicIds.size} evidence=${evIds.size} deductions=${dedIds.size} lines≈${lineCount}`);
warns.forEach(w => console.log('WARN', w));
if (errors.length) { errors.forEach(e => console.log('ERROR', e)); console.log(`\n${errors.length} error(s)`); process.exit(1); }
console.log('validate: OK');
