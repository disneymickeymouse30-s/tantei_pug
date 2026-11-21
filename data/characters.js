/* キャラクター定義 */
(function (G) {
  var D = G.GAME_DATA = G.GAME_DATA || {};
  D.characters = {
    sakichi: {
      name: '佐吉', breed: '黒パグ', role: '名探偵（自称）',
      profile: 'ブサワンシティの名探偵。嗅覚と観察力は一流、ただし「ちゅ〜る」の三文字を聞くと推理が三秒止まる。',
      quirk: 'その話、ちょっと待つバウ', trust: false
    },
    buhita: {
      name: 'ブヒ田刑事', breed: 'フレンチブルドッグ', role: 'ブサワン署の刑事',
      profile: '正義感の塊。ただし推理は秒速で結論に飛びつく。なぜか朝から「地下の箱7」を気にしている。',
      quirk: '犯犬はお前ブヒ！', trust: true
    },
    bosston: {
      name: 'ボス・トン', breed: 'ボストンテリア', role: 'IT会社「タキシードシステムズ」社長',
      profile: '会場の監視システムを管理する理屈屋。白黒タキシード柄が自慢。パスワードは自慢できない。',
      quirk: '論理的に考えたまえ', trust: true
    },
    gonzalez: {
      name: 'ゴンザレス', breed: 'イングリッシュブルドッグ', role: '力持ちの運搬係',
      profile: 'ドアを一撃で外す怪力。そのくせ暗い所と雷とお化けが大の苦手。勝負の日は真っ赤な靴下をはく。',
      quirk: 'オ、オレじゃねえぞ！', trust: true
    },
    madame: {
      name: 'マダム・サキ', breed: '白パグ', role: '祭りのスポンサー／ブサワンTVオーナー',
      profile: '町一番の名士。上品な微笑みの奥で何を考えているのか誰にもわからない。口癖は「台本どおりね」。',
      quirk: 'あら、台本どおりね', trust: true
    },
    chef: {
      name: 'シェフ・ブヒーノ', breed: 'フレンチブルドッグ', role: '祭りの料理長',
      profile: '祭りの料理とちゅ〜るの在庫を任された天才料理犬。味見の回数も天才的。',
      quirk: 'ボーノ！……いや今のは味見じゃないブヒ', trust: true
    },
    mayor: {
      name: 'ブサワン町長', breed: 'ブルドッグ', role: '世界ちゅ〜る祭り主催者',
      profile: '大げさな演説が三度の飯より好き。今朝はなぜか顔がキラキラしている。',
      quirk: 'ワシは何も聞いておらん！', trust: true
    },
    pekibaa: {
      name: 'ペキ婆', breed: 'ペキニーズ', role: '鍵番（保管室の鍵の管理人）',
      profile: '鍵番一筋四十年。一本しかない保管室の鍵を、誰に何時何分貸したか全て帳面に記している。',
      quirk: '帳面は嘘をつかんのじゃ', trust: true
    },
    ponta: {
      name: 'ポン太', breed: 'フォーンパグ（子犬）', role: 'ブサワン新聞の記者見習い',
      profile: '首から下げたカメラがトレードマーク。スクープを夢見るが、時刻は広場の時計台で確かめる派。',
      quirk: 'スクープですワン！', trust: true
    },
    unknown: { name: '？？？', breed: '', role: '', profile: '', quirk: '', trust: false }
  };
  // 一覧表示順
  D.characterOrder = ['buhita', 'bosston', 'gonzalez', 'madame', 'chef', 'mayor', 'pekibaa', 'ponta'];
})(typeof window !== 'undefined' ? window : globalThis);
