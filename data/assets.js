/*
 * 画像の差し替え設定。現在の立ち絵・背景はすべて js/art.js がコードで描く「仮素材」。
 * 本番画像を用意したら、ここにパスを登録すると優先表示される（未登録のものは仮素材のまま）。
 *   キー：'キャラID:表情'（表情が無ければ 'キャラID:normal' を使用）／ 'bg:背景ID'
 *   表情：normal think sweat shout surprised smug drool excited angry sad happy sleep
 *   背景：town office_sakichi plaza stage storage display monitor kitchen keyhut office vip backdoor gate warehouse rain black
 */
(function (G) {
  var D = G.GAME_DATA = G.GAME_DATA || {};
  D.ART_OVERRIDES = {
    // 'sakichi:normal': 'assets/chars/sakichi_normal.png',
    // 'bg:plaza': 'assets/bg/plaza.jpg'
  };
})(typeof window !== 'undefined' ? window : globalThis);
