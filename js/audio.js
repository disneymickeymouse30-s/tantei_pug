/*
 * Web Audio API による自作のBGM・効果音（音声ファイル不要）。
 * AudioContext が使えない環境・ミュート時は全て何もしない（ゲーム進行には影響しない）。
 */
(function (G) {
  'use strict';
  var ctx = null, master = null, bgmGain = null, seGain = null;
  var vol = { bgm: 0.5, se: 0.7, mute: false };
  var current = null, timer = null, step = 0, nextTime = 0;

  function ensure() {
    if (ctx) return true;
    try {
      var AC = G.AudioContext || G.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.connect(ctx.destination);
      bgmGain = ctx.createGain(); bgmGain.connect(master);
      seGain = ctx.createGain(); seGain.connect(master);
      applyVol();
      return true;
    } catch (e) { ctx = null; return false; }
  }
  function applyVol() {
    if (!ctx) return;
    master.gain.value = vol.mute ? 0 : 1;
    bgmGain.gain.value = vol.bgm * 0.22;
    seGain.gain.value = vol.se * 0.5;
  }
  function unlock() { if (ensure() && ctx.state === 'suspended') ctx.resume().catch(function () {}); }

  var N = function (n) { return 440 * Math.pow(2, (n - 69) / 12); };

  function tone(dest, freq, t, dur, type, gain, slideTo) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.3, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dest, t, dur, gain, freq) {
    var len = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var s = ctx.createBufferSource(); s.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1200;
    var g = ctx.createGain(); g.gain.value = gain || 0.3;
    s.connect(f); f.connect(g); g.connect(dest); s.start(t);
  }

  /* ---- BGM：16分音符ステップのシーケンス（null は休符） ---- */
  var TRACKS = {
    title: { bpm: 132, wave: 'square', mel: [72, null, 76, null, 79, null, 76, 77, 79, null, 81, 79, 76, null, 72, null, 74, null, 77, null, 81, null, 79, 77, 76, null, 74, null, 72, null, null, null], bass: [48, 55, 48, 55, 53, 60, 53, 60, 50, 57, 50, 57, 55, 62, 55, 62] },
    comedy: { bpm: 150, wave: 'square', mel: [76, 76, null, 72, null, 76, null, 79, null, null, 67, null, null, null, 72, null, 74, null, 72, 71, 69, null, 71, null, 72, null, null, null, null, null, null, null], bass: [48, null, 55, null, 48, null, 55, null, 53, null, 60, null, 55, null, 62, null] },
    mystery: { bpm: 84, wave: 'triangle', mel: [69, 72, 76, 72, 69, 72, 76, 72, 68, 71, 76, 71, 68, 71, 76, 71, 65, 69, 72, 69, 65, 69, 72, 69, 64, 68, 71, 68, 64, 68, 71, 74], bass: [45, null, null, null, 44, null, null, null, 41, null, null, null, 40, null, null, null] },
    tense: { bpm: 112, wave: 'sawtooth', mel: [null, 69, null, null, 70, null, null, 69, null, null, 72, null, 70, null, 69, null], bass: [33, 33, 33, 33, 34, 34, 33, 33] },
    climax: { bpm: 140, wave: 'square', mel: [69, null, 72, 76, null, 74, 72, null, 71, null, 74, 77, null, 76, 74, null, 72, null, 76, 79, null, 77, 76, null, 81, null, 80, null, 76, null, null, null], bass: [45, 45, 52, 45, 43, 43, 50, 43, 41, 41, 48, 41, 40, 40, 47, 44] },
    ending_true: { bpm: 100, wave: 'triangle', mel: [72, null, 76, null, 79, null, 84, null, 83, null, 79, null, 81, null, 77, null, 76, null, 79, null, 84, null, 88, null, 86, null, 84, null, 84, null, null, null], bass: [48, null, 55, null, 52, null, 55, null, 53, null, 57, null, 55, null, 59, null] },
    ending_route: { bpm: 92, wave: 'triangle', mel: [67, null, 72, null, 71, null, 69, null, 67, null, 64, null, 65, null, 67, null, 69, null, 71, null, 72, null, 74, null, 72, null, null, null, null, null, null, null], bass: [48, null, 52, null, 53, null, 55, null] },
    sad: { bpm: 70, wave: 'triangle', mel: [69, null, 68, null, 69, null, 72, null, 71, null, 69, null, 68, null, null, null, 65, null, 64, null, 65, null, 69, null, 68, null, null, null, null, null, null, null], bass: [45, null, null, null, 41, null, null, null, 40, null, null, null, 44, null, null, null] }
  };

  function schedule() {
    if (!ctx || !current) return;
    var tr = TRACKS[current];
    var sp = 60 / tr.bpm / 4;
    while (nextTime < ctx.currentTime + 0.15) {
      var m = tr.mel[step % tr.mel.length];
      if (m) tone(bgmGain, N(m), nextTime, sp * 1.8, tr.wave, 0.25);
      if (step % 2 === 0) {
        var b = tr.bass[(step / 2) % tr.bass.length];
        if (b) tone(bgmGain, N(b), nextTime, sp * 1.9, 'triangle', 0.35);
      }
      if (current === 'tense' && step % 4 === 0) noise(bgmGain, nextTime, 0.05, 0.25, 180);
      nextTime += sp; step++;
    }
  }

  function playBgm(id) {
    if (id === current) return;
    stopBgm();
    if (!id || !TRACKS[id] || !ensure()) { current = id; return; }
    current = id; step = 0; nextTime = ctx.currentTime + 0.05;
    timer = setInterval(schedule, 40);
  }
  function stopBgm() { if (timer) clearInterval(timer); timer = null; current = null; }

  /* ---- 効果音 ---- */
  var SE = {
    bark: function (t) { tone(seGain, 520, t, 0.11, 'sawtooth', 0.4, 300); noise(seGain, t, 0.08, 0.2, 900); tone(seGain, 600, t + 0.16, 0.12, 'sawtooth', 0.4, 330); },
    step: function (t) { for (var i = 0; i < 3; i++) noise(seGain, t + i * 0.18, 0.06, 0.4, 300); },
    door: function (t) { tone(seGain, 180, t, 0.5, 'sawtooth', 0.15, 120); noise(seGain, t + 0.45, 0.12, 0.5, 200); },
    found: function (t) { [72, 76, 79, 84].forEach(function (n, i) { tone(seGain, N(n), t + i * 0.07, 0.18, 'square', 0.25); }); },
    success: function (t) { [67, 72, 76, 79, 84].forEach(function (n, i) { tone(seGain, N(n), t + i * 0.08, 0.3, 'square', 0.25); }); tone(seGain, N(88), t + 0.42, 0.5, 'triangle', 0.3); },
    objection: function (t) { [60, 64, 67, 72].forEach(function (n) { tone(seGain, N(n), t, 0.45, 'sawtooth', 0.22); }); noise(seGain, t, 0.15, 0.4, 2000); },
    wrong: function (t) { tone(seGain, N(64), t, 0.18, 'square', 0.25); tone(seGain, N(58), t + 0.18, 0.35, 'square', 0.25); },
    bonk: function (t) { tone(seGain, 300, t, 0.15, 'sine', 0.5, 90); },
    phone: function (t) { for (var i = 0; i < 4; i++) tone(seGain, i % 2 ? 1320 : 1100, t + i * 0.09, 0.08, 'square', 0.18); },
    thunder: function (t) { noise(seGain, t, 0.8, 0.6, 120); },
    clock: function (t) { tone(seGain, N(76), t, 0.8, 'sine', 0.3); },
    click: function (t) { tone(seGain, 900, t, 0.04, 'square', 0.12); },
    trust_up: function (t) { tone(seGain, N(79), t, 0.1, 'triangle', 0.25); tone(seGain, N(84), t + 0.08, 0.15, 'triangle', 0.25); },
    trust_down: function (t) { tone(seGain, N(70), t, 0.12, 'triangle', 0.25); tone(seGain, N(65), t + 0.1, 0.18, 'triangle', 0.25); }
  };
  function playSe(id) {
    if (vol.mute || !SE[id] || !ensure()) return;
    try { SE[id](ctx.currentTime + 0.01); } catch (e) { /* 無音で続行 */ }
  }

  G.SakichiAudio = {
    unlock: unlock,
    bgm: playBgm, stop: stopBgm, se: playSe,
    setVolume: function (o) { Object.keys(o).forEach(function (k) { vol[k] = o[k]; }); applyVol(); },
    tracks: Object.keys(TRACKS), effects: Object.keys(SE),
    available: function () { return !!(G.AudioContext || G.webkitAudioContext); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
