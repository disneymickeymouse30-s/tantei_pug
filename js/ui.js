/* 画面制御（DOM）。ゲームのルールはすべて core.js、文章はすべて data/*.js にある。 */
(function (G) {
  'use strict';
  var Core = G.SakichiCore, Store = G.SakichiStore, Art = G.SakichiArt, Audio = G.SakichiAudio, D = G.GAME_DATA;
  var $ = function (id) { return document.getElementById(id); };
  var el = {};
  ['game', 'bg', 'chars', 'fx', 'hubbar', 'hub-ch', 'hub-loc', 'goals', 'dialog', 'nameplate', 'text', 'choices', 'commands',
    'panel', 'panel-title', 'panel-body', 'toasts', 'card', 'card-title', 'card-sub', 'title', 'title-art', 'title-menu', 'title-note',
    'btn-auto', 'btn-skip'].forEach(function (k) { el[k] = $(k); });

  var state = null, sys = Store.loadSystem();
  var mode = 'title';
  var tapHandler = null, typing = null, autoOn = false, skipOn = false, autoTimer = null;
  var log = [];
  var panelOnClose = null;
  var curBg = null;

  /* ================= 共通ユーティリティ ================= */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function h(tag, attrs, html) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'onclick') e.addEventListener('click', attrs[k]);
      else if (k === 'class') e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function charName(id) { return (D.characters[id] || {}).name || id; }
  function evName(id) { return (D.evidence[id] || {}).name || id; }
  function saveSys() { Store.saveSystem(sys); }
  function autosave() { if (state) Store.saveSlot('auto', state); }
  function applySettings() {
    var s = sys.settings;
    Audio.setVolume({ bgm: s.bgm, se: s.se, mute: s.mute });
    document.documentElement.style.setProperty('--fs', s.fontSize);
  }
  function se(id) { Audio.se(id); }

  function toast(text, kind) {
    var t = h('div', { class: 'toast t-' + (kind || 'ev') }, text);
    el.toasts.appendChild(t);
    setTimeout(function () { t.remove(); }, 2700);
  }

  /* ================= 舞台 ================= */
  function setBg(id) {
    if (curBg === id) return;
    curBg = id;
    el.bg.style.opacity = 0;
    setTimeout(function () { el.bg.innerHTML = Art.background(curBg); el.bg.style.opacity = 1; }, 120);
  }
  var shownChars = [];
  function setChars(ids, speaker, face) {
    ids = (ids || []).filter(function (c) { return c !== 'sakichi'; }).slice(-3);
    var same = ids.join() === shownChars.join();
    if (!same) {
      el.chars.innerHTML = '';
      el.chars.className = 'chars-' + ids.length;
      ids.forEach(function (c) { el.chars.appendChild(h('div', { class: 'char', 'data-id': c }, Art.portrait(c, 'normal'))); });
      shownChars = ids.slice();
    }
    Array.prototype.forEach.call(el.chars.children, function (n) {
      var id = n.getAttribute('data-id');
      n.classList.toggle('dim', !!speaker && speaker !== id && ids.length > 1);
      n.classList.toggle('speak', speaker === id);
      if (speaker === id && face && n.getAttribute('data-face') !== face) {
        n.innerHTML = Art.portrait(id, face);
        n.setAttribute('data-face', face);
        if (['surprised', 'shout', 'angry', 'excited'].indexOf(face) >= 0) { n.classList.remove('bounce'); void n.offsetWidth; n.classList.add('bounce'); }
      }
    });
  }
  function doFx(id) {
    if (id === 'flash') { el.fx.classList.remove('fx-flash'); void el.fx.offsetWidth; el.fx.classList.add('fx-flash'); }
    if (id === 'shake') { el.game.classList.remove('fx-shake'); void el.game.offsetWidth; el.game.classList.add('fx-shake'); setTimeout(function () { el.game.classList.remove('fx-shake'); }, 450); }
    if (id === 'objection') {
      var o = h('div', { class: 'objection' }, 'ちょっと待つバウ！');
      el.fx.appendChild(o); setTimeout(function () { o.remove(); }, 950);
      doFx('shake');
    }
  }

  function handleEvents(evs) {
    (evs || []).forEach(function (e) {
      switch (e.kind) {
        case 'bg': setBg(e.id); break;
        case 'bgm': Audio.bgm(e.id); break;
        case 'se': se(e.id); break;
        case 'fx': doFx(e.id); break;
        case 'show': setChars(e.chars); break;
        case 'evidence': toast((D.evidence[e.id].icon || '🔎') + ' 証拠「' + evName(e.id) + '」を手に入れた！'); se('found'); break;
        case 'testimony': toast('📝 ' + charName(D.testimonies[e.id].who) + 'の証言を記録した', 'info'); break;
        case 'secret': toast('🔓 ' + charName(D.secrets[e.id].who) + 'の秘密が明らかになった', 'secret'); break;
        case 'deduction':
          var d = D.deductions.filter(function (x) { return x.id === e.id; })[0];
          toast('💡 推理成立：' + d.title);
          if (sys.deductionsEver.indexOf(e.id) < 0) { sys.deductionsEver.push(e.id); saveSys(); }
          break;
        case 'trust':
          toast(charName(e.id) + (e.delta > 0 ? 'の信頼度が上がった ♥' : 'の信頼度が下がった…'), e.delta > 0 ? 'trust-up' : 'trust-down');
          se(e.delta > 0 ? 'trust_up' : 'trust_down');
          break;
      }
    });
  }

  /* ================= 会話表示 ================= */
  function speeds() { return [0, 45, 24, 10, 0][sys.settings.textSpeed] || 24; }

  // ln: {who, face, text}  read: 既読か  done: 次へ
  function showLine(ln, read, done, stageIds) {
    el.dialog.hidden = false;
    el.choices.hidden = true;
    var who = ln.who;
    el.nameplate.textContent = who ? (who === 'sakichi' ? '佐吉' : charName(who)) : '';
    el.text.classList.toggle('narration', !who);
    if (stageIds) {
      var ids = stageIds.slice();
      if (who && who !== 'sakichi' && ids.indexOf(who) < 0) ids = ids.concat([who]);
      setChars(ids, who === 'sakichi' ? null : who, ln.face);
    }
    sakichiFace(who === 'sakichi' ? ln.face : null);
    log.push({ who: el.nameplate.textContent, text: ln.text });
    if (log.length > 400) log.shift();

    var full = ln.text, i = 0;
    el.dialog.classList.remove('done');
    clearTimeout(autoTimer);
    if (typing) clearInterval(typing);
    var finish = function () {
      if (typing) clearInterval(typing); typing = null;
      el.text.textContent = full;
      el.dialog.classList.add('done');
      if (skipOn) { autoTimer = setTimeout(next, 45); return; }
      if (autoOn) autoTimer = setTimeout(next, sys.settings.autoWait * 1000 + full.length * 35);
    };
    var next = function () { clearTimeout(autoTimer); tapHandler = null; done(); };

    if (skipOn && !read && !sys.settings.skipUnread) setSkip(false);
    var sp = speeds();
    if (skipOn || sp === 0) { finish(); }
    else {
      el.text.textContent = '';
      typing = setInterval(function () {
        i++;
        el.text.textContent = full.slice(0, i);
        if (i >= full.length) finish();
      }, sp);
    }
    tapHandler = function () { if (typing) finish(); else next(); };
  }
  var sakichiFaceEl = null;
  function sakichiFace(face) {
    if (!sakichiFaceEl) {
      sakichiFaceEl = h('div', { class: 'sakichi-face' });
      sakichiFaceEl.style.cssText = 'position:absolute;right:10px;top:-62px;width:64px;height:76px;filter:drop-shadow(0 3px 6px rgba(0,0,0,.5));pointer-events:none';
      el.dialog.appendChild(sakichiFaceEl);
    }
    if (!face) { sakichiFaceEl.innerHTML = ''; return; }
    if (sakichiFaceEl.getAttribute('data-face') !== face || !sakichiFaceEl.innerHTML) {
      sakichiFaceEl.innerHTML = Art.portrait('sakichi', face);
      sakichiFaceEl.setAttribute('data-face', face);
    }
  }

  function setAuto(on) { autoOn = on; el['btn-auto'].classList.toggle('on', on); if (on && el.dialog.classList.contains('done') && tapHandler) tapHandler(); }
  function setSkip(on) { skipOn = on; el['btn-skip'].classList.toggle('on', on); if (on && tapHandler) tapHandler(); }

  // 調査・聞き込み結果の短い会話を再生
  function playInline(lines, events, stageIds, done) {
    var q = lines.slice();
    el.commands.hidden = true;
    el.goals.hidden = true;
    var step = function () {
      if (!q.length) {
        el.dialog.hidden = true; sakichiFace(null);
        handleEvents(events);
        if (state) setChars(stageIds);
        if (mode === 'final') el.commands.hidden = false;
        done && done();
        return;
      }
      var s = q.shift();
      var t = s.type === 'line' ? 'line' : Core.stepType(s);
      if (t === 'line') return showLine(s, true, step, stageIds);
      if (t === 'se') se(s.se);
      if (t === 'fx') doFx(s.fx);
      if (t === 'bg') setBg(s.bg);
      step();
    };
    step();
  }

  /* ================= シーン進行 ================= */
  function runScene() {
    mode = 'scene';
    hideHub();
    var r;
    try { r = Core.resolve(state); }
    catch (e) { console.error(e); toast('シナリオの読み込みに失敗しました：' + e.message, 'info'); return showTitle(); }
    handleEvents(r.events);
    var s = r.step;
    var key = state.scene.id + ':' + state.scene.idx;
    if (s.type === 'line') {
      var read = !!sys.read[key];
      showLine(s, read, function () {
        if (!sys.read[key]) { sys.read[key] = 1; }
        Core.advance(state); runScene();
      }, state.stage.chars);
      return;
    }
    el.dialog.hidden = true; sakichiFace(null);
    if (s.type === 'choice') { saveSys(); return showChoices(s); }
    if (s.type === 'card') return showCard(s.title, s.sub, function () { Core.advance(state); runScene(); });
    if (s.type === 'hub') { saveSys(); setSkip(false); autosave(); return enterHub(); }
    if (s.type === 'final') { saveSys(); setSkip(false); autosave(); return showFinal(); }
    if (s.type === 'ending') { saveSys(); setSkip(false); return onEnding(s.id); }
    if (s.type === 'title') return showTitle();
  }

  function showChoices(s) {
    setSkip(false); setAuto(false);
    el.choices.innerHTML = '';
    el.choices.hidden = false;
    if (s.prompt) el.choices.appendChild(h('div', { class: 'choice-prompt' }, esc(s.prompt)));
    s.options.forEach(function (o) {
      el.choices.appendChild(h('button', { class: 'choice', onclick: function () {
        se('click');
        el.choices.hidden = true;
        log.push({ who: '選択', text: o.label });
        var evs = Core.choose(state, o);
        handleEvents(evs);
        autosave();
        runScene();
      } }, esc(o.label)));
    });
  }

  function showCard(title, sub, done) {
    el.card.hidden = false;
    el['card-title'].textContent = title;
    el['card-sub'].textContent = sub || '';
    se('clock');
    var closed = false;
    var close = function () { if (closed) return; closed = true; el.card.hidden = true; el.card.onclick = null; tapHandler = null; done(); };
    el.card.onclick = close;
    tapHandler = close;
    setTimeout(close, skipOn ? 300 : 2600);
  }

  /* ================= 捜査ハブ ================= */
  function hideHub() { el.hubbar.hidden = true; el.commands.hidden = true; el.goals.hidden = true; }

  function enterHub() {
    mode = 'hub';
    var loc = Core.location(state.loc) || Core.locations(state)[0];
    state.loc = loc.id;
    setBg(loc.bg);
    Audio.bgm(state.chapter >= 3 ? 'tense' : 'mystery');
    refreshHub();
  }
  function refreshHub() {
    if (mode !== 'hub') return;
    var loc = Core.location(state.loc);
    el.hubbar.hidden = false;
    el['hub-ch'].textContent = '第' + state.chapter + '章' + (state.route ? ' ／ ' + { A: '映像', B: '在庫', C: '物証', D: '秘密' }[state.route] + 'ルート' : '');
    el['hub-loc'].textContent = '📍 ' + loc.name;
    setChars(Core.peopleHere(state));
    el.dialog.hidden = true;
    var c = el.commands;
    c.innerHTML = '';
    c.hidden = false;
    var targets = Core.targets(state, state.loc);
    var newT = targets.filter(function (t) { var s = Core.targetStatus(state, t); return s === 'new' || s === 'again'; }).length;
    var people = Core.peopleHere(state);
    var cmd = function (ico, label, fn, dis) {
      var b = h('button', { class: 'cmd', onclick: function () { se('click'); fn(); } }, '<span class="ico">' + ico + '</span>' + label);
      if (dis) b.disabled = true;
      c.appendChild(b);
    };
    cmd('🔍', '調べる' + (newT ? ' <small>(' + newT + ')</small>' : ''), openInvestigate, !targets.length);
    cmd('💬', '話す', openPeople, !people.length);
    cmd('🚶', '移動する', openMove);
    cmd('🗂️', '証拠を見る', function () { openEvidence(); });
    cmd('📢', '証拠を提示', openPresentPick, !people.length || !state.evidence.length);
    cmd('💡', '推理する', function () { openNotebook('combine'); });
    if (Core.canFinishChapter(state)) {
      c.appendChild(h('button', { class: 'cmd finish', onclick: function () {
        confirmBox('第' + state.chapter + '章の捜査を終えて先へ進みますか？<br><span class="muted">まだ調べていない場所があっても進めます。</span>', '先へ進む', function () {
          closePanel(); Core.finishChapter(state); runScene();
        });
      } }, '✅ 捜査を終えて先へ進む'));
    } else {
      var g = Core.goals(state), done = g.filter(function (x) { return x.done; }).length;
      c.appendChild(h('div', { class: 'hub-msg' }, '捜査の目標 ' + done + ' / ' + g.length + '（🎯で確認）'));
    }
  }
  function toggleGoals() {
    if (!el.goals.hidden) { el.goals.hidden = true; return; }
    var g = Core.goals(state);
    el.goals.innerHTML = '<h3>🎯 第' + state.chapter + '章の目標</h3><ul>' + g.map(function (x) {
      return '<li class="' + (x.done ? 'done' : '') + '">' + (x.done ? '✔ ' : '□ ') + esc(x.label) + '</li>';
    }).join('') + '</ul>';
    el.goals.hidden = false;
  }

  function openInvestigate() {
    var loc = Core.location(state.loc);
    var list = h('div', { class: 'list' });
    var labels = { 'new': ['未調査', 'b-new'], again: ['新しい発見あり', 'b-again'], found: ['証拠発見済み', 'b-found'], done: ['調査済み', 'b-done'] };
    Core.targets(state, state.loc).forEach(function (t) {
      var s = Core.targetStatus(state, t);
      list.appendChild(h('button', { class: 'item', onclick: function () {
        closePanel();
        var r = Core.investigate(state, t.id);
        playInline(r.lines, r.events, Core.peopleHere(state), function () { autosave(); refreshHub(); });
      } }, '<span class="ico">🔍</span><span class="main">' + esc(t.label) + '</span><span class="badge ' + labels[s][1] + '">' + labels[s][0] + '</span>'));
    });
    openPanel('調べる：' + loc.name, list);
  }

  function openMove() {
    var list = h('div', { class: 'list' });
    Core.locations(state).forEach(function (l) {
      var cur = l.id === state.loc;
      var newT = Core.targets(state, l.id).filter(function (t) { var s = Core.targetStatus(state, t); return s === 'new' || s === 'again'; }).length;
      var ppl = (l.people && l.people[state.chapter] || []).map(charName).join('・');
      var b = h('button', { class: 'item' + (cur ? ' sel' : ''), onclick: function () {
        if (cur) return closePanel();
        closePanel();
        state.loc = l.id; se('step'); setBg(l.bg);
        playInline([Core.parseLine(D.locationIntro[l.id] || '|' + l.name)], [], Core.peopleHere(state), function () { autosave(); refreshHub(); });
      } }, '<span class="ico">' + (cur ? '📍' : '🚪') + '</span><span class="main">' + esc(l.name) + '<span class="sub">' + (ppl ? '👥 ' + esc(ppl) : '　') + '</span></span>' + (newT ? '<span class="badge b-new">未調査 ' + newT + '</span>' : ''));
      list.appendChild(b);
    });
    openPanel('移動する', list);
  }

  function openPeople() {
    var people = Core.peopleHere(state);
    if (people.length === 1) return openTalk(people[0]);
    var list = h('div', { class: 'list' });
    people.forEach(function (p) {
      list.appendChild(h('button', { class: 'item', onclick: function () { openTalk(p); } }, '<span class="ico">💬</span><span class="main">' + esc(charName(p)) + '<span class="sub">' + esc(D.characters[p].role) + '</span></span>'));
    });
    openPanel('誰と話す？', list);
  }

  function trustInfo(cid) {
    var v = state.trust[cid];
    var label = v < 30 ? '警戒している' : v < 50 ? 'よそよそしい' : v < 65 ? 'ふつう' : v < 85 ? '打ち解けている' : '信頼している';
    var n = Math.round(v / 20);
    return '<span class="hearts">' + '♥'.repeat(n) + '<span style="opacity:.25">' + '♥'.repeat(5 - n) + '</span></span> ' + label;
  }

  function openTalk(cid) {
    var body = h('div');
    body.appendChild(h('div', { class: 'talk-head' }, '<div class="face">' + Art.portrait(cid, 'normal') + '</div><div><b style="font-size:18px">' + esc(charName(cid)) + '</b><div class="muted">' + esc(D.characters[cid].breed + '／' + D.characters[cid].role) + '</div><div class="trust">' + trustInfo(cid) + '</div></div>'));
    var topics = Core.topics(state, cid, false), deep = Core.topics(state, cid, true);
    var unheard = topics.filter(function (t) { return !state.heard[t.id]; });
    var testis = Core.testimoniesOf(state, cid);
    var presses = Core.presses(state, cid);
    var grid = h('div', { class: 'talk-cmds' });
    var add = function (label, fn, dis, cls) { var b = h('button', { class: 'btn ' + (cls || ''), onclick: function () { se('click'); fn(); } }, label); if (dis) b.disabled = true; grid.appendChild(b); };
    add('💬 話す' + (unheard.length ? '（新）' : ''), function () { talkTopic(cid, (unheard[0] || topics[0] || {}).id); }, !topics.length, unheard.length ? 'gold' : '');
    add('🔁 別の話題を聞く', function () { pickTopic(cid, topics, '別の話題を聞く'); }, topics.length < 1);
    add('🔎 詳しく聞く' + (deep.some(function (t) { return !state.heard[t.id]; }) ? '（新）' : ''), function () { pickTopic(cid, deep, '詳しく聞く'); }, !deep.length);
    add('🗂️ 証拠を見せる', function () { pickEvidence('証拠を見せる：' + charName(cid), function (ev) { doTalk(cid, Core.present(state, cid, ev)); }); }, !state.evidence.length);
    add('❗ 矛盾を指摘する', function () { pickContradiction(cid); }, !testis.length);
    add('🔥 追及する', function () { pickPress(cid, presses); }, !presses.length);
    body.appendChild(grid);
    if (testis.length) {
      body.appendChild(h('div', { class: 'sec-title' }, 'この犬の証言'));
      testis.forEach(function (t) { body.appendChild(h('div', { class: 'muted', style: 'padding:3px 0' }, '「' + esc(D.testimonies[t].text) + '」')); });
    }
    var end = h('div', { class: 'btn-row' });
    end.appendChild(h('button', { class: 'btn ghost', onclick: function () { closePanel(); refreshHub(); } }, '会話を終了する'));
    body.appendChild(end);
    openPanel('聞き込み', body, null, true);
  }
  function doTalk(cid, r) {
    closePanel();
    if (r.ok === false) se('wrong');
    var stage = Core.peopleHere(state);
    if (stage.indexOf(cid) < 0) stage = stage.concat([cid]);
    playInline(r.lines, r.events, stage, function () { autosave(); refreshHub(); openTalk(cid); });
  }
  function talkTopic(cid, id) { if (id) doTalk(cid, Core.talk(state, cid, id)); }
  function pickTopic(cid, list, title) {
    var l = h('div', { class: 'list' });
    list.forEach(function (t) {
      l.appendChild(h('button', { class: 'item', onclick: function () { talkTopic(cid, t.id); } }, '<span class="ico">💬</span><span class="main">' + esc(t.label) + '</span>' + (state.heard[t.id] ? '<span class="badge b-done">聞いた</span>' : '<span class="badge b-new">新</span>')));
    });
    openPanel(title + '：' + charName(cid), l, function () { openTalk(cid); });
  }
  function pickContradiction(cid) {
    var l = h('div', { class: 'list' });
    l.appendChild(h('p', { class: 'muted' }, 'どの証言が、どの証拠と食い違っている？　見当違いの指摘をすると信頼度が下がる。'));
    Core.testimoniesOf(state, cid).forEach(function (t) {
      var T = D.testimonies[t];
      l.appendChild(h('button', { class: 'item', onclick: function () {
        pickEvidence('「' + T.text.slice(0, 18) + '…」に突きつける証拠', function (ev) { doTalk(cid, Core.contradict(state, cid, t, ev)); }, function () { pickContradiction(cid); });
      } }, '<span class="ico">📝</span><span class="main">「' + esc(T.text) + '」<span class="sub">' + esc(T.time) + '</span></span>'));
    });
    openPanel('矛盾を指摘する：' + charName(cid), l, function () { openTalk(cid); });
  }
  function pickPress(cid, list) {
    var l = h('div', { class: 'list' });
    l.appendChild(h('p', { class: 'muted' }, '十分な根拠がないまま追及すると、相手は心を閉ざして信頼度が下がる。'));
    list.forEach(function (p) {
      l.appendChild(h('button', { class: 'item', onclick: function () { doTalk(cid, Core.press(state, cid, p.id)); } }, '<span class="ico">🔥</span><span class="main">' + esc(p.label) + '</span>' + (state.heard['press:' + p.id] ? '<span class="badge b-done">済</span>' : '')));
    });
    openPanel('追及する：' + charName(cid), l, function () { openTalk(cid); });
  }
  function openPresentPick() {
    var people = Core.peopleHere(state);
    var go = function (cid) { pickEvidence('証拠を提示：' + charName(cid), function (ev) { doTalk(cid, Core.present(state, cid, ev)); }); };
    if (people.length === 1) return go(people[0]);
    var l = h('div', { class: 'list' });
    people.forEach(function (p) { l.appendChild(h('button', { class: 'item', onclick: function () { go(p); } }, '<span class="ico">📢</span><span class="main">' + esc(charName(p)) + '</span>')); });
    openPanel('誰に証拠を見せる？', l);
  }

  // 証拠を一つ選ぶ汎用リスト
  function pickEvidence(title, cb, back) {
    var l = h('div', { class: 'list' });
    state.evidence.forEach(function (id) {
      var E = D.evidence[id];
      l.appendChild(h('button', { class: 'item', onclick: function () { cb(id); } }, '<span class="ico">' + E.icon + '</span><span class="main">' + esc(E.name) + '<span class="sub">' + esc(E.found) + '</span></span>'));
    });
    openPanel(title, l, back);
  }

  /* ================= 証拠・推理ノート ================= */
  function evUnderstood(id) {
    return D.deductions.some(function (d) { return state.deductions.indexOf(d.id) >= 0 && d.pairs.some(function (p) { return p.indexOf(id) >= 0; }); });
  }
  function evCard(id) {
    var E = D.evidence[id];
    var ppl = (E.people || []).map(charName).join('、');
    return '<div class="ev-card"><h4>' + E.icon + ' ' + esc(E.name) + '</h4><div class="muted">発見場所：' + esc(E.found) + (ppl ? '　関連：' + esc(ppl) : '') + '</div><p>' + esc(E.desc) + '</p>' +
      (evUnderstood(id) && E.truth ? '<p class="truth">💡 ' + esc(E.truth) + '</p>' : '') + '</div>';
  }
  function openEvidence(focus) {
    var b = h('div');
    if (!state.evidence.length) b.appendChild(h('p', { class: 'muted' }, 'まだ証拠はない。'));
    var l = h('div', { class: 'list' });
    state.evidence.forEach(function (id) {
      var E = D.evidence[id];
      l.appendChild(h('button', { class: 'item', onclick: function () {
        openPanel(E.name, h('div', {}, evCard(id)), function () { openEvidence(); });
      } }, '<span class="ico">' + E.icon + '</span><span class="main">' + esc(E.name) + '<span class="sub">' + esc(E.found) + '</span></span>' + (evUnderstood(id) ? '<span class="badge b-found">解明</span>' : '')));
    });
    b.appendChild(l);
    b.appendChild(h('p', { class: 'muted' }, '所持：' + state.evidence.length + ' / ' + Object.keys(D.evidence).length));
    openPanel('証拠一覧', b);
  }

  var TABS = [['combine', '推理'], ['people', '人物'], ['testimony', '証言'], ['timeline', '時系列'], ['secrets', '秘密'], ['mysteries', '謎'], ['evidence', '証拠'], ['memo', 'メモ']];
  var combineSel = [];
  function openNotebook(tab, back) {
    tab = tab || 'combine';
    var b = h('div');
    var tabs = h('div', { class: 'tabs' });
    TABS.forEach(function (t) { tabs.appendChild(h('button', { class: 'tab' + (t[0] === tab ? ' on' : ''), onclick: function () { openNotebook(t[0], back); } }, t[1])); });
    b.appendChild(tabs);
    var body = h('div');
    b.appendChild(body);
    if (tab === 'combine') renderCombine(body, back);
    if (tab === 'people') renderPeople(body);
    if (tab === 'testimony') renderTestimony(body);
    if (tab === 'timeline') renderTimeline(body);
    if (tab === 'secrets') {
      if (!state.secrets.length) body.appendChild(h('p', { class: 'muted' }, 'まだ誰の秘密も明らかになっていない。'));
      state.secrets.forEach(function (s) { body.appendChild(h('div', { class: 'ev-card' }, '<h4>🔓 ' + esc(charName(D.secrets[s].who)) + '</h4><p>' + esc(D.secrets[s].text) + '</p>')); });
    }
    if (tab === 'mysteries') {
      D.mysteries.filter(function (m) { return Core.evalCond(state, m.cond); }).forEach(function (m) {
        var ok = Core.evalCond(state, m.solved);
        body.appendChild(h('div', { class: 'ev-card', style: ok ? '' : 'border-color:#cfc4b0' }, '<h4>' + (ok ? '✔ ' : '❓ ') + esc(m.q) + '</h4>' + (ok ? '<p class="truth">' + esc(m.a) + '</p>' : '<p class="muted">未解決</p>')));
      });
    }
    if (tab === 'evidence') state.evidence.forEach(function (id) { body.insertAdjacentHTML('beforeend', evCard(id)); });
    if (tab === 'memo') {
      var ta = h('textarea', { class: 'memo', placeholder: '気づいたことを自由にメモできるバウ（セーブデータに保存されます）' });
      ta.value = state.memo || '';
      ta.addEventListener('input', function () { state.memo = ta.value; });
      body.appendChild(ta);
    }
    openPanel('推理ノート', b, back);
  }
  function renderCombine(body, back) {
    body.appendChild(h('p', { class: 'muted' }, '証拠を2つ選んで「組み合わせる」。正しい組み合わせなら新しい推理が成立する。'));
    var l = h('div', { class: 'list' });
    combineSel = combineSel.filter(function (x) { return state.evidence.indexOf(x) >= 0; });
    var btn = h('button', { class: 'btn gold', style: 'position:sticky;bottom:0;width:100%;margin-top:10px' }, '');
    var upd = function () {
      btn.disabled = combineSel.length !== 2;
      btn.textContent = combineSel.length === 2 ? '「' + evName(combineSel[0]) + '」×「' + evName(combineSel[1]) + '」を組み合わせる' : '証拠を2つ選ぶ（' + combineSel.length + '/2）';
    };
    state.evidence.forEach(function (id) {
      var E = D.evidence[id];
      var it = h('button', { class: 'item' + (combineSel.indexOf(id) >= 0 ? ' sel' : '') }, '<span class="ico">' + E.icon + '</span><span class="main">' + esc(E.name) + '</span>');
      it.addEventListener('click', function () {
        var i = combineSel.indexOf(id);
        if (i >= 0) combineSel.splice(i, 1); else { combineSel.push(id); if (combineSel.length > 2) combineSel.shift(); }
        Array.prototype.forEach.call(l.children, function (n, k) { n.classList.toggle('sel', combineSel.indexOf(state.evidence[k]) >= 0); });
        upd();
      });
      l.appendChild(it);
    });
    btn.addEventListener('click', function () {
      var a = combineSel[0], c = combineSel[1];
      combineSel = [];
      closePanel();
      var r = Core.combine(state, a, c);
      if (!r.ok) se('wrong');
      var ret = function () { autosave(); if (mode === 'hub') refreshHub(); openNotebook('combine', back); };
      playInline(r.lines, r.events, mode === 'hub' ? Core.peopleHere(state) : shownChars, ret);
    });
    upd();
    body.appendChild(l);
    body.appendChild(btn);
    var est = D.deductions.filter(function (d) { return state.deductions.indexOf(d.id) >= 0; });
    body.appendChild(h('div', { class: 'sec-title' }, '成立した推理（' + est.length + ' / ' + D.deductions.length + '）'));
    if (!est.length) body.appendChild(h('p', { class: 'muted' }, 'まだない。'));
    est.forEach(function (d) { body.appendChild(h('div', { class: 'item', style: 'cursor:default' }, '<span class="ico">💡</span><span class="main">' + esc(d.title) + '</span>')); });
    var hints = D.deductions.filter(function (d) { return state.deductions.indexOf(d.id) < 0 && sys.deductionsEver.indexOf(d.id) >= 0; });
    if (hints.length) {
      body.appendChild(h('div', { class: 'sec-title' }, '前の捜査で成立した推理（ヒント）'));
      hints.forEach(function (d) { body.appendChild(h('div', { class: 'muted', style: 'padding:3px 0' }, '・' + esc(d.title))); });
    }
  }
  function renderPeople(body) {
    D.characterOrder.forEach(function (cid) {
      var C = D.characters[cid];
      var met = Object.keys(state.heard).some(function (k) { return (D.talks[cid].topics || []).some(function (t) { return t.id === k; }); });
      if (!met && state.chapter < 2 && ['pekibaa', 'ponta'].indexOf(cid) >= 0) return;
      var testis = Core.testimoniesOf(state, cid);
      var secs = state.secrets.filter(function (s) { return D.secrets[s].who === cid; });
      body.appendChild(h('div', { class: 'ev-card' },
        '<div class="talk-head" style="margin:0"><div class="face" style="width:60px;height:72px">' + Art.portrait(cid, 'normal') + '</div><div><b>' + esc(C.name) + '</b>（' + esc(C.breed) + '）<div class="muted">' + esc(C.role) + '</div><div class="trust">' + trustInfo(cid) + '</div></div></div>' +
        '<p>' + esc(C.profile) + '</p><p class="muted">口癖：「' + esc(C.quirk) + '」</p>' +
        testis.map(function (t) { return '<p>📝「' + esc(D.testimonies[t].text) + '」</p>'; }).join('') +
        secs.map(function (s) { return '<p class="truth">🔓 ' + esc(D.secrets[s].text) + '</p>'; }).join('')));
    });
  }
  function renderTestimony(body) {
    if (!state.testimonies.length) body.appendChild(h('p', { class: 'muted' }, 'まだ証言はない。'));
    state.testimonies.forEach(function (t) {
      var T = D.testimonies[t];
      var broken = Object.keys(state.heard).some(function (k) { return k.indexOf('contra:') === 0 && (D.talks[T.who].contra || []).some(function (c) { return 'contra:' + c.id === k && c.testimony === t; }); });
      body.appendChild(h('div', { class: 'ev-card', style: broken ? 'border-color:#c0392b' : '' }, '<h4>' + esc(charName(T.who)) + '<span class="muted">（' + esc(T.time) + '）</span>' + (broken ? ' <span class="badge b-new">矛盾を指摘済み</span>' : '') + '</h4><p>「' + esc(T.text) + '」</p>'));
    });
  }
  function renderTimeline(body) {
    var known = D.timeline.filter(function (t) { return Core.evalCond(state, t.cond); });
    var tl = h('div', { class: 'tl' });
    known.forEach(function (t) { tl.appendChild(h('div', { class: 'tl-row' }, '<span class="tl-time">' + esc(t.time) + '</span>' + esc(t.text))); });
    var unk = D.timeline.length - known.length;
    if (unk) tl.appendChild(h('div', { class: 'tl-row unk muted' }, '……まだ空白の時間が ' + unk + ' 個ある'));
    body.appendChild(tl);
  }

  /* ================= 最終推理 ================= */
  var acc = {};
  function showFinal() {
    mode = 'final';
    hideHub();
    el.dialog.hidden = true;
    setBg('stage');
    Audio.bgm('climax');
    setChars(['madame', 'bosston', 'gonzalez']);
    el.commands.innerHTML = '';
    el.commands.hidden = false;
    el.commands.appendChild(h('button', { class: 'cmd finish', onclick: function () { acc = {}; finalStep(1); } }, '⚖️ 最終推理を始める'));
    [['💡', '推理ノート', function () { openNotebook('combine'); }], ['🗂️', '証拠を見る', function () { openEvidence(); }], ['☰', 'メニュー', openMenu]].forEach(function (x) {
      el.commands.appendChild(h('button', { class: 'cmd', onclick: x[2] }, '<span class="ico">' + x[0] + '</span>' + x[1]));
    });
  }
  function finalStep(n) {
    var O = D.finalOptions;
    var b = h('div');
    b.appendChild(h('div', { class: 'step-dots' }, [1, 2, 3, 4].map(function (i) { return '<span class="' + (i <= n ? 'on' : '') + '"></span>'; }).join('')));
    var sum = [];
    if (acc.suspect) sum.push('犯犬：<b>' + esc(Core.label('suspects', acc.suspect)) + '</b>');
    if (acc.motive) sum.push('動機：<b>' + esc(Core.label('motives', acc.motive)) + '</b>');
    if (acc.trick) sum.push('トリック：<b>' + esc(Core.label('tricks', acc.trick)) + '</b>');
    if (sum.length) b.appendChild(h('div', { class: 'final-sum' }, sum.join('<br>')));
    var l = h('div', { class: 'list' });
    var opt = function (list, key, nextN) {
      list.forEach(function (o) {
        l.appendChild(h('button', { class: 'item', onclick: function () { se('click'); acc[key] = o.id; finalStep(nextN); } }, '<span class="ico">▶</span><span class="main">' + esc(o.label) + '</span>'));
      });
    };
    var title;
    if (n === 1) { title = '① 犯犬は誰だ？'; opt(O.suspects, 'suspect', 2); }
    if (n === 2) { title = '② 動機は何だ？'; opt(O.motives, 'motive', 3); }
    if (n === 3) { title = '③ トリックは？'; opt(O.tricks, 'trick', 4); }
    if (n === 4) {
      title = '④ 決定的な証拠を突きつけろ！';
      state.evidence.forEach(function (id) {
        var E = D.evidence[id];
        l.appendChild(h('button', { class: 'item', onclick: function () {
          acc.evidence = id;
          confirmBox('<div class="final-sum">' + sum.join('<br>') + '<br>証拠：<b>' + esc(E.name) + '</b></div>この推理で決めるバウ？<br><span class="muted">決定するとエンディングへ進みます。</span>', '犯犬はお前だバウ！', submitFinal, function () { finalStep(4); });
        } }, '<span class="ico">' + E.icon + '</span><span class="main">' + esc(E.name) + '</span>'));
      });
    }
    b.appendChild(l);
    var row = h('div', { class: 'btn-row' });
    if (n > 1) row.appendChild(h('button', { class: 'btn ghost', onclick: function () { finalStep(n - 1); } }, '← 戻る'));
    row.appendChild(h('button', { class: 'btn ghost', onclick: function () { openNotebook('combine', function () { finalStep(n); }); } }, '💡 推理ノート'));
    b.appendChild(row);
    openPanel(title, b);
  }
  function submitFinal() {
    closePanel();
    var res = Core.evaluateEnding(state, { suspect: acc.suspect, motive: acc.motive, trick: acc.trick, evidence: acc.evidence });
    state.lastMissing = res.missing;
    se('objection'); doFx('objection');
    el.commands.hidden = true;
    setTimeout(function () { Core.startScene(state, D.endings[res.id].scene); runScene(); }, 900);
  }

  /* ================= エンディング ================= */
  function onEnding(id) {
    mode = 'ending';
    var E = D.endings[id];
    var first = !sys.endings[id];
    sys.endings[id] = sys.endings[id] || { at: new Date().toISOString() };
    sys.clears = (sys.clears || 0) + 1;
    saveSys();
    Store.deleteSlot('auto');
    hideHub();
    Audio.bgm(id === 'end6' ? 'ending_true' : id === 'end5' ? 'sad' : 'ending_route');
    if (id === 'end6') { doFx('flash'); se('success'); }
    var b = h('div');
    b.appendChild(h('div', { style: 'text-align:center;padding:10px 0' },
      '<div style="font-size:14px;color:#8a6a43;font-weight:800">' + (E.kind === 'true' ? 'TRUE END' : E.kind === 'bad' ? 'BAD END' : 'END') + ' ' + E.no + '</div>' +
      '<div style="font-size:26px;font-weight:900;margin:6px 0">' + esc(E.title) + '</div>' +
      (first ? '<span class="badge b-new">初回到達！</span>' : '<span class="badge b-done">到達済み</span>')));
    var got = D.endingOrder.filter(function (k) { return sys.endings[k]; }).length;
    b.appendChild(h('p', { style: 'text-align:center' }, 'エンディング回収：' + got + ' / 6'));
    if (id === 'end5') {
      b.appendChild(h('div', { class: 'sec-title' }, '佐吉が見落としていたこと'));
      (state.lastMissing || []).forEach(function (m) { b.appendChild(h('div', { class: 'miss' }, esc(m))); });
      var notGot = Object.keys(D.evidence).filter(function (e) { return state.evidence.indexOf(e) < 0; }).length;
      var notDed = D.deductions.filter(function (d) { return state.deductions.indexOf(d.id) < 0; });
      b.appendChild(h('div', { class: 'sec-title' }, '捜査の記録'));
      b.appendChild(h('p', {}, '見つけられなかった証拠：' + notGot + ' 個'));
      b.appendChild(h('p', {}, '成立しなかった推理：' + (notDed.length ? notDed.map(function (d) { return d.title; }).join('、') : 'なし')));
      b.appendChild(h('p', { class: 'muted' }, '第3章の捜査ルートや、第4章で誰を信頼するかで、手に入る証拠が変わるバウ。'));
    } else if (id !== 'end6') {
      b.appendChild(h('p', { class: 'muted', style: 'text-align:center' }, 'まだ明かされていない真実がある……。別のルートで、別の犬の嘘を追ってみよう。'));
    } else {
      b.appendChild(h('p', { style: 'text-align:center;line-height:1.8' }, 'おめでとうバウ！　すべての嘘と真実を解き明かした。<br>名探偵・佐吉の名は、ブサワンシティの伝説になった。'));
    }
    var row = h('div', { class: 'btn-row' });
    row.appendChild(h('button', { class: 'btn gold', onclick: function () { closePanel(); showTitle(); } }, 'タイトルへ戻る'));
    row.appendChild(h('button', { class: 'btn', onclick: function () { openEndingList(function () { onEnding(id); }); } }, 'エンディング一覧'));
    b.appendChild(row);
    openPanel('エンディング', b, null, true);
  }

  function openEndingList(back) {
    var g = h('div', { class: 'end-grid' });
    D.endingOrder.forEach(function (k) {
      var E = D.endings[k], got = sys.endings[k];
      g.appendChild(h('div', { class: 'end-cell' + (got ? ' got' : '') }, '<div class="no">END ' + E.no + (E.kind === 'true' ? ' ★' : '') + '</div><div style="font-weight:800;margin:4px 0">' + (got ? esc(E.title) : '？？？？？') + '</div><div class="muted">' + (got ? '到達済み' : '未回収') + '</div>'));
    });
    var b = h('div');
    var n = D.endingOrder.filter(function (k) { return sys.endings[k]; }).length;
    b.appendChild(h('p', {}, '回収状況：<b>' + n + ' / 6</b>'));
    b.appendChild(g);
    b.appendChild(h('p', { class: 'muted' }, 'ヒント：エンディングは「誰を・なぜ・どうやって・何の証拠で」の組み合わせと、集めた証拠・成立させた推理で決まる。'));
    openPanel('エンディング一覧', b, back);
  }

  /* ================= パネル共通 ================= */
  function openPanel(title, content, onClose, noClose) {
    el['panel-title'].textContent = title;
    el['panel-body'].innerHTML = '';
    el['panel-body'].appendChild(content);
    el['panel-body'].scrollTop = 0;
    el.panel.hidden = false;
    $('panel-close').hidden = !!noClose;
    panelOnClose = onClose || null;
  }
  function closePanel(run) {
    el.panel.hidden = true;
    var f = panelOnClose; panelOnClose = null;
    if (run && f) f();
  }
  function confirmBox(html, okLabel, ok, cancel) {
    var b = h('div');
    b.appendChild(h('div', { style: 'line-height:1.7;margin-bottom:6px' }, html));
    var row = h('div', { class: 'btn-row' });
    row.appendChild(h('button', { class: 'btn ghost', onclick: function () { closePanel(); if (cancel) cancel(); } }, 'やめる'));
    row.appendChild(h('button', { class: 'btn gold', onclick: function () { closePanel(); ok(); } }, okLabel));
    b.appendChild(row);
    openPanel('確認', b, cancel);
  }

  /* ================= メニュー・セーブ・設定 ================= */
  function openMenu() {
    var l = h('div', { class: 'list' });
    var add = function (ico, label, fn) { l.appendChild(h('button', { class: 'item', onclick: function () { se('click'); fn(); } }, '<span class="ico">' + ico + '</span><span class="main">' + label + '</span>')); };
    add('💾', 'セーブ', function () { openSaveLoad('save'); });
    add('📂', 'ロード', function () { openSaveLoad('load'); });
    add('📖', '推理ノート', function () { openNotebook('combine', openMenu); });
    add('🗂️', '証拠一覧', function () { openEvidence(); });
    add('📜', 'ログ', openLog);
    add('⚙️', '設定', function () { openSettings(openMenu); });
    add('❔', '遊び方', function () { openHowto(openMenu); });
    add('🏠', 'タイトルに戻る', function () { confirmBox('タイトルに戻りますか？<br><span class="muted">オートセーブから「つづきから」で再開できます。</span>', 'タイトルへ', function () { autosave(); showTitle(); }); });
    openPanel('メニュー', l);
  }
  function slotInfo(n) {
    var r = Store.loadSlot(n);
    if (!r) return { empty: true, text: '— 空き —' };
    if (r.corrupt) return { corrupt: true, text: '⚠ データが壊れています' };
    var d = new Date(r.savedAt);
    var loc = Core.location(r.state.loc);
    return { rec: r, text: (r.state.chapter ? '第' + r.state.chapter + '章' : 'プロローグ') + (loc ? '　' + loc.name : '') + '<span class="sub">' + (isNaN(d) ? '' : d.toLocaleString('ja-JP')) + '　証拠 ' + r.state.evidence.length + '個</span>' };
  }
  function openSaveLoad(kind, back) {
    var l = h('div', { class: 'list' });
    if (!Store.persistent) l.appendChild(h('p', { class: 'miss' }, 'このブラウザでは保存領域が使えないため、セーブはページを閉じると消えます。'));
    Store.slots.forEach(function (n) {
      if (kind === 'save' && n === 'auto') return;
      var info = slotInfo(n);
      var b = h('button', { class: 'item' }, '<span class="ico">' + (n === 'auto' ? '⏱️' : '💾') + '</span><span class="main">' + (n === 'auto' ? 'オートセーブ' : 'スロット ' + n) + '<span class="sub">' + info.text + '</span></span>');
      b.addEventListener('click', function () {
        if (kind === 'save') {
          var doSave = function () { Store.saveSlot(n, state); se('found'); toast('スロット ' + n + ' にセーブしました', 'info'); openSaveLoad('save', back); };
          if (info.empty) doSave(); else confirmBox('スロット ' + n + ' に上書きしますか？', '上書き', doSave, function () { openSaveLoad('save', back); });
        } else {
          if (info.empty) return;
          if (info.corrupt) return confirmBox('このセーブデータは壊れているため読み込めません。削除しますか？', '削除', function () { Store.deleteSlot(n); openSaveLoad('load', back); }, function () { openSaveLoad('load', back); });
          closePanel();
          resume(info.rec.state);
        }
      });
      if (kind === 'load' && info.empty) b.disabled = true;
      l.appendChild(b);
    });
    openPanel(kind === 'save' ? 'セーブ' : 'ロード', l, back);
  }
  function openLog() {
    var b = h('div');
    if (!log.length) b.appendChild(h('p', { class: 'muted' }, 'まだログはない。'));
    log.slice(-200).forEach(function (r) { b.appendChild(h('div', { class: 'log-row' }, (r.who ? '<b>' + esc(r.who) + '</b><br>' : '') + esc(r.text))); });
    openPanel('ログ', b);
    setTimeout(function () { el['panel-body'].scrollTop = el['panel-body'].scrollHeight; }, 0);
  }
  function openSettings(back) {
    var s = sys.settings;
    var b = h('div');
    var range = function (label, key, min, max, stepv) {
      var row = h('div', { class: 'setting' }, '<span>' + label + '</span>');
      var r = h('input', { type: 'range', min: min, max: max, step: stepv, 'aria-label': label });
      r.value = s[key];
      r.addEventListener('input', function () { s[key] = parseFloat(r.value); applySettings(); saveSys(); });
      r.addEventListener('change', function () { se('click'); });
      row.appendChild(r); b.appendChild(row);
    };
    var select = function (label, key, opts) {
      var row = h('div', { class: 'setting' }, '<span>' + label + '</span>');
      var sel = h('select', { 'aria-label': label });
      opts.forEach(function (o) { var op = h('option', { value: o[0] }, o[1]); if (String(s[key]) === String(o[0])) op.selected = true; sel.appendChild(op); });
      sel.addEventListener('change', function () { s[key] = parseFloat(sel.value); applySettings(); saveSys(); });
      row.appendChild(sel); b.appendChild(row);
    };
    var toggle = function (label, key) {
      var row = h('div', { class: 'setting' }, '<span>' + label + '</span>');
      var t = h('button', { class: 'toggle' + (s[key] ? ' on' : ''), 'aria-label': label, 'aria-pressed': String(!!s[key]) });
      t.addEventListener('click', function () { s[key] = !s[key]; t.classList.toggle('on', s[key]); t.setAttribute('aria-pressed', String(s[key])); applySettings(); saveSys(); if (!s.mute) Audio.unlock(); });
      row.appendChild(t); b.appendChild(row);
    };
    toggle('🔇 音声をすべてオフ', 'mute');
    range('🎵 BGM 音量', 'bgm', 0, 1, 0.05);
    range('🔔 効果音 音量', 'se', 0, 1, 0.05);
    select('📝 文字の速さ', 'textSpeed', [[1, 'ゆっくり'], [2, 'ふつう'], [3, 'はやい'], [4, '一瞬']]);
    select('⏱️ オートの待ち時間', 'autoWait', [[0.8, '短い'], [1.6, 'ふつう'], [2.8, '長い']]);
    select('🔠 文字の大きさ', 'fontSize', [[0.9, '小'], [1, '中'], [1.15, '大'], [1.3, '特大']]);
    toggle('⏩ 未読の文章もスキップする', 'skipUnread');
    if (!Audio.available()) b.appendChild(h('p', { class: 'muted' }, 'このブラウザは音声に対応していないため、無音で遊べます。'));
    var row = h('div', { class: 'btn-row' });
    row.appendChild(h('button', { class: 'btn ghost', onclick: function () {
      confirmBox('エンディング回収状況・既読・設定をすべて消去しますか？<br><span class="muted">セーブスロットは消えません。</span>', '消去する', function () {
        var keep = sys.settings; sys = { ver: 1, endings: {}, read: {}, settings: keep, deductionsEver: [], clears: 0 }; saveSys(); toast('周回データを消去しました', 'info'); openSettings(back);
      }, function () { openSettings(back); });
    } }, '周回データを消去'));
    b.appendChild(row);
    openPanel('設定', b, back);
  }
  function openHowto(back) {
    var b = h('div', { class: 'howto' }, [
      '<div class="sec-title">基本</div><p>画面をタップ（クリック／Enterキー）で文章が進む。「オート」で自動送り、「スキップ」で既読の文章を飛ばせる。</p>',
      '<div class="sec-title">捜査</div><p><b>🔍調べる</b>：今いる場所の気になる所を調べる。<span class="badge b-new">未調査</span><span class="badge b-again">新しい発見あり</span> の印を目印に。証拠を手に入れたり、誰かと話したりすると、同じ場所でも新しい発見が出ることがある。</p><p><b>🚶移動する</b>：別の場所へ。章が進むと行ける場所が増える。</p><p><b>💬話す</b>：聞き込み。「詳しく聞く」「証拠を見せる」「矛盾を指摘する」「追及する」で秘密を引き出そう。</p>',
      '<div class="sec-title">嘘を暴く</div><p>証言と食い違う証拠を見つけたら「❗矛盾を指摘する」。正しければ隠していた秘密が明らかになる。見当違いだと信頼度が下がる。<b>嘘つき＝犯犬とは限らない</b>。なぜ嘘をついたのかを考えよう。</p>',
      '<div class="sec-title">推理ノート</div><p>証拠を2つ選んで組み合わせると、新しい推理が成立する。時系列・証言・秘密・未解決の謎もここで確認できる。</p>',
      '<div class="sec-title">信頼度</div><p>♥の数が犬たちの心の開き具合。信頼されると話してくれることが増える。でも信頼されなくても、別の方法で手がかりは必ず手に入る。</p>',
      '<div class="sec-title">最終推理とエンディング</div><p>第5章で「犯犬・動機・トリック・決定的証拠」を選んで突きつける。エンディングは6種類。第3章の捜査ルートと第4章の選択で、たどり着ける真相が変わる。</p>',
      '<div class="sec-title">セーブ</div><p>章の区切りや選択のたびに自動でセーブされる。メニューから3つのスロットにも保存できる。</p>'
    ].join(''));
    openPanel('遊び方', b, back);
  }

  /* ================= タイトル ================= */
  function showTitle() {
    mode = 'title';
    state = null;
    hideHub(); closePanel();
    el.dialog.hidden = true; el.choices.hidden = true; el.card.hidden = true;
    setAuto(false); setSkip(false);
    tapHandler = null;
    el.title.hidden = false;
    Audio.bgm('title');
    var art = el['title-art'];
    if (!art.innerHTML) {
      var place = [['buhita', '2%', '28%', ''], ['bosston', '70%', '28%', ''], ['mayor', '18%', '36%', 'happy'], ['chef', '56%', '34%', 'happy'], ['sakichi', '33%', '62%', 'smug']];
      art.innerHTML = Art.goldenChuru();
      place.forEach(function (p) { art.appendChild(h('div', { class: 't-dog', style: 'left:' + p[1] + ';width:' + p[2] + ';height:' + (parseInt(p[2], 10) * 1.2) + '%;max-height:' + (p[0] === 'sakichi' ? '100%' : '72%') }, Art.portrait(p[0], p[3] || 'normal'))); });
      art.lastChild.style.zIndex = 2;
    }
    var m = el['title-menu'];
    m.innerHTML = '';
    var add = function (label, fn, cls, dis) { var b = h('button', { class: 'btn ' + (cls || ''), onclick: function () { Audio.unlock(); se('click'); fn(); } }, label); if (dis) b.disabled = true; m.appendChild(b); };
    var auto = Store.loadSlot('auto');
    var anySave = Store.slots.some(function (n) { var r = Store.loadSlot(n); return r && !r.corrupt; });
    add('🐾 はじめから', newGame, 'gold');
    add('📂 つづきから', function () {
      if (auto && !auto.corrupt) resume(auto.state);
      else openSaveLoad('load', null);
    }, '', !anySave);
    if (sys.clears > 0) add('⏩ 第3章から（捜査ルート選択）', function () {
      confirmBox('第1〜2章で必ず手に入る証拠と証言を持った状態で、第3章の捜査ルート選択から始めます。<br><span class="muted">第1章の「最初に疑う犬」は選ばれていない状態になります。</span>', '始める', function () { el.title.hidden = true; startGame(Core.chapterPreset(3)); });
    });
    add('🏆 エンディング一覧', function () { openEndingList(); });
    add('⚙️ 設定', function () { openSettings(); });
    add('❔ 遊び方', function () { openHowto(); });
    var got = D.endingOrder.filter(function (k) { return sys.endings[k]; }).length;
    el['title-note'].innerHTML = 'エンディング ' + got + ' / 6' + (Audio.available() ? '' : '　（音声非対応のため無音）') + '<br>※ 立ち絵・背景はコードで描いた仮素材です';
  }
  function newGame() {
    var start = function () { el.title.hidden = true; log = []; startGame(Core.createState()); };
    var auto = Store.loadSlot('auto');
    if (auto && !auto.corrupt) confirmBox('オートセーブがあります。はじめから始めると上書きされます。<br><span class="muted">手動セーブのスロットは残ります。</span>', 'はじめから', start);
    else start();
  }
  function startGame(st) {
    state = st;
    curBg = null; shownChars = [];
    el.bg.innerHTML = ''; el.chars.innerHTML = '';
    runScene();
  }
  function resume(st) {
    el.title.hidden = true;
    state = st;
    curBg = null; shownChars = [];
    setBg(state.stage.bg || 'black');
    if (state.stage.bgm) Audio.bgm(state.stage.bgm);
    setChars(state.stage.chars);
    toast('ロードしました', 'info');
    if (state.mode === 'hub') enterHub();
    else if (state.mode === 'final') showFinal();
    else if (state.mode === 'ending') showTitle();
    else runScene();
  }

  /* ================= 入力 ================= */
  el.dialog.addEventListener('click', function (e) {
    var act = e.target.getAttribute && e.target.getAttribute('data-act');
    if (act) {
      e.stopPropagation();
      if (act === 'auto') setAuto(!autoOn);
      if (act === 'skip') setSkip(!skipOn);
      if (act === 'log') openLog();
      if (act === 'menu') openMenu();
      return;
    }
    if (!el.panel.hidden) return;
    if (tapHandler) tapHandler();
  });
  $('panel-close').addEventListener('click', function () { se('click'); closePanel(true); });
  $('btn-goals').addEventListener('click', function () { se('click'); toggleGoals(); });
  $('btn-menu-hub').addEventListener('click', function () { se('click'); openMenu(); });
  el.goals.addEventListener('click', function () { el.goals.hidden = true; });
  document.addEventListener('pointerdown', function () { Audio.unlock(); }, { once: false, passive: true });
  document.addEventListener('keydown', function (e) {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
    if (e.key === 'Escape' && !el.panel.hidden && !$('panel-close').hidden) { closePanel(true); return; }
    if ((e.key === 'Enter' || e.key === ' ') && el.panel.hidden && tapHandler && (!el.dialog.hidden || !el.card.hidden)) { e.preventDefault(); tapHandler(); }
    if (e.key === 'Control') setSkip(true);
  });
  document.addEventListener('keyup', function (e) { if (e.key === 'Control') setSkip(false); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && state) autosave(); });

  /* ================= 起動 ================= */
  applySettings();
  showTitle();
  var err = Store.takeSystemError();
  if (err) toast(err, 'info');

  // テスト・デバッグ用の窓口（ゲームの挙動には影響しない）
  G.SakichiUI = { getState: function () { return state; }, getMode: function () { return mode; }, getSys: function () { return sys; }, resume: resume };
})(window);
