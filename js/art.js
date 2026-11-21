/*
 * 仮素材：コードで描くSVGの立ち絵と背景。
 * 本番の画像に差し替える場合は data/assets.js の ART_OVERRIDES に
 *   { 'sakichi:normal': 'assets/chars/sakichi_normal.png', 'bg:plaza': 'assets/bg/plaza.jpg' }
 * のように登録すると、そちらが優先して表示される。
 */
(function (G) {
  'use strict';

  var BREEDS = {
    sakichi: { fur: '#2b2522', mask: '#121010', ear: 'button', light: '#4a403a', acc: 'deerstalker', collar: '#8b5a2b', wr: 3 },
    buhita: { fur: '#d9b68c', mask: '#5a4535', ear: 'bat', light: '#ecd2ae', acc: 'police', collar: '#1d2b4f', wr: 2 },
    bosston: { fur: '#1e1e22', mask: '#1e1e22', ear: 'pointy', light: '#f4f1ea', blaze: true, acc: 'glasses', collar: '#b03030', wr: 0 },
    gonzalez: { fur: '#a8794e', mask: '#6b4b30', ear: 'rose', light: '#f2e8da', jowls: true, acc: 'headband', collar: '#c0392b', wr: 3 },
    madame: { fur: '#f3eee6', mask: '#cfc4b4', ear: 'button', light: '#ffffff', acc: 'pearls', collar: '#b07fb8', wr: 2, lashes: true },
    chef: { fur: '#efe0c4', mask: '#c9a77c', ear: 'bat', light: '#fbf3e3', acc: 'toque', collar: '#e74c3c', wr: 1 },
    mayor: { fur: '#b77b45', mask: '#6e4423', ear: 'rose', light: '#f1e2cc', jowls: true, acc: 'tophat', collar: '#d4a017', wr: 3, glitter: true },
    pekibaa: { fur: '#d8a560', mask: '#5b3d24', ear: 'long', light: '#f0d7ad', acc: 'granny', collar: '#6d8f5c', wr: 1 },
    ponta: { fur: '#e2c08f', mask: '#3a2a20', ear: 'button', light: '#f2dcb5', acc: 'newsboy', collar: '#3d6fa8', wr: 1, small: true },
    unknown: { fur: '#333', mask: '#111', ear: 'button', light: '#555', acc: null, collar: '#222', wr: 0 }
  };

  function ears(b) {
    var f = b.fur, m = b.mask;
    switch (b.ear) {
      case 'bat': return '<path d="M48 70 L36 8 Q62 18 82 52 Z" fill="' + f + '" stroke="' + m + '" stroke-width="3"/><path d="M152 70 L164 8 Q138 18 118 52 Z" fill="' + f + '" stroke="' + m + '" stroke-width="3"/><path d="M52 60 L44 22 Q62 30 74 52 Z" fill="#e8a3a3" opacity=".7"/><path d="M148 60 L156 22 Q138 30 126 52 Z" fill="#e8a3a3" opacity=".7"/>';
      case 'pointy': return '<path d="M46 66 L40 6 L84 46 Z" fill="' + f + '"/><path d="M154 66 L160 6 L116 46 Z" fill="' + f + '"/><path d="M52 56 L48 22 L74 46 Z" fill="#c98a8a" opacity=".6"/><path d="M148 56 L152 22 L126 46 Z" fill="#c98a8a" opacity=".6"/>';
      case 'rose': return '<path d="M40 60 Q28 40 52 34 Q66 40 64 56 Z" fill="' + m + '"/><path d="M160 60 Q172 40 148 34 Q134 40 136 56 Z" fill="' + m + '"/>';
      case 'long': return '<path d="M38 56 Q10 90 22 150 Q40 160 54 140 Q60 100 60 60 Z" fill="' + m + '"/><path d="M162 56 Q190 90 178 150 Q160 160 146 140 Q140 100 140 60 Z" fill="' + m + '"/>';
      default: return '<path d="M42 58 Q30 30 60 32 Q70 46 66 62 Z" fill="' + m + '"/><path d="M158 58 Q170 30 140 32 Q130 46 134 62 Z" fill="' + m + '"/>';
    }
  }

  function eyes(face, b) {
    var L = 72, R = 128, Y = 98;
    var white = function (x) { return '<circle cx="' + x + '" cy="' + Y + '" r="15" fill="#fff"/>'; };
    var pupil = function (x, dx, dy, r) { return '<circle cx="' + (x + (dx || 0)) + '" cy="' + (Y + (dy || 0)) + '" r="' + (r || 10) + '" fill="#1a1412"/><circle cx="' + (x + (dx || 0) + 4) + '" cy="' + (Y + (dy || 0) - 4) + '" r="3.2" fill="#fff"/>'; };
    var lash = b.lashes ? '<path d="M58 88 l-6 -6 M64 84 l-3 -7 M142 88 l6 -6 M136 84 l3 -7" stroke="#222" stroke-width="2"/>' : '';
    var s = '';
    switch (face) {
      case 'happy':
        s = '<path d="M58 100 Q72 84 86 100" stroke="#1a1412" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M114 100 Q128 84 142 100" stroke="#1a1412" stroke-width="5" fill="none" stroke-linecap="round"/>'; break;
      case 'sleep':
        s = '<path d="M58 100 Q72 108 86 100" stroke="#1a1412" stroke-width="4" fill="none"/><path d="M114 100 Q128 108 142 100" stroke="#1a1412" stroke-width="4" fill="none"/><text x="150" y="60" font-size="22" fill="#9ab" font-weight="bold">Z</text><text x="166" y="42" font-size="16" fill="#9ab" font-weight="bold">z</text>'; break;
      case 'surprised':
        s = white(L) + white(R) + '<circle cx="' + L + '" cy="' + Y + '" r="5" fill="#1a1412"/><circle cx="' + R + '" cy="' + Y + '" r="5" fill="#1a1412"/>'; break;
      case 'angry':
        s = white(L) + white(R) + pupil(L, 2, 2, 8) + pupil(R, -2, 2, 8) + '<path d="M54 80 L88 92" stroke="#1a1412" stroke-width="6" stroke-linecap="round"/><path d="M146 80 L112 92" stroke="#1a1412" stroke-width="6" stroke-linecap="round"/>'; break;
      case 'sad':
        s = white(L) + white(R) + pupil(L, 0, 4, 9) + pupil(R, 0, 4, 9) + '<path d="M56 86 L86 78" stroke="#1a1412" stroke-width="5" stroke-linecap="round"/><path d="M144 86 L114 78" stroke="#1a1412" stroke-width="5" stroke-linecap="round"/><path d="M84 112 q4 10 0 14 q-4 -4 0 -14" fill="#7ec8ff"/>'; break;
      case 'smug':
        s = white(L) + white(R) + pupil(L, 3, 3, 9) + pupil(R, 3, 3, 9) + '<rect x="54" y="82" width="36" height="14" fill="' + b.fur + '"/><rect x="110" y="82" width="36" height="14" fill="' + b.fur + '"/><path d="M56 96 L88 96 M112 96 L144 96" stroke="#1a1412" stroke-width="4"/>'; break;
      case 'think':
        s = white(L) + white(R) + pupil(L, 4, -6, 9) + pupil(R, 4, -6, 9) + '<path d="M58 80 Q72 74 86 82" stroke="#1a1412" stroke-width="4" fill="none"/><path d="M114 76 Q128 70 142 74" stroke="#1a1412" stroke-width="4" fill="none"/>'; break;
      case 'shout':
        s = white(L) + white(R) + pupil(L, 0, 0, 10) + pupil(R, 0, 0, 10) + '<path d="M54 82 L88 88" stroke="#1a1412" stroke-width="6" stroke-linecap="round"/><path d="M146 82 L112 88" stroke="#1a1412" stroke-width="6" stroke-linecap="round"/>'; break;
      case 'drool':
      case 'excited':
        s = white(L) + white(R) + '<path d="M' + L + ' 86 l3 8 l9 0 l-7 6 l3 9 l-8 -5 l-8 5 l3 -9 l-7 -6 l9 0z" fill="#e8b923"/><path d="M' + R + ' 86 l3 8 l9 0 l-7 6 l3 9 l-8 -5 l-8 5 l3 -9 l-7 -6 l9 0z" fill="#e8b923"/>'; break;
      default:
        s = white(L) + white(R) + pupil(L) + pupil(R);
    }
    if (face === 'sweat') s += '<path d="M160 70 q8 14 0 20 q-8 -6 0 -20" fill="#7ec8ff" stroke="#3a8ccc" stroke-width="1.5"/>';
    return s + lash;
  }

  function mouth(face, b) {
    var base = '<path d="M100 142 Q90 154 80 148 M100 142 Q110 154 120 148" stroke="#1a1412" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    switch (face) {
      case 'shout': case 'surprised':
        return '<ellipse cx="100" cy="156" rx="' + (face === 'shout' ? 18 : 10) + '" ry="' + (face === 'shout' ? 14 : 10) + '" fill="#5a1d1d"/><ellipse cx="100" cy="162" rx="9" ry="5" fill="#e76f7a"/>';
      case 'happy': case 'excited':
        return '<path d="M78 144 Q100 172 122 144 Z" fill="#5a1d1d"/><ellipse cx="100" cy="158" rx="8" ry="7" fill="#e76f7a"/>';
      case 'drool':
        return base + '<path d="M112 150 q6 16 2 26 q-8 -4 -6 -24" fill="#bfe6ff" stroke="#7ec8ff" stroke-width="1.5"/>';
      case 'sad': case 'angry':
        return '<path d="M82 154 Q100 140 118 154" stroke="#1a1412" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
      case 'smug':
        return '<path d="M84 148 Q104 156 122 140" stroke="#1a1412" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
      default: return base;
    }
  }

  function accessory(b) {
    switch (b.acc) {
      case 'deerstalker': return '<path d="M42 54 Q100 -6 158 54 Q100 36 42 54 Z" fill="#8a6a43"/><path d="M50 50 Q100 2 150 50" stroke="#5e472b" stroke-width="2" fill="none" stroke-dasharray="6 5"/><path d="M60 40 L100 14 L140 40" stroke="#5e472b" stroke-width="2" fill="none" stroke-dasharray="4 4"/><path d="M38 54 Q24 64 30 72 L58 56 Z" fill="#7a5b38"/><path d="M162 54 Q176 64 170 72 L142 56 Z" fill="#7a5b38"/><circle cx="100" cy="12" r="5" fill="#5e472b"/>';
      case 'police': return '<path d="M48 50 Q100 10 152 50 L148 60 Q100 46 52 60 Z" fill="#1d2b4f"/><path d="M50 58 Q100 50 150 58 L156 68 Q100 58 44 68 Z" fill="#111a33"/><circle cx="100" cy="38" r="8" fill="#e8b923"/>';
      case 'glasses': return '<circle cx="72" cy="98" r="20" fill="none" stroke="#c9a227" stroke-width="3.5"/><circle cx="128" cy="98" r="20" fill="none" stroke="#c9a227" stroke-width="3.5"/><path d="M92 98 L108 98" stroke="#c9a227" stroke-width="3"/>';
      case 'headband': return '<path d="M38 70 Q100 40 162 70 L160 82 Q100 54 40 82 Z" fill="#c0392b"/><path d="M160 74 l18 -6 l-6 14 z" fill="#c0392b"/>';
      case 'pearls': return '<path d="M128 40 q16 -16 30 -2 q-6 16 -30 2" fill="#b07fb8"/><path d="M146 30 l10 -16" stroke="#b07fb8" stroke-width="2"/><circle cx="156" cy="14" r="4" fill="#fff" stroke="#b07fb8"/>';
      case 'toque': return '<rect x="64" y="22" width="72" height="30" rx="4" fill="#fff" stroke="#ddd"/><circle cx="74" cy="18" r="16" fill="#fff"/><circle cx="100" cy="10" r="18" fill="#fff"/><circle cx="126" cy="18" r="16" fill="#fff"/>';
      case 'tophat': return '<rect x="64" y="2" width="72" height="44" rx="4" fill="#1a1412"/><rect x="64" y="34" width="72" height="8" fill="#d4a017"/><rect x="48" y="44" width="104" height="8" rx="4" fill="#1a1412"/>';
      case 'granny': return '<circle cx="72" cy="98" r="18" fill="none" stroke="#6d4f2c" stroke-width="3"/><circle cx="128" cy="98" r="18" fill="none" stroke="#6d4f2c" stroke-width="3"/><path d="M90 98 L110 98" stroke="#6d4f2c" stroke-width="3"/><path d="M78 40 Q100 28 122 40" stroke="#e5d0a8" stroke-width="10" fill="none" stroke-linecap="round"/>';
      case 'newsboy': return '<path d="M44 58 Q100 0 156 58 Q100 44 44 58 Z" fill="#7b8a99"/><path d="M58 58 Q100 50 128 62 L120 70 Q96 58 58 66 Z" fill="#5f6d7a"/><circle cx="100" cy="18" r="5" fill="#5f6d7a"/>';
      default: return '';
    }
  }

  function body(b, id) {
    var extra = '';
    if (id === 'bosston') extra = '<path d="M86 200 L100 212 L114 200 L114 222 L100 212 L86 222 Z" fill="#b03030"/>';
    if (id === 'madame') extra = '<path d="M62 196 Q100 222 138 196" stroke="#fff" stroke-width="7" fill="none" stroke-dasharray="1 9" stroke-linecap="round"/>';
    if (id === 'mayor') extra = '<path d="M60 196 L140 236" stroke="#d4a017" stroke-width="14"/>';
    if (id === 'ponta') extra = '<rect x="84" y="208" width="32" height="22" rx="4" fill="#333"/><circle cx="100" cy="219" r="7" fill="#88a"/>';
    if (id === 'pekibaa') extra = '<rect x="96" y="206" width="8" height="20" fill="#c9a227"/><circle cx="100" cy="204" r="6" fill="none" stroke="#c9a227" stroke-width="3"/>';
    if (id === 'chef') extra = '<rect x="58" y="196" width="84" height="44" fill="#fff"/><circle cx="90" cy="216" r="3" fill="#ccc"/><circle cx="110" cy="216" r="3" fill="#ccc"/>';
    if (id === 'buhita') extra = '<rect x="58" y="196" width="84" height="44" fill="#1d2b4f"/><path d="M92 198 L100 214 L108 198" fill="#fff"/>';
    if (id === 'sakichi') extra = '<path d="M50 200 Q100 186 150 200 L156 240 L44 240 Z" fill="#8a6a43"/><path d="M80 196 L100 220 L120 196" fill="none" stroke="#5e472b" stroke-width="3"/>';
    return '<path d="M44 240 Q50 186 100 182 Q150 186 156 240 Z" fill="' + b.fur + '"/><path d="M62 194 Q100 206 138 194" stroke="' + b.collar + '" stroke-width="9" fill="none"/>' + extra;
  }

  function portrait(id, face) {
    var b = BREEDS[id] || BREEDS.unknown;
    face = face || 'normal';
    var sc = b.small ? 0.86 : 1;
    var wr = '';
    for (var i = 0; i < b.wr; i++) wr += '<path d="M' + (78 - i * 4) + ' ' + (70 - i * 7) + ' Q100 ' + (60 - i * 8) + ' ' + (122 + i * 4) + ' ' + (70 - i * 7) + '" stroke="' + b.mask + '" stroke-width="3" fill="none" opacity=".55"/>';
    var blaze = b.blaze ? '<path d="M92 40 Q100 34 108 40 L114 120 Q100 132 86 120 Z" fill="' + b.light + '"/><path d="M64 128 Q100 180 136 128 Q132 176 100 182 Q68 176 64 128" fill="' + b.light + '"/>' : '';
    var jowls = b.jowls ? '<path d="M46 130 Q40 172 76 176 Q90 160 88 140 Z" fill="' + b.light + '" stroke="' + b.mask + '" stroke-width="2"/><path d="M154 130 Q160 172 124 176 Q110 160 112 140 Z" fill="' + b.light + '" stroke="' + b.mask + '" stroke-width="2"/>' : '';
    var muzzle = '<ellipse cx="100" cy="140" rx="' + (b.jowls ? 40 : 34) + '" ry="28" fill="' + (b.blaze ? b.light : b.mask) + '"/>';
    var glitter = b.glitter ? '<g fill="#ffe066"><path d="M58 120 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z"/><path d="M146 116 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z"/><path d="M120 62 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5z"/><path d="M80 156 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5z"/></g>' : '';
    var fluff = b.ear === 'long' ? '<path d="M50 150 Q60 192 100 194 Q140 192 150 150" fill="' + b.light + '" opacity=".8"/>' : '';
    return '<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" class="dog dog-' + id + '" role="img" aria-label="' + id + '">' +
      '<g transform="translate(' + (100 - 100 * sc) + ' ' + (240 - 240 * sc) + ') scale(' + sc + ')">' +
      body(b, id) + ears(b) + fluff +
      '<ellipse cx="100" cy="112" rx="66" ry="72" fill="' + b.fur + '"/>' + blaze + wr +
      jowls + muzzle + eyes(face, b) +
      '<ellipse cx="100" cy="128" rx="17" ry="11" fill="#14100e"/><ellipse cx="94" cy="125" rx="4" ry="2.5" fill="#555"/>' +
      mouth(face, b) + glitter + accessory(b) + '</g></svg>';
  }

  /* ---------- 背景 ---------- */
  function sky(top, bottom) {
    return '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + top + '"/><stop offset="1" stop-color="' + bottom + '"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/>';
  }
  function buildings(col) {
    var s = '';
    var xs = [0, 90, 170, 280, 380, 470, 560, 660, 730];
    xs.forEach(function (x, i) {
      var h = 120 + ((i * 53) % 90);
      s += '<rect x="' + x + '" y="' + (330 - h) + '" width="' + (70 + (i % 3) * 14) + '" height="' + h + '" fill="' + col + '" opacity=".9"/>';
      for (var w = 0; w < 3; w++) s += '<rect x="' + (x + 12 + w * 18) + '" y="' + (350 - h) + '" width="10" height="14" fill="#f6d99a" opacity=".55"/>';
    });
    return s;
  }
  var BG = {
    black: function () { return '<rect width="800" height="500" fill="#07080d"/>'; },
    town: function () { return sky('#f6c58b', '#f9e6c4') + buildings('#6e5643') + '<rect y="330" width="800" height="170" fill="#8a6c51"/><circle cx="640" cy="90" r="46" fill="#ffefb8"/>'; },
    office_sakichi: function () { return sky('#3b2c22', '#5d4535') + '<rect x="290" y="50" width="220" height="150" fill="#9fc1d6" stroke="#2c1f17" stroke-width="10"/><path d="M400 50 V200 M290 125 H510" stroke="#2c1f17" stroke-width="6"/><text x="400" y="246" font-size="26" text-anchor="middle" fill="#e8c77d" font-weight="bold">佐吉探偵事務所</text><rect y="360" width="800" height="140" fill="#4a3426"/><rect x="250" y="290" width="300" height="24" fill="#7a5235"/><rect x="270" y="314" width="16" height="70" fill="#5a3b26"/><rect x="514" y="314" width="16" height="70" fill="#5a3b26"/><rect x="420" y="262" width="40" height="28" fill="#ddd"/><rect x="330" y="270" width="50" height="20" rx="4" fill="#c0392b"/>'; },
    plaza: function () { return sky('#8ec5e8', '#dff1fb') + buildings('#b68d6a') + '<rect y="320" width="800" height="180" fill="#c9a777"/><rect x="370" y="100" width="60" height="230" fill="#7a5a3a"/><circle cx="400" cy="140" r="34" fill="#f8f1dc" stroke="#4a3426" stroke-width="5"/><path d="M400 140 V114 M400 140 L400 140" stroke="#222" stroke-width="4"/><path d="M400 140 L400 116" stroke="#222" stroke-width="3"/><path d="M400 140 L400 120" stroke="#222" stroke-width="5" stroke-linecap="round"/><path d="M0 60 Q200 110 400 70 T800 60" stroke="#c0392b" stroke-width="3" fill="none"/><g fill="#e8b923"><path d="M60 72 l12 26 l12 -26z"/><path d="M180 92 l12 26 l12 -26z"/><path d="M560 84 l12 26 l12 -26z"/><path d="M700 66 l12 26 l12 -26z"/></g>'; },
    stage: function () { return sky('#1c2440', '#36406a') + '<rect y="300" width="800" height="200" fill="#5a3b26"/><rect x="80" y="40" width="640" height="60" fill="#8b1e2d"/><text x="400" y="82" font-size="30" text-anchor="middle" fill="#e8c77d" font-weight="bold">世界ちゅ〜る祭り</text><g fill="#ffe7a0" opacity=".25"><path d="M120 0 L180 300 L60 300z"/><path d="M680 0 L740 300 L620 300z"/></g><rect x="40" y="250" width="40" height="30" fill="#222"/><circle cx="60" cy="246" r="6" fill="#e74c3c"/><rect x="720" y="250" width="40" height="30" fill="#222"/><circle cx="740" cy="246" r="6" fill="#e74c3c"/>'; },
    storage: function () { return sky('#2e2a35', '#463e4c') + '<rect y="360" width="800" height="140" fill="#3a3038"/><rect x="40" y="80" width="180" height="260" fill="#57484f"/><path d="M40 150 H220 M40 220 H220 M40 290 H220" stroke="#2a2228" stroke-width="6"/><rect x="560" y="70" width="140" height="290" fill="#6b5a4a" stroke="#2a2228" stroke-width="8"/><circle cx="580" cy="220" r="8" fill="#c9a227"/><rect x="330" y="170" width="90" height="70" fill="#7f8c8d" stroke="#2a2228" stroke-width="6"/><circle cx="410" cy="182" r="5" fill="#2ecc71"/><text x="375" y="262" font-size="16" text-anchor="middle" fill="#c8b8a8">配膳リフト</text>'; },
    display: function () { return sky('#2a2433', '#4a3d52') + '<rect y="360" width="800" height="140" fill="#3a3038"/><rect x="300" y="250" width="200" height="120" fill="#6b4a32"/><rect x="320" y="180" width="160" height="80" fill="#bfe3f0" opacity=".35" stroke="#e8f6fb" stroke-width="3"/><rect x="350" y="236" width="100" height="20" fill="none" stroke="#9aa" stroke-dasharray="4 4"/><g fill="#ffe7a0" opacity=".2"><path d="M400 0 L470 250 L330 250z"/></g>'; },
    monitor: function () { return sky('#0e1528', '#18223d') + '<rect y="380" width="800" height="120" fill="#1b2238"/>' + [0, 1, 2, 3].map(function (i) { return '<rect x="' + (90 + i * 160) + '" y="80" width="140" height="96" fill="#0b2a2a" stroke="#3a4766" stroke-width="6"/><rect x="' + (100 + i * 160) + '" y="90" width="120" height="76" fill="' + (i === 1 ? '#000' : '#123d3a') + '"/>'; }).join('') + [0, 1, 2, 3].map(function (i) { return '<rect x="' + (90 + i * 160) + '" y="200" width="140" height="96" fill="#0b2a2a" stroke="#3a4766" stroke-width="6"/><rect x="' + (100 + i * 160) + '" y="210" width="120" height="76" fill="#123d3a"/>'; }).join('') + '<rect x="250" y="330" width="300" height="20" fill="#2c3550"/>'; },
    kitchen: function () { return sky('#c7b299', '#e9dcc8') + '<rect y="330" width="800" height="170" fill="#d9cbb5"/><path d="M0 330 H800" stroke="#9c8a73" stroke-width="4"/><rect x="40" y="120" width="160" height="210" fill="#dfe6e9" stroke="#95a5a6" stroke-width="6"/><rect x="190" y="200" width="8" height="40" fill="#95a5a6"/><rect x="300" y="240" width="300" height="90" fill="#7f8c8d"/><ellipse cx="380" cy="230" rx="40" ry="14" fill="#95a5a6"/><ellipse cx="520" cy="230" rx="40" ry="14" fill="#95a5a6"/><path d="M370 200 q10 -20 0 -40 M390 205 q10 -20 0 -40" stroke="#fff" stroke-width="4" opacity=".6" fill="none"/><rect x="650" y="160" width="90" height="70" fill="#7f8c8d" stroke="#555" stroke-width="5"/><circle cx="735" cy="200" r="10" fill="#555"/>'; },
    keyhut: function () { return sky('#5a4230', '#7b5c42') + '<rect y="350" width="800" height="150" fill="#5a3f2a"/>' + [0, 1, 2, 3, 4, 5, 6].map(function (i) { return '<rect x="' + (60 + i * 26) + '" y="90" width="22" height="120" fill="' + ['#8b1e2d', '#1d2b4f', '#2d6a4f', '#7a5235', '#6d4f9c', '#8b1e2d', '#1d2b4f'][i] + '"/>'; }).join('') + '<rect x="520" y="110" width="180" height="120" fill="#7a5235" stroke="#3a2618" stroke-width="6"/><circle cx="610" cy="150" r="6" fill="#c9a227"/><path d="M610 156 V190" stroke="#c9a227" stroke-width="5"/>'; },
    office: function () { return sky('#5b2333', '#7e3448') + '<rect y="350" width="800" height="150" fill="#6b1f2f"/><rect x="60" y="80" width="240" height="190" fill="#e8d6b5" stroke="#d4a017" stroke-width="8"/><text x="180" y="190" font-size="40" text-anchor="middle" fill="#7e3448">町</text><rect x="480" y="220" width="260" height="30" fill="#4a2a1a"/><rect x="500" y="250" width="20" height="100" fill="#3a1f12"/><rect x="700" y="250" width="20" height="100" fill="#3a1f12"/><rect x="380" y="200" width="70" height="150" fill="#555" stroke="#333" stroke-width="5"/><circle cx="415" cy="260" r="12" fill="#888"/><g fill="#ffe066">' + [80, 160, 300, 520, 640, 720].map(function (x, i) { return '<circle cx="' + x + '" cy="' + (380 + (i * 37) % 90) + '" r="3"/>'; }).join('') + '</g>'; },
    vip: function () { return sky('#e7d3e8', '#f7ecf5') + '<path d="M0 60 Q100 120 200 60 Q300 120 400 60 Q500 120 600 60 Q700 120 800 60 V0 H0Z" fill="#b07fb8"/><rect y="360" width="800" height="140" fill="#cdb4d0"/><ellipse cx="400" cy="330" rx="150" ry="26" fill="#fff"/><rect x="390" y="330" width="20" height="50" fill="#a78aa9"/><path d="M370 300 h30 v24 h-30z" fill="#fff" stroke="#b07fb8" stroke-width="3"/>'; },
    backdoor: function () { return sky('#4a4237', '#655a4a') + '<rect y="340" width="800" height="160" fill="#7d6f5d"/><ellipse cx="380" cy="420" rx="300" ry="50" fill="#b98a4a" opacity=".55"/><g fill="#3d3329" opacity=".6">' + [0, 1, 2, 3, 4].map(function (i) { return '<ellipse cx="' + (200 + i * 110) + '" cy="' + (430 - i * 12) + '" rx="22" ry="12"/>'; }).join('') + '</g><rect x="620" y="110" width="120" height="150" fill="#6b5a4a" stroke="#3d3329" stroke-width="6"/><rect x="80" y="40" width="40" height="24" fill="#222"/><circle cx="100" cy="52" r="5" fill="#e74c3c"/>'; },
    gate: function () { return sky('#1f2326', '#33393d') + '<rect y="380" width="800" height="120" fill="#2b2f33"/><rect x="290" y="80" width="220" height="300" fill="#0a0b0d"/><path d="M290 80 H510 V380" fill="none" stroke="#55606a" stroke-width="10"/><path d="M520 200 L640 380 L600 390 L480 220Z" fill="#6b5a4a" stroke="#3d3329" stroke-width="5"/><g fill="#6b5a4a">' + [0, 1, 2, 3].map(function (i) { return '<rect x="' + (560 + i * 40) + '" y="' + (420 + (i % 2) * 20) + '" width="24" height="8" transform="rotate(' + (i * 30) + ' ' + (570 + i * 40) + ' 424)"/>'; }).join('') + '</g>'; },
    warehouse: function () { return sky('#0c0d10', '#1a1c22') + '<rect y="380" width="800" height="120" fill="#16181d"/>' + [0, 1, 2].map(function (r) { return [0, 1, 2, 3, 4, 5].map(function (c) { var n = r * 6 + c + 1; return '<rect x="' + (60 + c * 115) + '" y="' + (90 + r * 95) + '" width="96" height="78" fill="#4a3a28" stroke="#2a2016" stroke-width="4"/><text x="' + (108 + c * 115) + '" y="' + (140 + r * 95) + '" font-size="28" text-anchor="middle" fill="#8a7458">' + n + '</text>'; }).join(''); }).join('') + '<ellipse cx="400" cy="260" rx="260" ry="200" fill="#fff6c8" opacity=".09"/>'; },
    rain: function () { var s = sky('#2c3440', '#4a5566') + buildings('#353c48') + '<rect y="330" width="800" height="170" fill="#3c4450"/><g stroke="#9fb3c8" stroke-width="2" opacity=".5">'; for (var i = 0; i < 60; i++) s += '<path d="M' + ((i * 137) % 800) + ' ' + ((i * 71) % 480) + ' l-8 22"/>'; return s + '</g>'; }
  };

  function background(id) {
    var f = BG[id] || BG.black;
    return '<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' + f() + '</svg>';
  }

  /* 黄金のちゅ〜る（タイトル用） */
  function goldenChuru() {
    return '<svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg" class="churu"><defs><linearGradient id="gold" x1="0" x2="1"><stop offset="0" stop-color="#a87b12"/><stop offset=".45" stop-color="#ffe9a3"/><stop offset=".6" stop-color="#e8b923"/><stop offset="1" stop-color="#8a6410"/></linearGradient></defs><path d="M30 20 H90 L84 200 Q60 214 36 200 Z" fill="url(#gold)" stroke="#6b4c0c" stroke-width="3"/><rect x="26" y="8" width="68" height="18" rx="4" fill="#c9a227" stroke="#6b4c0c" stroke-width="3"/><text x="60" y="110" font-size="22" text-anchor="middle" fill="#6b4c0c" font-weight="bold" writing-mode="tb">ちゅ〜る</text><path d="M44 40 L48 180" stroke="#fff" stroke-width="5" opacity=".5" stroke-linecap="round"/></svg>';
  }

  function override(key) {
    var o = (G.GAME_DATA && G.GAME_DATA.ART_OVERRIDES) || {};
    return o[key] || null;
  }

  G.SakichiArt = {
    portrait: function (id, face) {
      var src = override(id + ':' + (face || 'normal')) || override(id + ':normal');
      if (src) return '<img class="dog-img" alt="" src="' + src + '">';
      return portrait(id, face);
    },
    background: function (id) {
      var src = override('bg:' + id);
      if (src) return '<img class="bg-img" alt="" src="' + src + '">';
      return background(id);
    },
    goldenChuru: goldenChuru
  };
})(typeof window !== 'undefined' ? window : globalThis);
