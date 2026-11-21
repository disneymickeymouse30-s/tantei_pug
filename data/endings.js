/* 最終推理の選択肢・エンディング条件・エンディング本文
 * 判定は core.evaluateEnding：end6 → end1〜4 の順に match と requires を全て満たすか確認し、
 * どれにも当てはまらなければ end5（迷探偵）。requires の hint は END5 の「見落とし」に表示される。
 */
(function (G) {
  var D = G.GAME_DATA = G.GAME_DATA || {};
  var S = D.scenes = D.scenes || {};

  D.finalOptions = {
    suspects: [
      { id: 'multi', label: '町長を中心に、複数の犬がそれぞれ別の目的で関わった' },
      { id: 'mayor', label: 'ブサワン町長の単独犯' },
      { id: 'bosston', label: 'ボス・トン' },
      { id: 'chef', label: 'シェフ・ブヒーノ' },
      { id: 'gonzalez', label: 'ゴンザレス' },
      { id: 'madame_mayor', label: 'マダム・サキと町長' },
      { id: 'buhita', label: 'ブヒ田刑事' },
      { id: 'pekibaa', label: 'ペキ婆' },
      { id: 'ponta', label: 'ポン太' },
      { id: 'outsider', label: '雨にまぎれて侵入した外部の犬' }
    ],
    motives: [
      { id: 'publicity', label: '祭りを話題にするための自作自演' },
      { id: 'it_contract', label: '町のIT契約と引き換えに頼まれた' },
      { id: 'hide_tasting', label: '味見の発覚を恐れて隠した' },
      { id: 'carry_job', label: '運搬を頼まれ、失敗を隠した' },
      { id: 'greed', label: 'ちゅ〜るを独り占めしたかった' },
      { id: 'revenge', label: '町長への恨み' }
    ],
    tricks: [
      { id: 'lift_mixup', label: '配膳リフトで地下へ送り、暗闇で箱を取り違えた' },
      { id: 'camera_stop', label: '監視カメラを止めた3分間に持ち出した' },
      { id: 'hide_box', label: '届いた箱から抜き取り、冷蔵庫に隠した' },
      { id: 'fake_witness', label: '偽の目撃証言で犯行時刻を誤認させた' },
      { id: 'break_in', label: '怪力で扉を破って押し入った' },
      { id: 'rain_entry', label: '雨にまぎれて外から忍び込んだ' }
    ]
  };

  var dd = function (id, hint) { return { cond: { deduced: id }, hint: hint }; };
  var hv = function (id, hint) { return { cond: { has: id }, hint: hint }; };

  D.endings = {
    end6: {
      id: 'end6', no: 6, title: '真相解明！伝説の名探偵', scene: 'end6_s', kind: 'true',
      match: { suspect: 'multi', motive: 'publicity', trick: 'lift_mixup', evidence: ['ev_waybill', 'ev_plan', 'ev_buhita_order'] },
      requires: [
        dd('d_mayor', '保管室に入った犬を特定する推理（よだれ×金色の粉／よだれ×鍵の記録 など）が足りない。'),
        dd('d_camera', '映像の欠落が「落雷」ではないと示す推理（映像欠落×写真／停止ログ）が足りない。'),
        dd('d_lift', '密室からケースが消えた方法（リフト表示×輸送伝票／運行表）の推理が足りない。'),
        dd('d_mixup', '箱7が空だった理由（輸送伝票×輸送箱の番号）の推理が足りない。'),
        dd('d_kitchen', 'ケースの現在地（輸送伝票×在庫記録）の推理が足りない。'),
        dd('d_stunt', '「消失」の目的を示す推理（計画書×金色の粉／秘密指示メモ×箱の番号／協定書×映像欠落）が足りない。第4章で誰を信頼するかが鍵。')
      ]
    },
    end1: {
      id: 'end1', no: 1, title: 'デジタル犬の陰謀', scene: 'end1_s', kind: 'route',
      match: { suspect: 'bosston', motive: 'it_contract', trick: 'camera_stop', evidence: ['ev_video_log', 'ev_fragment'] },
      requires: [
        hv('ev_video_log', '監視システムの停止ログを見つけていない（第3章【映像】ルート）。'),
        hv('ev_fragment', '廊下カメラ2の断片映像を見つけていない。'),
        dd('d_camera', '映像欠落が手動停止だという推理が成立していない。'),
        dd('d_mayor', 'カメラ停止の依頼主（保管室に入った犬）を突き止める推理が足りない。')
      ]
    },
    end2: {
      id: 'end2', no: 2, title: '厨房のちゅ〜る王', scene: 'end2_s', kind: 'route',
      match: { suspect: 'chef', motive: 'hide_tasting', trick: 'hide_box', evidence: ['ev_waybill', 'ev_lift_schedule', 'ev_chef_note'] },
      requires: [
        hv('ev_lift_schedule', '配膳リフトの運行表を見つけていない（第3章【在庫】ルート、または第4章でシェフを信頼）。'),
        dd('d_tasting', '事件前の在庫不一致の正体（在庫記録×試食メモ）を解いていない。'),
        dd('d_kitchen', 'ケースの現在地（輸送伝票×在庫記録）の推理が足りない。')
      ]
    },
    end3: {
      id: 'end3', no: 3, title: '怪力の大失敗', scene: 'end3_s', kind: 'route',
      match: { suspect: 'gonzalez', motive: 'carry_job', trick: 'lift_mixup', evidence: ['ev_broken_door', 'ev_measure_memo'] },
      requires: [
        hv('ev_broken_door', '壊れた地下倉庫の扉を調べていない（第3章【物証】ルート）。'),
        hv('ev_measure_memo', '靴下の中の巻尺メモを見つけていない（第3章【物証】ルート）。'),
        dd('d_clock', '時計台が止まっていたことに気づいていない（止まった時計×写真）。'),
        dd('d_mixup', '箱の取り違えの推理が足りない。'),
        dd('d_escape', '扉が「逃げ出すために」壊されたという推理が足りない。')
      ]
    },
    end4: {
      id: 'end4', no: 4, title: 'マダムの秘密協定', scene: 'end4_s', kind: 'route',
      match: { suspect: 'madame_mayor', motive: 'publicity', trick: 'fake_witness', evidence: ['ev_pact'] },
      requires: [
        hv('ev_pact', '秘密協定書を手に入れていない（第3章【秘密】ルート、または第4章でマダムを信頼）。'),
        dd('d_stunt', '「消失」が仕組まれていたという推理が成立していない。'),
        { cond: { flag: 'madame_broken' }, hint: 'マダムの「8:15の影」の証言を、矛盾を突いて崩していない。' }
      ]
    },
    end5: { id: 'end5', no: 5, title: '迷探偵・佐吉', scene: 'end5_s', kind: 'bad', match: { suspect: null, motive: null, trick: null, evidence: [] }, requires: [] }
  };
  D.endingOrder = ['end1', 'end2', 'end3', 'end4', 'end5', 'end6'];

  /* ======================= END 6 真相 ======================= */
  S.end6_s = [
    { bgm: 'climax' }, { show: ['mayor'] },
    'sakichi:shout|この事件に「たった一匹の犯犬」はいないバウ！',
    { fx: 'shake' },
    'sakichi:normal|一匹は計画し、一匹は目をつぶり、一匹は運び、一匹は迷い、一匹は隠し、一匹は台本を読んだ。みんなが、それぞれ別の理由で、少しずつ嘘をついていたんだバウ。',
    'sakichi:normal|始まりは前日。ブサワン町長、あなたは祭りを全国の話題にするため、「黄金のちゅ〜る消失ショー」を計画したバウ。',
    'mayor:surprised|ぐっ……！',
    'sakichi:normal|今朝7時半から8時、あなたは執務室で「消失！？」の看板を金粉塗料で塗った。だから顔中キラキラ。8:05、ペキ婆から鍵を借り、8:06に厨房の裏通路を通った。こぼれたばかりのだし汁を踏んで。',
    'sakichi:normal|8:09、ボス・トンさんがあなたの依頼どおり保管室カメラを3分間だけ止めた。見返りは町のIT契約。',
    { show: ['bosston'] },
    'bosston:sad|……論理的に、否定できない。',
    { show: ['mayor'] },
    'sakichi:normal|あなたは鍵穴に手こずって取っ手によだれを垂らし、ケースを壁の配膳リフトに入れて「地下」のボタンを押した。そして手ぶらで出ていった。扉はオートロック。これが密室の正体だバウ！',
    { fx: 'flash' }, { se: 'success' },
    'sakichi:normal|地下で受け取る係は、ゴンザレスさん。7:40に採寸までして、箱7に入れる段取りだった。でも――',
    { show: ['gonzalez'] },
    'gonzalez:sad|……受け取った瞬間、電球が切れたんだ。真っ暗で、指で番号をなぞって……。',
    'sakichi:normal|浮き彫りの「1」と「7」。暗闇ではそっくりバウ。ケースは箱1に入ってしまった。ゴンザレスさんは怖くて扉を壊して逃げ、8:16に広場を走った。止まった時計台の下を。',
    'sakichi:normal|8:31、マダム・サキが台本どおり「8:15の怪しい影」を証言した。でもカメラは8:12から誰も映していない。',
    { show: ['madame'] },
    'madame:sad|……台本にない消失だと気づいたときには、もう引き返せませんでしたわ。',
    { show: ['buhita'] },
    'sakichi:normal|ブヒ田刑事は「10時に名探偵を箱7へ」と頼まれていた。善意で。だから一日中、箱7、箱7と言い続けた。',
    'buhita:sad|ブヒ……。',
    'sakichi:normal|そして8:40。予定表どおり、箱1は配膳リフトで厨房へ上がった。',
    { show: ['chef'] },
    'sakichi:normal|シェフ、あなたは箱の中に黄金のケースを見つけた。味見のことがあるから、持っていたら犯犬にされると怯えて――',
    'chef:sad|……冷蔵庫の「味見用」の段に、隠したブヒ……。',
    { se: 'objection' }, { fx: 'objection' },
    'sakichi:shout|黄金のちゅ〜るは今、厨房の冷蔵庫の中にあるバウ！！',
    { bg: 'kitchen' }, { bgm: 'ending_true' }, { show: ['chef', 'buhita'] },
    '|一同は厨房へ走った。シェフが震える手で冷蔵庫を開けると――',
    { se: 'found' },
    '|冷気の向こうで、黄金のケースがまばゆく輝いていた。',
    'buhita:happy|あったブヒーーー！！',
    'sakichi:drool|………………。',
    'buhita:normal|名探偵、よだれ。',
    'sakichi:sweat|今回だけは許してほしいバウ……。',
    { bg: 'stage' }, { show: ['mayor'] },
    'mayor:sad|……全て、そなたの言うとおりじゃ。町の財政を救いたかった。祭りを続けたかった。じゃが、嘘で町を救おうとしたワシが間違っておった。',
    'mayor:sad|皆の衆、すまなかった。ワシは……ワシは全部、聞いておった。',
    { show: ['madame'] },
    'madame:normal|中継は止めませんわ。この「本当の物語」こそ、全国に届けるべきですもの。',
    '|ブサワンTVの生中継は、町長の謝罪と、名探偵の推理と、冷蔵庫から出てきた黄金のちゅ〜るを映し出した。',
    '|視聴率は、ブサワンTV開局以来の最高記録を叩き出した。',
    { show: [] },
    '|ボス・トンは町のIT契約を辞退し、代わりに「パスワード管理講座」を無料で開いた。受講生第一号は本犬だった。',
    '|ゴンザレスは地下倉庫に新しい電球を百個つけた。今では町一番明るい倉庫だ。',
    '|シェフ・ブヒーノは味見の分のちゅ〜るを自腹で弁償し、「正直スープ」という新メニューを作った。',
    '|ブヒ田刑事は始末書を三枚書き、なぜか表彰状も一枚もらった。',
    '|そして祭りの最後、黄金のちゅ〜るの封が切られた。最初のひと口は――',
    { show: ['mayor'] },
    'mayor:happy|名探偵佐吉殿、そなたじゃ！',
    'sakichi:happy|…………！！',
    'sakichi:happy|ボーノ……じゃなくて、うまいバウーーー！！',
    { card: 'END 6', sub: '真相解明！伝説の名探偵' },
    { ending: 'end6' }
  ];

  /* ======================= END 1 デジタル犬の陰謀 ======================= */
  S.end1_s = [
    { bgm: 'climax' }, { show: ['bosston'] },
    'sakichi:shout|犯犬は――ボス・トンさん、あなただバウ！',
    'bosston:surprised|な、何を根拠に！',
    'sakichi:normal|監視システムの停止ログ。「8:09 手動停止 BT-admin」。落雷なんて嘘。今朝は雲一つない青空だったバウ。',
    'sakichi:normal|そして予備サーバーに残っていた廊下カメラ2の映像。あなたが止め損ねたカメラバウ。',
    { fx: 'flash' },
    'sakichi:shout|あなたは町のIT契約と引き換えに、ある犬のために3分間の「空白」を作った。依頼主は――8:06にカメラ2に映った、金色に光る犬。ブサワン町長だバウ！',
    { show: ['mayor', 'bosston'] },
    'mayor:surprised|ワ、ワシは何も聞いておらん！！',
    'bosston:sad|……メールは残っている。「8:09から3分、保管室カメラを止めよ。IT契約は貴社に」。差出犬は、町長だ。',
    { bgm: 'ending_route' },
    'mayor:sad|…………宣伝のためじゃった。消えたちゅ〜るを、名探偵が見つける。それを中継すれば、町は話題になると……。',
    'sakichi:normal|でもケースは、町長の計画した場所にはなかった。',
    'mayor:sad|そうじゃ……本当に、どこへ行ったのか、ワシにもわからんのじゃ……。',
    { show: ['bosston'] },
    'bosston:normal|探偵くん。私の罪は映像を止めたこと。だが、私の技術で償わせてくれ。',
    '|ボス・トンは町じゅうのカメラ映像を洗い直すと宣言し、監視室に三日三晩こもった。',
    { show: [] },
    '|祭りは「中継の不正」として大きく報じられ、町長は辞任を表明した。',
    '|黄金のちゅ〜るは、三日後、厨房の冷蔵庫で「なぜか」見つかった。見つけたシェフは、なぜか泣いていた。',
    '|地下倉庫の壊れた扉。消された伝票の受領欄。……その理由を、佐吉はまだ知らない。',
    'sakichi:think|映像は暴いた。でも、映像に映らない場所で動いていた犬たちがいた気がするバウ……。',
    { card: 'END 1', sub: 'デジタル犬の陰謀' },
    { ending: 'end1' }
  ];

  /* ======================= END 2 厨房のちゅ〜る王 ======================= */
  S.end2_s = [
    { bgm: 'climax' }, { show: ['chef'] },
    'sakichi:shout|犯犬は――シェフ・ブヒーノ、あなただバウ！',
    'chef:surprised|ブヒィィィッ！？',
    'sakichi:normal|三日前から合わない在庫。ゴミ箱の試食メモ。あなたは毎日ちゅ〜るを「味見」していたバウ。',
    'sakichi:normal|そして配膳リフトの運行表。8:40、地下から厨房へ「箱1」が上がっている。手回しハンドルを回せるのは、厨房にいた犬だけバウ。',
    { fx: 'flash' },
    'sakichi:shout|箱を開けたあなたは黄金のケースを見つけ、味見がバレるのを恐れて、受領の記録を消した。そしてケースを――',
    'chef:sad|……冷蔵庫の「味見用」の段に……隠したブヒ……。',
    { bg: 'kitchen' }, { bgm: 'ending_route' },
    { se: 'found' },
    '|冷蔵庫の扉が開かれる。冷気の中、黄金のケースが輝いていた。',
    { show: ['buhita'] },
    'buhita:happy|あったブヒ！　黄金のちゅ〜る、無事ブヒ！',
    { show: ['chef'] },
    'chef:sad|ボク、盗んでないブヒ。本当に、箱に入ってたブヒ。でも……怖くて、隠したブヒ。ごめんなさいブヒ。',
    'sakichi:normal|わかってるバウ。でも、なぜケースが箱1に入っていたのか……それはまだわからないバウ。',
    { bg: 'stage' }, { show: ['mayor'] },
    'mayor:happy|おおお！　見つかった！　見つかったぞ！　さすが名探偵！　祭りは続行じゃ！',
    'sakichi:think|（町長、ずいぶんあっさりしてるバウ……）',
    { show: [] },
    '|祭りは一時間遅れで開幕した。シェフ・ブヒーノは料理長を外され、罰として祭りの間じゅう、ちゅ〜るの「見張り番」を命じられた。',
    '|見張り番の椅子に座ったシェフの前には、山盛りのちゅ〜る。彼は一本も口にしなかった。',
    '|人々は彼を、皮肉と少しの尊敬をこめて「厨房のちゅ〜る王」と呼んだ。',
    'sakichi:think|箱をリフトで地下へ送ったのは誰か。なぜ箱1に入ったのか。……厨房の外にも、まだ扉が残っている気がするバウ。',
    { card: 'END 2', sub: '厨房のちゅ〜る王' },
    { ending: 'end2' }
  ];

  /* ======================= END 3 怪力の大失敗 ======================= */
  S.end3_s = [
    { bgm: 'climax' }, { show: ['gonzalez'] },
    'sakichi:shout|ケースを運んだのは――ゴンザレスさん、あなただバウ！',
    'gonzalez:surprised|ひっ……！',
    'sakichi:normal|靴下の中の巻尺メモ。「ケース30×12cm、箱7にぴったり」。あなたは7:40、町長に頼まれてケースを採寸していた。展示台の傷は、前足で踏ん張った跡バウ。',
    'sakichi:normal|8:11、配膳リフトで下りてきたケースを、地下で受け取ったのもあなた。',
    'sakichi:normal|でも、そのとき電球が切れた。真っ暗闇の中、浮き彫りの番号を指でなぞって……「7」と「1」を取り違えた。',
    { fx: 'flash' },
    'sakichi:shout|地下の扉の破片は外側に散っていた。あなたは押し入ったんじゃない。暗闇が怖くて、扉を壊して逃げ出したんだバウ！　そして8:16、止まった時計台の下を全力で走った！',
    'gonzalez:sad|………………全部、そのとおりだ。',
    { bgm: 'ending_route' },
    'gonzalez:sad|オレ、力だけは自慢だったのによ。暗いのが怖くて、頼まれた仕事も放り出して……情けねえ。',
    'sakichi:normal|箱1は8:40に厨房へ。ケースは厨房にあるはずバウ。',
    { bg: 'kitchen' }, { show: ['gonzalez', 'chef'] },
    '|厨房の冷蔵庫を開けると、黄金のケースがあった。シェフは「届いた箱に入っていたブヒ」と震えていた。',
    { bg: 'plaza' }, { show: ['gonzalez'] },
    '|ゴンザレスは運搬の失敗と扉の破壊を謝り、祭りの後片付けを一匹で引き受けた。',
    '|片付けの最終日、彼は地下倉庫の電球をすべて新品に替え、自分の左足に新しい赤い靴下をはいた。',
    'gonzalez:happy|探偵！　今度暗いところに行くときは、オレが先頭を歩く。……ちょっと震えるかもしれねえけどな。',
    'sakichi:happy|頼もしいバウ。',
    { show: [] },
    '|ただ一つ、ゴンザレスは最後まで「誰に頼まれたか」を言わなかった。約束だから、と。',
    'sakichi:think|運んだ犬はわかった。でも、運ばせた犬は……まだ誰も裁かれていないバウ。',
    { card: 'END 3', sub: '怪力の大失敗' },
    { ending: 'end3' }
  ];

  /* ======================= END 4 マダムの秘密協定 ======================= */
  S.end4_s = [
    { bgm: 'climax' }, { show: ['madame', 'mayor'] },
    'sakichi:shout|この事件を仕組んだのは――マダム・サキ、そして町長。あなたたち二匹だバウ！',
    'madame:surprised|まあ……。',
    'mayor:surprised|ワ、ワシは何も聞いておらん！！',
    'sakichi:normal|秘密協定書。「出資と引き換えにブサワンTVが独占中継」「目撃者役：マダム、8:15、保管室前に怪しい影」。',
    'sakichi:normal|でも保管室カメラは8:12に復旧していて、8:28まで扉の前には誰も映っていない。8:15の影は台本の中にしか存在しないバウ！',
    { fx: 'flash' },
    'sakichi:shout|偽の目撃で犯行時刻を8:15にずらし、「消失ショー」を盛り上げる。全部、祭りを話題にするための自作自演だったんだバウ！',
    { bgm: 'ending_route' },
    'madame:sad|…………お見事ですわ、名探偵さん。',
    'madame:normal|町の財政は火の車。祭りが話題にならなければ来年はない。わたくしは町を守りたかった。そのための「少しの演出」……の、つもりでしたの。',
    'mayor:sad|……ワシが言い出したことじゃ。マダムは乗ってくれただけじゃ。',
    'madame:normal|いいえ、町長。台本を書いたのはわたくし。責任は半分こですわ。',
    { show: ['madame'] },
    'madame:sad|ただ……ケースは、台本どおりの場所にございませんでしたの。本当に、どこへ消えたのか……。',
    { show: [] },
    '|生中継は「やらせ発覚」の特番に切り替わった。マダム・サキは全国に向けて頭を下げ、町長は町民の前で深々と頭を下げた。',
    '|不思議なことに、町民たちは怒るよりも笑った。「町長らしいや」「マダムまでやるとはね」。',
    '|翌年、マダムは「正直祭り」の開催を発表した。演出なし、台本なし。それでも人は集まった。',
    '|黄金のちゅ〜るは、祭りの翌日、厨房の冷蔵庫から「発見」された。シェフは何も語らなかった。',
    'sakichi:think|台本は暴いた。でも台本の外で、誰がケースを運んで、誰が隠したのか……ボクはまだ半分しか見ていないバウ。',
    { card: 'END 4', sub: 'マダムの秘密協定' },
    { ending: 'end4' }
  ];

  /* ======================= END 5 迷探偵・佐吉 ======================= */
  S.end5_s = [
    { bgm: 'tense' },
    { branch: [
      { cond: { acc: ['suspect', 'bosston'] }, next: 'end5_bosston' },
      { cond: { acc: ['suspect', 'chef'] }, next: 'end5_chef' },
      { cond: { acc: ['suspect', 'gonzalez'] }, next: 'end5_gonzalez' },
      { cond: { acc: ['suspect', ['madame_mayor', 'mayor', 'multi']] }, next: 'end5_mayor' },
      { cond: { acc: ['suspect', 'buhita'] }, next: 'end5_buhita' },
      { cond: { acc: ['suspect', ['pekibaa', 'ponta']] }, next: 'end5_witness' }
    ], 'else': 'end5_outsider' }
  ];
  S.end5_bosston = [
    { show: ['bosston'] },
    'sakichi:shout|犯犬はボス・トンさんだバウ！　映像を消せるのはあなただけ！',
    'bosston:smug|ほう。では聞こう。私が監視室を出た記録は？　保管室の鍵を借りた記録は？　ケースはどこに？',
    'sakichi:sweat|そ、それは……。',
    'bosston:smug|論理的に考えたまえ。映像を止められることと、ケースを盗むことは別の話だ。',
    { jump: 'end5_common' }
  ];
  S.end5_chef = [
    { show: ['chef'] },
    'sakichi:shout|犯犬はシェフ・ブヒーノだバウ！　在庫が合わないのが動かぬ証拠！',
    'chef:sad|た、確かに味見はしてたブヒ……でも、事件の前からの話ブヒ……。',
    'sakichi:sweat|じゃ、じゃあケースは……どうやって密室から……？',
    'chef:sad|わからないブヒ……。',
    { jump: 'end5_common' }
  ];
  S.end5_gonzalez = [
    { show: ['gonzalez'] },
    'sakichi:shout|犯犬はゴンザレスさんだバウ！　現場に靴下を落とした！　怪力で扉を……！',
    'gonzalez:sad|靴下を落としたのは7時40分だ……。それに、オレは保管室の鍵を8時台には借りてねえ……。',
    'sakichi:sweat|そ、そういえば……。',
    { jump: 'end5_common' }
  ];
  S.end5_mayor = [
    { show: ['mayor'] },
    'sakichi:shout|犯犬は……町長だバウ！',
    'mayor:angry|証拠は！？　ワシが盗んだというなら、ちゅ〜るは今どこにあるのじゃ！',
    'sakichi:sweat|そ、それは……地下の……箱の……ええと……。',
    'mayor:angry|ワシは何も聞いておらん！！',
    '|町長の一喝に、会場の空気が凍りついた。決め手を欠いた推理は、ただの言いがかりにしか聞こえなかった。',
    { jump: 'end5_common' }
  ];
  S.end5_buhita = [
    { show: ['buhita'] },
    'sakichi:shout|犯犬は……ブヒ田刑事、あなただバウ！　ずっと箱7、箱7って……！',
    'buhita:sad|め、名探偵……ボクを……疑うブヒ……？',
    '|ブヒ田刑事の目から、大粒の涙がこぼれた。会場が静まり返る。',
    'sakichi:sweat|…………（何か、間違えた気がするバウ）',
    { jump: 'end5_common' }
  ];
  S.end5_witness = [
    'sakichi:shout|犯犬は……証言をした犬！　あなたバウ！',
    '|会場がどよめいた。……いや、ざわめきは、すぐに失笑に変わった。',
    'buhita:sweat|名探偵……その犬は、正直に話してくれただけブヒ……。',
    { jump: 'end5_common' }
  ];
  S.end5_outsider = [
    'sakichi:shout|犯犬は……雨にまぎれて忍び込んだ外部の犬だバウ！',
    'buhita:excited|やっぱりブヒ！　ボクも最初からそう思ってたブヒ！',
    '|会場は拍手に包まれた。……だが、町の外に逃げたという犯犬は、いつまでたっても見つからなかった。',
    { jump: 'end5_common' }
  ];
  S.end5_common = [
    { bgm: 'sad' }, { bg: 'rain' }, { show: [] },
    '|推理は崩れた。生中継のカメラは、言葉に詰まる黒パグの顔をアップで映し続けた。',
    '|翌朝のブサワン新聞の見出しは「名探偵、迷探偵に」。',
    '|黄金のちゅ〜るは見つからないまま、祭りは中止になった。',
    { bg: 'office_sakichi' },
    'sakichi:sad|………………。',
    'sakichi:sad|何かを、見落としたんだバウ。証拠の声を、最後まで聞いてあげられなかったんだバウ。',
    'sakichi:normal|……もう一度、最初から考え直すバウ。',
    { card: 'END 5', sub: '迷探偵・佐吉' },
    { ending: 'end5' }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
