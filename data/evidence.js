/* 証拠定義
 * id / name / desc（取得時） / truth（推理成立後に追記される本当の意味）/ found（発見場所）
 * how（発見条件）/ people（関連人物）/ testimonies（関連証言）/ related（関連証拠）
 * unlocks（解放される会話）/ endings（エンディングへの影響）/ icon
 */
(function (G) {
  var D = G.GAME_DATA = G.GAME_DATA || {};
  D.evidence = {
    ev_footprints: {
      name: '濡れた足跡', icon: '🐾', found: '保管室・床',
      desc: '保管室の床に点々と続く濡れた足跡。幅が広く大きい。雨の中から誰かが入ってきたように見える……が、ほんのり良い匂いがする。',
      truth: '雨は7:30に上がっている。匂いの正体は厨房のだし汁。犯犬は外ではなく厨房裏通路から来た大柄な犬。',
      how: '第1章：保管室の「床」を調べる', people: ['mayor', 'chef'], testimonies: ['t_chef_nobody'],
      related: ['ev_dashi', 'ev_fragment', 'ev_photo'], unlocks: ['シェフに「誰も通らなかった」の矛盾を指摘'], endings: ['end6']
    },
    ev_drool: {
      name: 'よだれの跡', icon: '💧', found: '保管室・扉の取っ手',
      desc: '扉の取っ手にべっとり付いたよだれ。乾きかけているが、光に当てるとキラキラした細かい粒が混じっている。',
      truth: '粒は宣伝看板の金粉塗料。よだれの主は今朝、金粉を扱っていた犬。',
      how: '第1章：保管室の「扉」を調べる', people: ['mayor'], testimonies: ['t_mayor_nokey'],
      related: ['ev_gold_powder', 'ev_key_log'], unlocks: ['町長に追及'], endings: ['end6', 'end1']
    },
    ev_sock: {
      name: '片方だけの靴下', icon: '🧦', found: '展示台の裏',
      desc: '真っ赤な大きい靴下が片方。タグに「GONZ」と刺繍。乾いていて、上にうっすら埃が積もっている。',
      truth: '乾いていて埃の下＝雨が上がった直後、事件より前に落ちたもの。持ち主＝犯犬ではない。',
      how: '第1章：展示台の「台の裏」を調べる', people: ['gonzalez'], testimonies: ['t_gz_sock'],
      related: ['ev_measure_memo', 'ev_scratch', 'ev_key_log'], unlocks: ['ゴンザレスに提示', 'Cルートで中から巻尺メモ'], endings: ['end3']
    },
    ev_scratch: {
      name: '展示台の傷', icon: '🪵', found: '展示台・台座の縁',
      desc: '展示台の木の縁に、爪で引っかいたような四本の傷。こじ開けた跡にも見えるが、ガラス台座そのものは無傷。',
      truth: 'こじ開けではなく、重い体で踏ん張った爪の跡。誰かがケースのそばで何かを「測って」いた。',
      how: '第1章：展示台の「台座」を調べる', people: ['gonzalez'], testimonies: [],
      related: ['ev_sock', 'ev_measure_memo'], unlocks: [], endings: ['end3']
    },
    ev_camera_gap: {
      name: '監視映像の欠落', icon: '📹', found: '監視室',
      desc: '保管室カメラ1の映像が 8:09〜8:12 だけ真っ黒。8:12以降は正常で、8:28に点検のペキ婆が入るまで扉の前には誰も映っていない。',
      truth: '欠落は手動停止。8:12以降に誰も映っていない以上、「8:15の怪しい影」はあり得ない。',
      how: '第1章：監視室の「モニター」を調べる', people: ['bosston', 'madame'], testimonies: ['t_bt_thunder', 't_madame_shadow'],
      related: ['ev_video_log', 'ev_photo', 'ev_pact'], unlocks: ['マダムの「8:15の影」の矛盾を指摘'], endings: ['end1', 'end4', 'end6']
    },
    ev_lift: {
      name: '配膳リフトの表示', icon: '🛗', found: '保管室・壁の配膳リフト',
      desc: '料理を運ぶ小さな昇降機。厨房・保管室・地下倉庫の三か所をつなぐ。表示ランプは「最終停止：地下」。',
      truth: 'ケースは扉ではなく、このリフトで下へ運ばれた。',
      how: '第1章：保管室の「配膳リフト」を調べる', people: ['chef', 'mayor', 'gonzalez'], testimonies: [],
      related: ['ev_lift_schedule', 'ev_waybill'], unlocks: [], endings: ['end6', 'end2', 'end3']
    },
    ev_clock: {
      name: '止まった時計', icon: '🕗', found: '祭りの広場・時計台',
      desc: '広場の時計台。針は 8:00 を指している。……さっきから一度も動いていないような？',
      truth: '雨水が入り 8:00 で止まっていた。時計台を見て言った「時刻」の証言は全部ずれている。',
      how: '第1章：広場の「時計台」を調べる', people: ['ponta', 'gonzalez'], testimonies: ['t_ponta_8', 't_gz_plaza'],
      related: ['ev_photo'], unlocks: ['ポン太に提示'], endings: ['end3', 'end6']
    },
    ev_inventory: {
      name: '訂正された在庫記録', icon: '📒', found: '厨房',
      desc: 'ちゅ〜るの在庫帳。数字が何度も二重線で直されている。事件の三日前から数が合っていない。さらに今朝 8:45 付けの新しい修正跡がある。',
      truth: '事件前の不一致は「味見」。8:45の修正は、届いた箱1の受領を消すためのもの。',
      how: '第2章：厨房の「在庫帳」を調べる', people: ['chef'], testimonies: ['t_chef_stock'],
      related: ['ev_taste_memo', 'ev_waybill'], unlocks: ['シェフに矛盾を指摘'], endings: ['end2', 'end6']
    },
    ev_taste_memo: {
      name: '厨房の試食メモ', icon: '📝', found: '厨房・ゴミ箱',
      desc: '丸められたメモ。「味見①ボーノ ②ボーノ ③もう一本だけ ④……」と、三日分びっしり。',
      truth: '在庫の不一致の正体。シェフは盗難とは別に、毎日ちゅ〜るを「味見」していた。',
      how: '第2章：厨房の「ゴミ箱」を調べる（在庫帳を見た後）', people: ['chef'], testimonies: ['t_chef_stock'],
      related: ['ev_inventory'], unlocks: [], endings: ['end2', 'end6']
    },
    ev_key_log: {
      name: '鍵の貸出記録', icon: '🔑', found: '鍵番小屋',
      desc: 'ペキ婆の帳面。「7:35 ゴンザレス（町長代理）→7:45返却」「8:05 町長（最終確認）→8:13返却」「8:28 ペキ婆 点検」。',
      truth: '犯行時刻 8:09〜8:12 に鍵を持っていたのは町長だけ。',
      how: '第2章：ペキ婆の信頼を得る、またはブヒ田刑事の警察手帳で閲覧', people: ['pekibaa', 'mayor', 'gonzalez'], testimonies: ['t_mayor_nokey'],
      related: ['ev_drool', 'ev_fragment', 'ev_sock'], unlocks: ['町長に矛盾を指摘'], endings: ['end6', 'end1']
    },
    ev_photo: {
      name: 'ポン太の写真', icon: '📷', found: '祭りの広場（ポン太）',
      desc: '全力疾走するゴンザレスの写真。背景の時計台は「8:00」。カメラの撮影記録は「8:16」。空は雲一つない晴天。',
      truth: '時計は止まっていた。ゴンザレスが走ったのは8:16。そして雷など鳴りそうにない空。',
      how: '第2章：ポン太に「止まった時計」を見せる', people: ['ponta', 'gonzalez', 'bosston'], testimonies: ['t_ponta_8', 't_gz_plaza', 't_bt_thunder'],
      related: ['ev_clock', 'ev_camera_gap', 'ev_broken_door'], unlocks: ['ゴンザレス・ボス・トンに矛盾を指摘'], endings: ['end3', 'end1', 'end6']
    },
    ev_gold_powder: {
      name: '金色の粉', icon: '✨', found: '町長の執務室',
      desc: '執務室の床に散らばるキラキラの粉。ケースの塗装が剥げたもの？　それとも祭りの飾り付けの材料？',
      truth: 'ケースは金メッキで粉は出ない。粉は看板用の金粉塗料。執務室の奥には事件前に作られた「黄金のちゅ〜る消失！？」の看板が。',
      how: '第2章：執務室の「床」を調べる', people: ['mayor'], testimonies: ['t_mayor_nokey'],
      related: ['ev_drool', 'ev_plan'], unlocks: [], endings: ['end6', 'end4']
    },
    ev_video_log: {
      name: '監視システム停止ログ', icon: '🖥️', found: '監視室・管理端末',
      desc: '「8:09:00 カメラ1 手動停止（管理室端末／BT-admin）」「8:12:00 再開」。障害記録ではない。',
      truth: 'カメラは誰かが意図して止めた。管理者権限を持つのはボス・トンだけ。',
      how: '第3章Aルート：管理端末を調べる', people: ['bosston'], testimonies: ['t_bt_thunder'],
      related: ['ev_camera_gap', 'ev_fragment'], unlocks: ['ボス・トンに矛盾を指摘'], endings: ['end1', 'end6']
    },
    ev_fragment: {
      name: '廊下カメラ2の断片映像', icon: '🎞️', found: '監視室・予備サーバー',
      desc: '厨房裏通路のカメラ2が捉えた 8:06 の数秒間。濡れた床を歩く大柄なブルドッグ系の後ろ姿。全身が妙に金色に光っている。',
      truth: 'カメラ2はボス・トンがパスワードを忘れて止められなかった。光る大柄な姿＝顔中金粉の町長。',
      how: '第3章Aルート：予備サーバーのパスワードを突破、または第4章でボス・トンを信頼', people: ['bosston', 'mayor', 'gonzalez'], testimonies: [],
      related: ['ev_footprints', 'ev_key_log'], unlocks: [], endings: ['end1', 'end6']
    },
    ev_lift_schedule: {
      name: '配膳リフト運行表', icon: '📋', found: '厨房・搬入口',
      desc: '昇降機の自動記録。「8:11 保管室→地下」「8:40 地下→厨房（箱1・手回し）」。',
      truth: 'ケースは8:11に地下へ。8:40に地下から厨房へ上がったのは箱1。',
      how: '第3章Bルート：搬入口の記録盤を調べる、または第4章でシェフを信頼', people: ['chef'], testimonies: ['t_chef_nobox'],
      related: ['ev_lift', 'ev_waybill'], unlocks: ['シェフに矛盾を指摘'], endings: ['end2', 'end6']
    },
    ev_dashi: {
      name: 'だし汁の水たまり', icon: '🍲', found: '厨房裏通路',
      desc: '厨房裏通路の床一面にかつおだしの水たまり。8:00に鍋をひっくり返したらしい。大きな足跡が保管室の方へ続いている。',
      truth: '保管室の濡れた足跡の正体。8:00以降に厨房裏通路を通った大柄な犬がいる。',
      how: '第3章Bルート：厨房裏通路を調べる', people: ['chef', 'mayor'], testimonies: ['t_chef_nobody'],
      related: ['ev_footprints'], unlocks: [], endings: ['end2', 'end6']
    },
    ev_measure_memo: {
      name: '巻尺メモ', icon: '📏', found: '靴下の中',
      desc: '赤い靴下の中に入っていた紙切れ。「ケース 30×12cm → 箱7にぴったり。7:40 ゴンザレス」。',
      truth: 'ゴンザレスは事件前に運搬のための採寸をしていた。行き先は本来「箱7」。',
      how: '第3章Cルート：靴下を詳しく調べる', people: ['gonzalez'], testimonies: ['t_gz_sock'],
      related: ['ev_sock', 'ev_scratch', 'ev_waybill'], unlocks: ['ゴンザレスに矛盾を指摘'], endings: ['end3', 'end6']
    },
    ev_broken_door: {
      name: '壊れた地下倉庫の扉', icon: '🚪', found: '地下倉庫入口',
      desc: '地下倉庫の扉が蝶番ごと外れている。とてつもない力。破片はなぜか扉の「外側」に散らばっている。',
      truth: '内側から外へ向かって壊された＝押し入ったのではなく、逃げ出した跡。',
      how: '第3章Cルート：地下倉庫入口を調べる', people: ['gonzalez'], testimonies: ['t_gz_plaza'],
      related: ['ev_photo', 'ev_measure_memo'], unlocks: [], endings: ['end3']
    },
    ev_plan: {
      name: '町長の宣伝計画書', icon: '📜', found: '町長の執務室・金庫',
      desc: '「極秘：世界ちゅ〜る祭り話題沸騰作戦」。黄金のちゅ〜るを「消失」させ、10時に名探偵が地下の箱7で発見、ブサワンTVで生中継――。',
      truth: '消失は最初から町長の宣伝のための自作自演。ただし計画は途中で狂った。',
      how: '第3章Dルート：執務室の金庫を開ける', people: ['mayor', 'madame', 'buhita'], testimonies: ['t_mayor_nokey'],
      related: ['ev_gold_powder', 'ev_pact', 'ev_buhita_order'], unlocks: ['町長に追及'], endings: ['end6', 'end4']
    },
    ev_pact: {
      name: '秘密協定書', icon: '🤝', found: 'マダムのVIPテント',
      desc: '町長とマダム・サキの署名入り。「出資と引き換えにブサワンTVが独占中継」「目撃者役：マダム。8:15、保管室前に怪しい影」。',
      truth: 'マダムの目撃証言は台本だった。彼女は町のために自作自演に協力していた。',
      how: '第3章Dルート：マダムを説得、または第4章でマダムを信頼', people: ['madame', 'mayor'], testimonies: ['t_madame_shadow'],
      related: ['ev_camera_gap', 'ev_plan'], unlocks: ['マダムに追及'], endings: ['end4', 'end6']
    },
    ev_waybill: {
      name: '輸送伝票', icon: '🧾', found: '地下倉庫',
      desc: '「箱1：予備ちゅ〜る30本 地下→厨房 8:40」受領欄が修正液で消されている。「箱7：町長私物（触るな）」。',
      truth: '箱1は8:40に厨房へ届いた。受領を消した者がいる。',
      how: '第4章：地下倉庫の「伝票差し」を調べる', people: ['chef', 'gonzalez', 'mayor'], testimonies: ['t_chef_nobox'],
      related: ['ev_box_numbers', 'ev_inventory', 'ev_lift'], unlocks: ['シェフに矛盾を指摘'], endings: ['end6', 'end2', 'end3']
    },
    ev_box_numbers: {
      name: '輸送箱の番号', icon: '📦', found: '地下倉庫',
      desc: '箱の番号は浮き彫り。箱7は空っぽで、中の内張りが黄金ケースの形にくり抜かれている。箱1があった場所は空き。暗闇で触れば「1」と「7」は区別しにくい。',
      truth: 'ケースは最初から箱7に隠される予定だった。暗闇で箱1と取り違えられた。',
      how: '第4章：地下倉庫の「箱の棚」を調べる', people: ['gonzalez', 'mayor', 'buhita'], testimonies: ['t_buhita_noorder'],
      related: ['ev_waybill', 'ev_measure_memo', 'ev_buhita_order'], unlocks: ['ブヒ田に矛盾を指摘'], endings: ['end6', 'end3']
    },
    ev_buhita_order: {
      name: '町長の秘密指示メモ', icon: '✉️', found: 'ブヒ田刑事の手帳',
      desc: '「明日10時、名探偵を地下倉庫の箱7へ導くべし。テレビ中継を用意しておく――町長」。前日付。',
      truth: '事件の前日から、ケースが「箱7で見つかる」ことになっていた。',
      how: '第4章：ブヒ田刑事を信頼する', people: ['buhita', 'mayor'], testimonies: ['t_buhita_noorder'],
      related: ['ev_box_numbers', 'ev_plan'], unlocks: [], endings: ['end6']
    },
    ev_chef_note: {
      name: 'ブヒーノの告白メモ', icon: '🍳', found: '佐吉のポケット',
      desc: '油の染みたメモ。「探偵さんだけに。箱1を開けたら金ピカのケースが……怖くて冷蔵庫の『味見用』の段に入れたブヒ」。',
      truth: '黄金のちゅ〜るは今、厨房の冷蔵庫にある。',
      how: '第4章：輸送伝票の件を「伏せる」', people: ['chef'], testimonies: ['t_chef_nobox'],
      related: ['ev_waybill', 'ev_inventory'], unlocks: [], endings: ['end2', 'end6']
    }
  };
  D.evidenceOrder = Object.keys(D.evidence);
})(typeof window !== 'undefined' ? window : globalThis);
