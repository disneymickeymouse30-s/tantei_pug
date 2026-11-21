/* 証言・秘密・未解決の謎・時系列・推理の組み合わせ */
(function (G) {
  var D = G.GAME_DATA = G.GAME_DATA || {};

  /* ---- 証言 ---- */
  D.testimonies = {
    t_bt_thunder: { who: 'bosston', time: '8:09〜8:12', text: '映像の欠落は落雷による瞬間的な障害だ。論理的に考えたまえ。' },
    t_gz_plaza: { who: 'gonzalez', time: '朝', text: 'オレは朝からずっと広場にいた！　8時ちょうどにポン太が見てるはずだ！' },
    t_gz_sock: { who: 'gonzalez', time: '—', text: '靴下？　知らねえ！　オレの靴下はちゃんと……あれ、片方ねえ！' },
    t_chef_stock: { who: 'chef', time: '—', text: 'ちゅ〜るの在庫はぴったり合ってるブヒ。料理長の誇りにかけて。' },
    t_chef_nobody: { who: 'chef', time: '8:00〜8:20', text: '今朝は誰も厨房を通らなかったブヒ。ずっと鍋の前にいたから確かブヒ。' },
    t_chef_nobox: { who: 'chef', time: '8:40', text: '箱？　今朝は何も届いてないブヒ。リフトなんて触ってないブヒ。' },
    t_madame_shadow: { who: 'madame', time: '8:15', text: '8時15分、保管室の扉の前で怪しい影を見ましたの。大きな、丸い影でしたわ。' },
    t_mayor_nokey: { who: 'mayor', time: '朝', text: 'ワシは今朝、保管室の鍵など借りておらん！　ワシは何も聞いておらん！' },
    t_ponta_8: { who: 'ponta', time: '8:00', text: '時計台がちょうど8時を指したとき、ゴンザレスさんが広場を全速力で走っていきましたワン！' },
    t_buhita_noorder: { who: 'buhita', time: '—', text: '指示？　そんなもの受けてないブヒ！　地下の箱7が怪しいのは……刑事の勘ブヒ！' },
    t_pekibaa_rule: { who: 'pekibaa', time: '—', text: '保管室の鍵は一本きり。誰に貸しても、分刻みで帳面に書くんじゃ。' }
  };

  /* ---- 秘密 ---- */
  D.secrets = {
    s_bt_manual: { who: 'bosston', text: 'ボス・トンは町長に頼まれ、8:09〜8:12に保管室カメラ1を手動で止めた。見返りは来年度の町のIT契約。' },
    s_bt_password: { who: 'bosston', text: 'ボス・トンは廊下カメラ2のパスワードを忘れていて、そちらは止められなかった。' },
    s_gz_measure: { who: 'gonzalez', text: 'ゴンザレスは町長に運搬を頼まれ、7:40に保管室でケースを採寸していた。靴下はその時に落とした。' },
    s_gz_dark: { who: 'gonzalez', text: 'ゴンザレスは地下でケースを受け取った直後に停電で真っ暗になり、怖くて扉を壊して逃げ出した。' },
    s_chef_taste: { who: 'chef', text: 'シェフ・ブヒーノは三日前から毎日ちゅ〜るを「味見」していた。在庫が合わないのはそのせい。' },
    s_chef_saw_mayor: { who: 'chef', text: 'シェフは8:06、だし汁の中を町長が保管室の方へ歩いていくのを見ていた（味見中だったので黙っていた）。' },
    s_chef_hide: { who: 'chef', text: 'シェフは8:45、届いた箱1の中から黄金のケースを見つけ、疑われるのが怖くて冷蔵庫に隠した。' },
    s_madame_script: { who: 'madame', text: 'マダムの「8:15の怪しい影」は台本どおりの偽証だった。' },
    s_mayor_key: { who: 'mayor', text: '町長は8:05〜8:13、保管室の鍵を借りていた。' },
    s_mayor_stunt: { who: 'mayor', text: '黄金のちゅ〜る消失は、町長による宣伝のための自作自演だった。' },
    s_buhita_order: { who: 'buhita', text: 'ブヒ田刑事は前日、町長から「名探偵を10時に地下の箱7へ導け」と指示されていた。' }
  };

  /* ---- 未解決の謎 ---- */
  D.mysteries = [
    { id: 'm_room', q: '保管室はなぜ密室だったのか？', solved: { deduced: 'd_lift' }, a: '扉はオートロック。ケースは扉ではなく配膳リフトで運び出された。' },
    { id: 'm_foot', q: '濡れた足跡はどこから来たのか？', solved: { deduced: 'd_inside' }, a: '雨ではなく厨房のだし汁。侵入者は館の中から来た。' },
    { id: 'm_cam', q: '監視映像はなぜ3分間だけ消えたのか？', solved: { deduced: 'd_camera' }, a: '落雷ではなく手動停止。' },
    { id: 'm_drool', q: '扉のよだれは誰のものか？', solved: { deduced: 'd_mayor' }, a: '金粉入りのよだれ＝町長。' },
    { id: 'm_stock', q: 'ちゅ〜るの在庫はなぜ事件前から合わないのか？', solved: { deduced: 'd_tasting' }, a: 'シェフの味見。' },
    { id: 'm_clock', q: '目撃証言の時刻はなぜ食い違うのか？', solved: { deduced: 'd_clock' }, a: '時計台は8:00で止まっていた。' },
    { id: 'm_door', q: '地下倉庫の扉はなぜ壊れていたのか？', solved: { deduced: 'd_escape' }, a: '押し入ったのではなく、逃げ出した跡。', cond: { chapter: { min: 3 } } },
    { id: 'm_where', q: '黄金のちゅ〜るは今どこにあるのか？', solved: { deduced: 'd_kitchen' }, a: '箱1ごと厨房へ。そして……。' },
    { id: 'm_box', q: 'なぜ箱7は空っぽなのか？', solved: { deduced: 'd_mixup' }, a: '暗闇で箱1と取り違えられた。', cond: { chapter: { min: 4 } } },
    { id: 'm_why', q: 'そもそも、誰が何のために？', solved: { deduced: 'd_stunt' }, a: '町長の宣伝のための自作自演。' }
  ];

  /* ---- 時系列（判明したものだけ表示） ---- */
  D.timeline = [
    { time: '7:30', text: '雨が上がる', cond: { any: [{ has: 'ev_photo' }, { deduced: 'd_inside' }] } },
    { time: '7:35', text: 'ゴンザレス、町長代理として鍵を借りる', cond: { has: 'ev_key_log' } },
    { time: '7:40', text: 'ゴンザレス、保管室でケースを採寸（靴下を落とす）', cond: { any: [{ has: 'ev_measure_memo' }, { secret: 's_gz_measure' }] } },
    { time: '7:45', text: 'ゴンザレス、鍵を返却', cond: { has: 'ev_key_log' } },
    { time: '8:00', text: '広場の時計台が止まる', cond: { deduced: 'd_clock' } },
    { time: '8:00', text: '厨房でだし鍋がひっくり返る', cond: { any: [{ has: 'ev_dashi' }, { secret: 's_chef_saw_mayor' }] } },
    { time: '8:05', text: '町長、鍵を借りる', cond: { has: 'ev_key_log' } },
    { time: '8:06', text: '大柄な光る犬が厨房裏通路を通る', cond: { any: [{ has: 'ev_fragment' }, { secret: 's_chef_saw_mayor' }] } },
    { time: '8:09', text: '保管室カメラ1が止まる', cond: { has: 'ev_camera_gap' } },
    { time: '8:09', text: 'カメラ停止は管理室からの手動操作', cond: { deduced: 'd_camera' } },
    { time: '8:11', text: '配膳リフトが保管室から地下へ', cond: { any: [{ has: 'ev_lift_schedule' }, { deduced: 'd_lift' }] } },
    { time: '8:12', text: 'カメラ1再開。以降8:28まで誰も映らない', cond: { has: 'ev_camera_gap' } },
    { time: '8:13', text: '町長、鍵を返却', cond: { has: 'ev_key_log' } },
    { time: '8:13', text: '地下で停電。ケースは箱1へ（取り違え）', cond: { deduced: 'd_mixup' } },
    { time: '8:14', text: '地下倉庫の扉が内側から壊される', cond: { deduced: 'd_escape' } },
    { time: '8:15', text: '（マダムの証言）保管室前に怪しい影', cond: { all: [{ testimony: 't_madame_shadow' }, { noflag: 'madame_broken' }] } },
    { time: '8:15', text: '（マダムの証言は偽証と判明）', cond: { flag: 'madame_broken' } },
    { time: '8:16', text: 'ゴンザレス、広場を全力疾走（ポン太が撮影）', cond: { has: 'ev_photo' } },
    { time: '8:28', text: 'ペキ婆、点検で保管室を開ける', cond: { any: [{ has: 'ev_key_log' }, { has: 'ev_camera_gap' }] } },
    { time: '8:30', text: '黄金のちゅ〜る消失発覚', cond: true },
    { time: '8:40', text: '箱1が配膳リフトで地下から厨房へ', cond: { any: [{ has: 'ev_lift_schedule' }, { has: 'ev_waybill' }] } },
    { time: '8:45', text: '在庫帳に新しい修正（箱1の受領を消す）', cond: { deduced: 'd_kitchen' } },
    { time: '9:20', text: '名探偵・佐吉、到着', cond: true }
  ];

  /* ---- 推理の組み合わせ ---- */
  D.deductions = [
    {
      id: 'd_inside', title: '侵入者は館の中から来た',
      pairs: [['ev_footprints', 'ev_dashi'], ['ev_footprints', 'ev_fragment'], ['ev_footprints', 'ev_photo']],
      lines: [
        'sakichi:think|足跡は濡れていた。でも……雨は7時半に上がっているバウ。',
        'sakichi:think|それにこの匂い。くんくん……かつおだし！',
        { fx: 'flash' }, { se: 'success' },
        'sakichi:shout|わかったバウ！　足跡の主は雨の外から来たんじゃない。厨房の裏通路を通って来たんだバウ！'
      ]
    },
    {
      id: 'd_clock', title: '時計台は8:00で止まっていた',
      pairs: [['ev_clock', 'ev_photo']],
      lines: [
        'sakichi:think|写真の時計台は8:00。でもカメラの記録は8:16……。',
        { fx: 'flash' }, { se: 'success' },
        'sakichi:shout|時計台は止まっていたバウ！　ゴンザレスが広場を走ったのは8時じゃない、8時16分だバウ！',
        'sakichi:think|つまり8時9分から12分のゴンザレスのアリバイは……消えたバウ。'
      ]
    },
    {
      id: 'd_camera', title: '映像の欠落は手動停止',
      pairs: [['ev_camera_gap', 'ev_video_log'], ['ev_camera_gap', 'ev_photo']],
      lines: [
        'sakichi:think|ボス・トンは「落雷」と言った。でも今朝の空は雲一つない青空バウ。',
        { fx: 'flash' }, { se: 'success' },
        'sakichi:shout|映像は事故で消えたんじゃない。誰かがわざと3分間だけ止めたんだバウ！'
      ]
    },
    {
      id: 'd_mayor', title: '8:09に保管室へ入ったのは町長',
      pairs: [['ev_drool', 'ev_gold_powder'], ['ev_drool', 'ev_key_log'], ['ev_fragment', 'ev_key_log']],
      lines: [
        'sakichi:think|扉のよだれはキラキラしていた。そして犯行の時間に鍵を持てた犬は……。',
        { fx: 'flash' }, { se: 'success' },
        'sakichi:shout|ブルドッグ特有のたっぷりよだれ、顔中の金粉、そして鍵。保管室に入ったのはブサワン町長だバウ！'
      ],
      effects: [{ secret: 's_mayor_key' }]
    },
    {
      id: 'd_lift', title: 'ケースは配膳リフトで地下へ',
      pairs: [['ev_lift', 'ev_lift_schedule'], ['ev_lift', 'ev_waybill']],
      lines: [
        'sakichi:think|扉はオートロック。出入りした犬は手ぶらで出ていける。じゃあケースは……？',
        { fx: 'flash' }, { se: 'success' },
        'sakichi:shout|配膳リフトだバウ！　ケースは扉じゃなく、料理用の昇降機で地下へ下りたんだバウ。密室の正体はこれだバウ！'
      ]
    },
    {
      id: 'd_tasting', title: '在庫の不一致は「味見」',
      pairs: [['ev_inventory', 'ev_taste_memo']],
      lines: [
        'sakichi:think|三日前から合わない在庫と、三日分の「ボーノ」……。',
        { se: 'success' },
        'sakichi:smug|在庫が減ったのは盗まれたからじゃない。シェフの胃袋に消えていたんだバウ。……ちょっとうらやましいバウ。'
      ],
      effects: [{ secret: 's_chef_taste' }]
    },
    {
      id: 'd_mixup', title: '箱7のはずが箱1へ（取り違え）',
      pairs: [['ev_waybill', 'ev_box_numbers'], ['ev_waybill', 'ev_measure_memo']],
      lines: [
        'sakichi:think|箱7はケースの形にくり抜かれているのに空っぽ。伝票では箱1が8:40に厨房へ……。',
        'sakichi:think|浮き彫りの「1」と「7」。暗闇で手探りしたら……。',
        { fx: 'flash' }, { se: 'success' },
        'sakichi:shout|ケースは箱7に入るはずだった。でも暗闇で箱1に入れられてしまったんだバウ！'
      ]
    },
    {
      id: 'd_kitchen', title: '黄金のちゅ〜るは厨房にある',
      pairs: [['ev_waybill', 'ev_inventory']],
      lines: [
        'sakichi:think|箱1は8:40に厨房へ届いている。なのに受領欄は消され、在庫帳には8:45の新しい修正……。',
        { fx: 'flash' }, { se: 'success' },
        'sakichi:shout|届いた箱を、誰かが「届かなかった」ことにした！　黄金のちゅ〜るは今、厨房にあるバウ！',
        'sakichi:drool|……厨房。ちゅ〜る。冷蔵庫。…………はっ、いかんいかんバウ。'
      ]
    },
    {
      id: 'd_stunt', title: '消失は宣伝のための自作自演',
      pairs: [['ev_plan', 'ev_gold_powder'], ['ev_buhita_order', 'ev_box_numbers'], ['ev_pact', 'ev_camera_gap']],
      lines: [
        'sakichi:think|事件の前から「消失」の看板があり、「箱7で発見」の段取りがあり、カメラが止まる時刻まで決まっていた……。',
        { fx: 'objection' }, { se: 'objection' },
        'sakichi:shout|これは盗難じゃない。最初から仕組まれた「消失ショー」だバウ！'
      ],
      effects: [{ secret: 's_mayor_stunt' }]
    },
    {
      id: 'd_escape', title: '地下の扉は逃げ出すために壊された',
      pairs: [['ev_broken_door', 'ev_photo'], ['ev_broken_door', 'ev_measure_memo']],
      lines: [
        'sakichi:think|破片は扉の外側。8:16に全力疾走していたゴンザレス……。',
        { se: 'success' },
        'sakichi:shout|扉は押し入るために壊されたんじゃない。中から逃げ出すために壊されたんだバウ！'
      ],
      effects: [{ secret: 's_gz_dark' }]
    }
  ];

  /* 組み合わせ失敗時の佐吉の考え直し */
  D.combineMiss = [
    ['sakichi:think|うーん……この二つ、つながりそうでつながらないバウ。', 'sakichi:sweat|頭の中で毛玉がからまったバウ……。'],
    ['sakichi:think|ひらめいた！……と思ったけど、ただのお腹の音だったバウ。'],
    ['sakichi:sweat|ブヒ田刑事みたいな推理になってきたバウ。一回落ち着くバウ。'],
    ['sakichi:think|証拠同士が「はじめまして」って顔をしてるバウ。別の組み合わせを考えるバウ。'],
    ['sakichi:drool|ちゅ〜る……いや、推理に集中するバウ。この組み合わせは違うバウ。']
  ];
})(typeof window !== 'undefined' ? window : globalThis);
