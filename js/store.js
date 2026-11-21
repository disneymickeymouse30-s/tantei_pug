/*
 * セーブデータ管理（localStorage）。使えない環境ではメモリに保存して続行する。
 *  sakichi.sys      : 周回データ（到達エンディング・既読・設定・成立したことのある推理）
 *  sakichi.slot.N   : セーブスロット（auto / 1 / 2 / 3）
 */
(function (G) {
  'use strict';
  var Core = G.SakichiCore;
  var SYS_KEY = 'sakichi.sys';
  var SYS_VERSION = 1;
  var mem = {};
  var ls = null;
  try { ls = G.localStorage; ls.setItem('sakichi.test', '1'); ls.removeItem('sakichi.test'); } catch (e) { ls = null; }

  function get(k) { try { return ls ? ls.getItem(k) : (k in mem ? mem[k] : null); } catch (e) { return mem[k] || null; } }
  function set(k, v) { try { if (ls) ls.setItem(k, v); else mem[k] = v; return true; } catch (e) { mem[k] = v; return false; } }
  function del(k) { try { if (ls) ls.removeItem(k); } catch (e) { /* noop */ } delete mem[k]; }

  function defaultSettings() {
    return { bgm: 0.5, se: 0.7, mute: false, textSpeed: 2, autoWait: 1.6, skipUnread: false, fontSize: 1 };
  }
  function defaultSystem() {
    return { ver: SYS_VERSION, endings: {}, read: {}, settings: defaultSettings(), deductionsEver: [], clears: 0 };
  }

  var lastSystemError = null;
  function loadSystem() {
    var raw = get(SYS_KEY);
    var d = defaultSystem();
    if (!raw) return d;
    try {
      var o = JSON.parse(raw);
      if (!o || typeof o !== 'object') throw new Error('bad');
      d.endings = (o.endings && typeof o.endings === 'object') ? o.endings : {};
      d.read = (o.read && typeof o.read === 'object') ? o.read : {};
      d.deductionsEver = Array.isArray(o.deductionsEver) ? o.deductionsEver : [];
      d.clears = typeof o.clears === 'number' ? o.clears : Object.keys(d.endings).length;
      var s = o.settings || {};
      Object.keys(d.settings).forEach(function (k) { if (typeof s[k] === typeof d.settings[k]) d.settings[k] = s[k]; });
      return d;
    } catch (e) {
      lastSystemError = '周回データが壊れていたため、初期化しました。';
      set(SYS_KEY + '.broken', raw);
      return d;
    }
  }
  function saveSystem(sys) { set(SYS_KEY, JSON.stringify(sys)); }

  function slotKey(n) { return 'sakichi.slot.' + n; }
  function saveSlot(n, state) {
    var rec = { savedAt: new Date().toISOString(), chapter: state.chapter, loc: state.loc, mode: state.mode, state: state };
    return set(slotKey(n), JSON.stringify(rec));
  }
  // 戻り値：null（空）/ { corrupt: true } / { savedAt, chapter, state }
  function loadSlot(n) {
    var raw = get(slotKey(n));
    if (!raw) return null;
    try {
      var rec = JSON.parse(raw);
      var st = Core.deserialize(rec && rec.state);
      if (!st) return { corrupt: true };
      return { savedAt: rec.savedAt, chapter: st.chapter, state: st };
    } catch (e) { return { corrupt: true }; }
  }
  function deleteSlot(n) { del(slotKey(n)); }

  G.SakichiStore = {
    loadSystem: loadSystem, saveSystem: saveSystem,
    saveSlot: saveSlot, loadSlot: loadSlot, deleteSlot: deleteSlot,
    slots: ['auto', '1', '2', '3'],
    persistent: !!ls,
    takeSystemError: function () { var e = lastSystemError; lastSystemError = null; return e; },
    _raw: { get: get, set: set }
  };
})(typeof window !== 'undefined' ? window : globalThis);
