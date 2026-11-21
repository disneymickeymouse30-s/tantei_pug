/*
 * ゲームコア（DOM非依存）。ブラウザでは window.SakichiCore、Node では module.exports。
 * データは window.GAME_DATA（data/*.js が登録）を参照する。
 */
(function (root) {
  'use strict';

  var SAVE_VERSION = 2;
  var CHAR_IDS_TRUST = ['buhita', 'bosston', 'gonzalez', 'madame', 'chef', 'mayor', 'pekibaa', 'ponta'];

  function D() { return root.GAME_DATA; }

  /* ---------- 行（セリフ）の解釈 ---------- */
  // "who:face|text"  /  "|text"（ナレーション）  /  オブジェクトはそのまま
  function parseLine(s) {
    if (typeof s !== 'string') return s;
    var i = s.indexOf('|');
    if (i < 0) return { type: 'line', who: null, face: null, text: s };
    var head = s.slice(0, i), text = s.slice(i + 1);
    if (!head) return { type: 'line', who: null, face: null, text: text };
    var p = head.split(':');
    return { type: 'line', who: p[0], face: p[1] || 'normal', text: text };
  }

  function stepType(st) {
    if (typeof st === 'string') return 'line';
    var keys = ['choice', 'jump', 'branch', 'hub', 'final', 'ending', 'title', 'card', 'effects', 'bg', 'bgm', 'se', 'fx', 'show', 'route'];
    for (var i = 0; i < keys.length; i++) if (st[keys[i]] !== undefined) return keys[i];
    return 'unknown';
  }

  /* ---------- 状態 ---------- */
  function createState() {
    var trust = {};
    CHAR_IDS_TRUST.forEach(function (c) { trust[c] = 50; });
    return {
      ver: SAVE_VERSION,
      chapter: 0,
      mode: 'scene',
      scene: { id: 'prologue', idx: 0 },
      loc: null,
      stage: { bg: 'black', bgm: null, chars: [] },
      evidence: [],
      flags: {},
      trust: trust,
      testimonies: [],
      secrets: [],
      deductions: [],
      investigated: {},
      heard: {},
      choices: [],
      route: null,
      accusation: null,
      endingId: null,
      memo: '',
      playMinutes: 0
    };
  }

  function has(arr, x) { return arr.indexOf(x) >= 0; }
  function addUnique(arr, x) { if (!has(arr, x)) { arr.push(x); return true; } return false; }

  /* ---------- 条件 ---------- */
  function evalCond(st, c) {
    if (c === undefined || c === null || c === true) return true;
    if (c === false) return false;
    if (Array.isArray(c)) return c.every(function (x) { return evalCond(st, x); });
    if (c.all) return c.all.every(function (x) { return evalCond(st, x); });
    if (c.any) return c.any.some(function (x) { return evalCond(st, x); });
    if (c.not) return !evalCond(st, c.not);
    if (c.has) return has(st.evidence, c.has);
    if (c.flag) return !!st.flags[c.flag];
    if (c.noflag) return !st.flags[c.noflag];
    if (c.deduced) return has(st.deductions, c.deduced);
    if (c.secret) return has(st.secrets, c.secret);
    if (c.testimony) return has(st.testimonies, c.testimony);
    if (c.heard) return !!st.heard[c.heard];
    if (c.route) return st.route === c.route;
    if (c.chapter !== undefined) {
      if (typeof c.chapter === 'number') return st.chapter === c.chapter;
      return st.chapter >= (c.chapter.min || 0) && st.chapter <= (c.chapter.max || 99);
    }
    if (c.trust) {
      var v = st.trust[c.trust[0]] || 0, op = c.trust[1], n = c.trust[2];
      return op === '>=' ? v >= n : op === '<' ? v < n : op === '<=' ? v <= n : v > n;
    }
    if (c.choice) return has(st.choices, c.choice);
    if (c.acc) {
      var a = st.accusation || {};
      var want = c.acc[1];
      var got = a[c.acc[0]];
      return Array.isArray(want) ? has(want, got) : got === want;
    }
    if (c.countEv) {
      return c.countEv.ids.filter(function (id) { return has(st.evidence, id); }).length >= c.countEv.n;
    }
    throw new Error('unknown condition: ' + JSON.stringify(c));
  }

  /* ---------- 効果 ---------- */
  // 戻り値：通知用イベント配列
  function applyEffects(st, effs) {
    var ev = [];
    (effs || []).forEach(function (e) {
      if (e.give) { if (addUnique(st.evidence, e.give)) ev.push({ kind: 'evidence', id: e.give }); }
      if (e.set) st.flags[e.set] = true;
      if (e.unset) delete st.flags[e.unset];
      if (e.testimony) { if (addUnique(st.testimonies, e.testimony)) ev.push({ kind: 'testimony', id: e.testimony }); }
      if (e.secret) { if (addUnique(st.secrets, e.secret)) ev.push({ kind: 'secret', id: e.secret }); }
      if (e.deduce) { if (addUnique(st.deductions, e.deduce)) ev.push({ kind: 'deduction', id: e.deduce }); }
      if (e.trust) {
        var c = e.trust[0], d = e.trust[1];
        var before = st.trust[c];
        st.trust[c] = Math.max(0, Math.min(100, (st.trust[c] || 50) + d));
        if (st.trust[c] !== before) ev.push({ kind: 'trust', id: c, delta: d });
      }
      if (e.route) st.route = e.route;
      if (e.chapter !== undefined) st.chapter = e.chapter;
      if (e.choose) addUnique(st.choices, e.choose);
    });
    return ev;
  }

  /* ---------- シーン進行 ---------- */
  // 現在位置から「表示が必要なステップ」まで自動処理して返す。
  // 戻り値 { step, events } step.type: line | choice | card | hub | final | ending | title
  function resolve(st) {
    var events = [];
    var guard = 0;
    while (true) {
      if (++guard > 500) throw new Error('scene loop detected at ' + st.scene.id);
      var sc = D().scenes[st.scene.id];
      if (!sc) throw new Error('missing scene ' + st.scene.id);
      var raw = sc[st.scene.idx];
      if (raw === undefined) throw new Error('scene ran off end: ' + st.scene.id);
      var t = stepType(raw);
      if (t === 'line') {
        var ln = parseLine(raw);
        if (ln.who && ln.who !== 'sakichi' && st.stage.chars.indexOf(ln.who) < 0 && ln.who !== 'unknown') {
          // 話者は自動で登場させる
          st.stage.chars = st.stage.chars.concat([ln.who]).slice(-3);
          events.push({ kind: 'show', chars: st.stage.chars.slice() });
        }
        return { step: ln, events: events };
      }
      if (t === 'bg') { st.stage.bg = raw.bg; events.push({ kind: 'bg', id: raw.bg }); st.scene.idx++; continue; }
      if (t === 'bgm') { st.stage.bgm = raw.bgm; events.push({ kind: 'bgm', id: raw.bgm }); st.scene.idx++; continue; }
      if (t === 'se') { events.push({ kind: 'se', id: raw.se }); st.scene.idx++; continue; }
      if (t === 'fx') { events.push({ kind: 'fx', id: raw.fx }); st.scene.idx++; continue; }
      if (t === 'show') { st.stage.chars = raw.show.slice(); events.push({ kind: 'show', chars: raw.show.slice() }); st.scene.idx++; continue; }
      if (t === 'effects') { events = events.concat(applyEffects(st, raw.effects)); st.scene.idx++; continue; }
      if (t === 'jump') { st.scene = { id: raw.jump, idx: 0 }; continue; }
      if (t === 'branch') {
        var target = raw['else'];
        for (var i = 0; i < raw.branch.length; i++) {
          if (evalCond(st, raw.branch[i].cond)) { target = raw.branch[i].next; break; }
        }
        st.scene = { id: target, idx: 0 }; continue;
      }
      if (t === 'choice') {
        var opts = raw.choice.filter(function (o) { return evalCond(st, o.cond); });
        return { step: { type: 'choice', prompt: raw.prompt || null, options: opts }, events: events };
      }
      if (t === 'card') return { step: { type: 'card', title: raw.card, sub: raw.sub || '' }, events: events };
      if (t === 'hub') {
        st.mode = 'hub';
        st.chapter = raw.hub;
        if (raw.loc) st.loc = raw.loc;
        return { step: { type: 'hub' }, events: events };
      }
      if (t === 'final') { st.mode = 'final'; return { step: { type: 'final' }, events: events }; }
      if (t === 'ending') { st.mode = 'ending'; st.endingId = raw.ending; return { step: { type: 'ending', id: raw.ending }, events: events }; }
      if (t === 'title') { return { step: { type: 'title' }, events: events }; }
      throw new Error('unknown step in ' + st.scene.id + '#' + st.scene.idx);
    }
  }

  function advance(st) { st.scene.idx++; }

  function choose(st, opt) {
    var events = applyEffects(st, opt.effects);
    if (opt.id) addUnique(st.choices, opt.id);
    st.scene = { id: opt.next, idx: 0 };
    return events;
  }

  function startScene(st, id) {
    st.mode = 'scene';
    st.scene = { id: id, idx: 0 };
  }

  /* ---------- 移動・調査 ---------- */
  function locations(st) {
    return D().locations.filter(function (l) { return evalCond(st, l.cond); });
  }
  function location(id) { return D().locations.filter(function (l) { return l.id === id; })[0]; }

  function targets(st, locId) {
    return D().targets.filter(function (t) { return t.loc === locId && evalCond(st, t.cond); });
  }

  function seenSet(st, tid) { return st.investigated[tid] || []; }

  // 調査対象の状態：new（未調査）/ done（調査済み）/ found（証拠発見済み）/ again（条件達成後に再調査可能）
  function targetStatus(st, t) {
    var seen = seenSet(st, t.id);
    var pending = t.results.some(function (r, i) { return !has(seen, i) && evalCond(st, r.cond); });
    if (seen.length === 0) return 'new';
    if (pending) return 'again';
    var gaveEvidence = t.results.some(function (r, i) {
      return has(seen, i) && (r.effects || []).some(function (e) { return e.give; });
    });
    return gaveEvidence ? 'found' : 'done';
  }

  function investigate(st, tid) {
    var t = D().targets.filter(function (x) { return x.id === tid; })[0];
    if (!t) throw new Error('no target ' + tid);
    var seen = st.investigated[tid] = st.investigated[tid] || [];
    var lines = [], events = [];
    var any = false;
    t.results.forEach(function (r, i) {
      if (has(seen, i) || !evalCond(st, r.cond)) return;
      seen.push(i); any = true;
      lines = lines.concat(r.lines);
      events = events.concat(applyEffects(st, r.effects));
    });
    if (!any) {
      // 既に全て調べた：最後に有効だった結果の要約 or 汎用
      lines = t.again ? t.again.slice() : ['sakichi:normal|ここはもう十分に調べたバウ。'];
    }
    return { lines: lines.map(parseLine), events: events };
  }

  /* ---------- 聞き込み ---------- */
  function peopleHere(st) {
    var l = location(st.loc);
    if (!l || !l.people) return [];
    var arr = l.people[st.chapter] || [];
    return arr.filter(function (p) { return !(D().absent && D().absent[p] && evalCond(st, D().absent[p])); });
  }

  function talkDef(cid) { return D().talks[cid]; }

  function topics(st, cid, deep) {
    var td = talkDef(cid);
    if (!td) return [];
    return td.topics.filter(function (tp) {
      if (!!tp.deep !== !!deep) return false;
      if (tp.ch && !has(tp.ch, st.chapter)) return false;
      if (tp.parent && !st.heard[tp.parent]) return false;
      return evalCond(st, tp.cond);
    });
  }

  function talkLinesFor(st, tp) {
    // 信頼度などでセリフが分岐する場合
    if (tp.variants) {
      for (var i = 0; i < tp.variants.length; i++) if (evalCond(st, tp.variants[i].cond)) return tp.variants[i];
    }
    return tp;
  }

  function talk(st, cid, topicId) {
    var td = talkDef(cid);
    var tp = td.topics.filter(function (x) { return x.id === topicId; })[0];
    if (!tp) throw new Error('no topic ' + topicId);
    var first = !st.heard[topicId];
    var v = talkLinesFor(st, tp);
    st.heard[topicId] = true;
    var events = [];
    var lines = v.lines;
    if (first || v.repeatEffects) events = applyEffects(st, v.effects);
    if (tp.testimony) events = events.concat(applyEffects(st, [{ testimony: tp.testimony }]));
    return { lines: lines.map(parseLine), events: events };
  }

  function present(st, cid, evId) {
    var td = talkDef(cid);
    var r = (td.present || []).filter(function (p) {
      return p.ev === evId && (!p.ch || has(p.ch, st.chapter)) && evalCond(st, p.cond);
    });
    var key = 'present:' + cid + ':' + evId;
    if (r.length) {
      var hit = r[0];
      var first = !st.heard[key + ':' + (hit.id || 0)];
      st.heard[key + ':' + (hit.id || 0)] = true;
      var lines = (!first && hit.again) ? hit.again : hit.lines;
      var events = first ? applyEffects(st, hit.effects) : [];
      return { ok: true, lines: lines.map(parseLine), events: events };
    }
    // 外れ：キャラごとのリアクションを順繰りに
    var pool = td.wrong || ['|……反応がない。'];
    var n = (st.heard['wrongcount:' + cid] || 0);
    st.heard['wrongcount:' + cid] = n + 1;
    var w = pool[n % pool.length];
    var ls = Array.isArray(w) ? w : [w];
    return { ok: false, lines: ls.map(parseLine), events: [] };
  }

  // 矛盾を指摘：証言ID＋証拠ID
  function contradictions(st, cid) {
    var td = talkDef(cid);
    return (td.contra || []).filter(function (c) { return has(st.testimonies, c.testimony); });
  }
  function contradict(st, cid, testimonyId, evId) {
    var td = talkDef(cid);
    var hit = (td.contra || []).filter(function (c) {
      return c.testimony === testimonyId && has(c.ev, evId) && evalCond(st, c.cond);
    })[0];
    if (hit) {
      var key = 'contra:' + hit.id;
      var first = !st.heard[key];
      st.heard[key] = true;
      var events = first ? applyEffects(st, hit.effects) : [];
      var lines = first ? hit.lines : (hit.again || ['sakichi:smug|その件はもう決着済みバウ。']);
      return { ok: true, lines: lines.map(parseLine), events: events };
    }
    var events2 = applyEffects(st, [{ trust: [cid, -3] }]);
    var miss = td.contraMiss || ['sakichi:sweat|……あれ？　矛盾してないバウ？'];
    return { ok: false, lines: miss.map(parseLine), events: events2 };
  }

  // 追及：条件付きの強い質問。失敗すると信頼度が下がる
  function presses(st, cid) {
    var td = talkDef(cid);
    return (td.press || []).filter(function (p) {
      return (!p.ch || has(p.ch, st.chapter)) && evalCond(st, p.show);
    });
  }
  function press(st, cid, pid) {
    var td = talkDef(cid);
    var p = (td.press || []).filter(function (x) { return x.id === pid; })[0];
    var key = 'press:' + pid;
    if (evalCond(st, p.cond)) {
      var first = !st.heard[key];
      st.heard[key] = true;
      return { ok: true, lines: (first ? p.lines : (p.again || p.lines)).map(parseLine), events: first ? applyEffects(st, p.effects) : [] };
    }
    return { ok: false, lines: p.fail.map(parseLine), events: applyEffects(st, p.failEffects || [{ trust: [cid, -5] }]) };
  }

  function testimoniesOf(st, cid) {
    return st.testimonies.filter(function (t) { return D().testimonies[t] && D().testimonies[t].who === cid; });
  }

  /* ---------- 推理（証拠の組み合わせ） ---------- */
  function combine(st, a, b) {
    var ds = D().deductions;
    for (var i = 0; i < ds.length; i++) {
      var d = ds[i];
      for (var j = 0; j < d.pairs.length; j++) {
        var p = d.pairs[j];
        if ((p[0] === a && p[1] === b) || (p[0] === b && p[1] === a)) {
          var first = !has(st.deductions, d.id);
          var events = applyEffects(st, [{ deduce: d.id }].concat(first ? (d.effects || []) : []));
          var lines = first ? d.lines : ['sakichi:smug|その結論はもう出ているバウ。「' + d.title + '」'];
          return { ok: true, deduction: d.id, lines: lines.map(parseLine), events: events };
        }
      }
    }
    var pool = D().combineMiss;
    var n = st.heard['combineMiss'] || 0;
    st.heard['combineMiss'] = n + 1;
    return { ok: false, lines: pool[n % pool.length].map(parseLine), events: [] };
  }

  /* ---------- 章の目標 ---------- */
  function goals(st) {
    var g = goalDefs(st);
    return g.map(function (x) { return { label: x.label, done: evalCond(st, x.cond) }; });
  }
  function goalDefs(st) {
    return (D().chapterGoals[st.chapter] || []).filter(function (x) { return evalCond(st, x.show); });
  }
  function canFinishChapter(st) {
    var g = goalDefs(st);
    return g.every(function (x) { return evalCond(st, x.cond); });
  }
  function finishChapter(st) {
    var next = D().chapterEnd[st.chapter];
    startScene(st, next);
  }

  /* ---------- 最終推理の判定 ---------- */
  function evaluateEnding(st, acc) {
    st.accusation = acc;
    var ends = D().endings;
    var order = ['end6', 'end1', 'end2', 'end3', 'end4'];
    for (var i = 0; i < order.length; i++) {
      var e = ends[order[i]];
      if (matches(st, e) && missing(st, e).length === 0) return { id: e.id, missing: [] };
    }
    // バッドエンド：最も近い（犯犬が一致する）エンドとの差分を見落としとして返す
    var cand = null;
    for (var k = 0; k < order.length; k++) {
      var e2 = ends[order[k]];
      if (e2.match.suspect === acc.suspect) { cand = e2; break; }
    }
    if (!cand) cand = ends.end6;
    var miss = [];
    var m = cand.match;
    if (m.suspect !== acc.suspect) miss.push('真犯犬の選び方：「' + label('suspects', acc.suspect) + '」を裏付ける証拠は集まらなかった。');
    if (m.motive !== acc.motive) miss.push('動機の見立てが違っていた。');
    if (m.trick !== acc.trick) miss.push('トリックの見立てが違っていた。');
    if (m.evidence.indexOf(acc.evidence) < 0) miss.push('決定的な証拠の選び方：「' + (D().evidence[acc.evidence] ? D().evidence[acc.evidence].name : '未提示') + '」では決め手にならない。');
    miss = miss.concat(missing(st, cand));
    return { id: 'end5', missing: miss, near: cand.id };
  }
  function matches(st, e) {
    var a = st.accusation || {};
    return a.suspect === e.match.suspect && a.motive === e.match.motive && a.trick === e.match.trick && e.match.evidence.indexOf(a.evidence) >= 0;
  }
  function missing(st, e) {
    return e.requires.filter(function (r) { return !evalCond(st, r.cond); }).map(function (r) { return r.hint; });
  }
  function label(group, id) {
    var g = D().finalOptions[group] || [];
    var x = g.filter(function (o) { return o.id === id; })[0];
    return x ? x.label : id;
  }

  /* ---------- セーブデータ ---------- */
  function serialize(st) { return JSON.stringify(st); }

  // 壊れていれば null を返す（例外を外に出さない）
  function deserialize(json) {
    var o;
    try { o = typeof json === 'string' ? JSON.parse(json) : json; } catch (e) { return null; }
    return migrate(o);
  }

  function migrate(o) {
    if (!o || typeof o !== 'object') return null;
    var base = createState();
    // v1：信頼度が配列、heard が無い形式からの移行
    if (!o.ver || o.ver < 2) {
      if (Array.isArray(o.trust)) {
        var t = {};
        CHAR_IDS_TRUST.forEach(function (c, i) { t[c] = typeof o.trust[i] === 'number' ? o.trust[i] : 50; });
        o.trust = t;
      }
      o.heard = o.heard || o.talked || {};
      delete o.talked;
      o.ver = 2;
    }
    if (o.ver > SAVE_VERSION) return null;
    // 欠損項目は既定値で補い、型が違えば捨てる
    Object.keys(base).forEach(function (k) {
      if (o[k] === undefined || o[k] === null && base[k] !== null) o[k] = base[k];
      if (Array.isArray(base[k]) && !Array.isArray(o[k])) o[k] = base[k];
    });
    CHAR_IDS_TRUST.forEach(function (c) { if (typeof o.trust[c] !== 'number') o.trust[c] = 50; });
    // 存在しないIDの除去
    var d = D();
    if (d) {
      o.evidence = o.evidence.filter(function (x) { return d.evidence[x]; });
      o.deductions = o.deductions.filter(function (x) { return d.deductions.some(function (y) { return y.id === x; }); });
      if (!o.scene || !d.scenes[o.scene.id]) {
        if (o.mode === 'scene') return null;
        o.scene = { id: 'prologue', idx: 0 };
      }
      if (o.scene.idx >= d.scenes[o.scene.id].length) o.scene.idx = 0;
    }
    return o;
  }

  function clone(st) { return JSON.parse(JSON.stringify(st)); }

  /* 2周目以降の「第3章から」：第1〜2章で必ず手に入る証拠と証言を持った状態 */
  var PRESET3 = {
    evidence: ['ev_footprints', 'ev_drool', 'ev_lift', 'ev_sock', 'ev_scratch', 'ev_camera_gap', 'ev_clock',
      'ev_inventory', 'ev_taste_memo', 'ev_key_log', 'ev_photo', 'ev_gold_powder'],
    testimonies: ['t_bt_thunder', 't_gz_plaza', 't_gz_sock', 't_chef_stock', 't_chef_nobody', 't_madame_shadow',
      't_mayor_nokey', 't_ponta_8', 't_buhita_noorder', 't_pekibaa_rule'],
    heard: ['bt1_alibi', 'bt1_gap', 'gz1_alibi', 'gz2_sock', 'md1_alibi', 'md1_shadow', 'ch1_alibi', 'ch2_stock',
      'my2_key', 'pn_saw', 'pn_camera', 'b2_box7', 'pk_rule']
  };
  function chapterPreset(n) {
    if (n !== 3) throw new Error('preset only for chapter 3');
    var st = createState();
    st.evidence = PRESET3.evidence.slice();
    st.testimonies = PRESET3.testimonies.slice();
    PRESET3.heard.forEach(function (h) { st.heard[h] = true; });
    st.flags.preset3 = true;
    st.chapter = 2;
    startScene(st, 'c2_end');
    return st;
  }

  var api = {
    SAVE_VERSION: SAVE_VERSION,
    parseLine: parseLine, stepType: stepType,
    createState: createState, evalCond: evalCond, applyEffects: applyEffects,
    resolve: resolve, advance: advance, choose: choose, startScene: startScene,
    locations: locations, location: location, targets: targets, targetStatus: targetStatus, investigate: investigate,
    peopleHere: peopleHere, topics: topics, talk: talk, present: present,
    contradictions: contradictions, contradict: contradict, presses: presses, press: press, testimoniesOf: testimoniesOf,
    combine: combine, goals: goals, canFinishChapter: canFinishChapter, finishChapter: finishChapter,
    evaluateEnding: evaluateEnding, label: label,
    serialize: serialize, deserialize: deserialize, migrate: migrate, clone: clone,
    chapterPreset: chapterPreset, PRESET3: PRESET3
  };
  root.SakichiCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
