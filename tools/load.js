// Node 用：ブラウザと同じ順番でデータとコアを読み込む
const path = require('path');
const ROOT = path.join(__dirname, '..');
const FILES = [
  'data/characters.js', 'data/evidence.js', 'data/notebook.js', 'data/locations.js',
  'data/talks.js', 'data/scenes.js', 'data/endings.js', 'js/core.js'
];
function load() {
  delete globalThis.GAME_DATA;
  for (const f of FILES) {
    const p = path.join(ROOT, f);
    delete require.cache[require.resolve(p)];
    require(p);
  }
  return { D: globalThis.GAME_DATA, C: globalThis.SakichiCore };
}
module.exports = { load, FILES };
