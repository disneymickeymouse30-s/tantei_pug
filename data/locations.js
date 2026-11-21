/* 調査場所・調査対象・章の目標 */
(function (G) {
  var D = G.GAME_DATA = G.GAME_DATA || {};

  /* 場所：people は章ごとにその場にいる犬 */
  D.locations = [
    { id: 'plaza', name: '祭りの広場', bg: 'plaza', cond: true,
      people: { 1: ['mayor', 'madame', 'gonzalez', 'chef'], 2: ['ponta', 'madame', 'gonzalez'], 3: ['ponta', 'gonzalez'], 4: ['ponta'] } },
    { id: 'storage', name: '保管室', bg: 'storage', cond: true,
      people: { 1: ['buhita'], 2: ['buhita'], 3: ['buhita'] } },
    { id: 'display', name: '展示台', bg: 'display', cond: true, people: {} },
    { id: 'monitor', name: '監視室', bg: 'monitor', cond: true,
      people: { 1: ['bosston'], 2: ['bosston'], 3: ['bosston'], 4: ['bosston'] } },
    { id: 'kitchen', name: '厨房', bg: 'kitchen', cond: { chapter: { min: 2 } },
      people: { 2: ['chef'], 3: ['chef'], 4: ['chef'] } },
    { id: 'keyhut', name: '鍵番小屋', bg: 'keyhut', cond: { chapter: { min: 2 } },
      people: { 2: ['pekibaa'], 3: ['pekibaa'], 4: ['pekibaa'] } },
    { id: 'office', name: '町長の執務室', bg: 'office', cond: { chapter: { min: 2 } },
      people: { 2: ['mayor'], 3: ['mayor'], 4: ['mayor'] } },
    { id: 'vip', name: 'マダムのVIPテント', bg: 'vip', cond: { chapter: { min: 3 } },
      people: { 3: ['madame'], 4: ['madame'] } },
    { id: 'backdoor', name: '厨房裏通路・搬入口', bg: 'backdoor', cond: { all: [{ route: 'B' }, { chapter: 3 }] }, people: {} },
    { id: 'gate', name: '地下倉庫入口', bg: 'gate', cond: { all: [{ route: 'C' }, { chapter: 3 }] }, people: {} },
    { id: 'warehouse', name: '地下倉庫', bg: 'warehouse', cond: { chapter: { min: 4 } },
      people: { 4: ['buhita', 'gonzalez'] } }
  ];

  var R = function (cond, lines, effects) { return { cond: cond, lines: lines, effects: effects || [] }; };

  D.targets = [
    /* ===== 保管室 ===== */
    { id: 'st_floor', loc: 'storage', label: '床', results: [
      R(true, [
        { se: 'step' },
        '|床に点々と、濡れた足跡が続いている。',
        'buhita:excited|雨の中から入ってきたブヒ！　外部犯ブヒ！　今すぐ町の外を封鎖するブヒ！',
        'sakichi:think|その話、ちょっと待つバウ。……くんくん。雨水にしては、妙に美味しそうな匂いがするバウ。',
        'sakichi:normal|それに足跡は扉の前と展示台の間を往復しているだけ。窓の方へは一歩も行ってないバウ。'
      ], [{ give: 'ev_footprints' }]),
      R({ deduced: 'd_inside' }, [
        'sakichi:smug|改めて嗅ぐと間違いない。かつおだしだバウ。足跡の主は厨房の裏通路から来たバウ。'
      ])
    ] },
    { id: 'st_door', loc: 'storage', label: '扉', results: [
      R(true, [
        { se: 'door' },
        '|重たい扉。閉めると自動で鍵がかかるオートロック式だ。',
        'buhita:normal|8:28にペキ婆が点検で開けるまで、ちゃんと鍵はかかってたブヒ。だから密室ブヒ！',
        'sakichi:think|取っ手にべっとり……よだれだバウ。乾きかけてるけど、光に当てるとキラキラしてるバウ。',
        'buhita:smug|よだれなら町中の犬が垂らしてるブヒ。ボクも今垂らしてるブヒ。',
        'sakichi:sweat|それは自慢にならないバウ。'
      ], [{ give: 'ev_drool' }])
    ] },
    { id: 'st_lift', loc: 'storage', label: '壁の小さな扉', results: [
      R(true, [
        '|壁に、電子レンジほどの大きさの小さな扉がある。',
        'buhita:normal|それは配膳リフトブヒ。厨房と保管室と地下倉庫をつなぐ、料理を運ぶ小さな昇降機ブヒ。犬は乗れないブヒ。',
        'sakichi:normal|ふむ。表示ランプは……「最終停止：地下」。',
        'buhita:excited|地下！　やっぱり地下ブヒ！　地下倉庫の箱7……あ、いや、何でもないブヒ。',
        'sakichi:think|（今、箱7って言ったバウ？）'
      ], [{ give: 'ev_lift' }])
    ] },
    { id: 'st_vent', loc: 'storage', label: '窓と換気口', results: [
      R(true, [
        '|保管室に窓はない。天井近くに、子犬の前足がやっと入るほどの換気口があるだけだ。',
        'sakichi:normal|ここから出入りするのは無理バウ。……鼻先だけなら入るバウ。',
        '|佐吉は換気口に鼻を突っ込んで、抜けなくなった。',
        'sakichi:sweat|…………ブヒ田刑事、引っぱってほしいバウ。',
        'buhita:normal|名探偵、謎が一つ解けたブヒ。換気口は通れないブヒ。'
      ])
    ] },
    { id: 'st_shelf', loc: 'storage', label: '棚', results: [
      R(true, [
        '|祭り用の飾りや紙皿が並ぶ棚。ちゅ〜るの空き箱が一つ。',
        'sakichi:drool|空き箱でもいい匂いがするバウ……。',
        'buhita:normal|名探偵、よだれが床に落ちてるブヒ。証拠が増えるからやめてほしいブヒ。'
      ])
    ] },

    /* ===== 展示台 ===== */
    { id: 'dp_top', loc: 'display', label: 'ガラスの台座', results: [
      R(true, [
        '|黄金のちゅ〜るが置かれていたガラスの台座。今はケースの形にほこりが抜けた跡だけが残る。',
        'sakichi:normal|台座は割れてもいないし、こじ開けた跡もない。ケースはそっと持ち上げられたバウ。',
        'sakichi:think|ケースの跡の大きさは……だいたい30センチ×12センチ。'
      ])
    ] },
    { id: 'dp_back', loc: 'display', label: '台の裏', results: [
      R(true, [
        '|展示台の裏をのぞき込むと、真っ赤な何かが落ちている。',
        { se: 'found' },
        'sakichi:surprised|靴下バウ！　大きい……タグに「GONZ」って刺繍してあるバウ。',
        'buhita:excited|GONZ！　ゴンザレスブヒ！　犯犬はゴンザレスブヒ！　逮捕ブヒ！',
        'sakichi:think|その話、ちょっと待つバウ。この靴下、乾いてるし、上にうっすら埃が積もってるバウ。'
      ], [{ give: 'ev_sock' }]),
      R({ route: 'C' }, [
        'sakichi:think|もう一度、靴下をよく調べるバウ。……つま先に、何か固いものが入ってるバウ。',
        { se: 'found' },
        '|丸めた紙切れが出てきた。「ケース 30×12cm → 箱7にぴったり。7:40 ゴンザレス」',
        'sakichi:surprised|事件の30分前に、ケースの大きさを測った犬がいるバウ！'
      ], [{ give: 'ev_measure_memo' }])
    ] },
    { id: 'dp_edge', loc: 'display', label: '台座の縁', results: [
      R(true, [
        '|木の縁に、四本並んだ引っかき傷。',
        'buhita:excited|怪力でこじ開けた跡ブヒ！',
        'sakichi:normal|でもガラスの台座は無傷バウ。これは……重い体で踏ん張ったときの爪の跡に見えるバウ。前足を台にかけて、何かをのぞき込んでいたバウ。'
      ], [{ give: 'ev_scratch' }])
    ] },
    { id: 'dp_glass', loc: 'display', label: 'ガラスの指紋', results: [
      R(true, [
        '|ガラスに鼻の跡がついている。',
        'sakichi:surprised|鼻紋！　犯犬の鼻紋だバウ！',
        'buhita:normal|……それ、さっき名探偵がのぞき込んだときの跡ブヒ。',
        'sakichi:sweat|…………。証拠から除外するバウ。'
      ])
    ] },

    /* ===== 監視室 ===== */
    { id: 'mo_screen', loc: 'monitor', label: 'モニター', results: [
      R(true, [
        '|保管室カメラ1の録画を早送りで確認する。',
        'sakichi:normal|8:09……画面が真っ黒になったバウ。',
        'sakichi:normal|8:12に映像が戻る。扉は閉まったまま。そのあとは……8:28にペキ婆が点検に来るまで、扉の前には誰も映ってないバウ。',
        'bosston:normal|欠落はわずか3分間。誤差の範囲だよ、探偵くん。'
      ], [{ give: 'ev_camera_gap' }])
    ] },
    { id: 'mo_terminal', loc: 'monitor', label: '管理端末', results: [
      R(true, [
        '|監視システムの管理端末。ログイン画面が表示されている。',
        'bosston:sweat|触らないでくれたまえ。……いや、触っても無駄だ。パスワードが要る。',
        'sakichi:normal|ボス・トンさんは覚えてるバウ？',
        'bosston:smug|もちろんだとも。…………付箋に書いて……付箋はどこだ……。'
      ]),
      R({ route: 'A' }, [
        '|ボス・トンが渋々ログインした管理端末で、システムの記録を開く。',
        { se: 'found' },
        '|「8:09:00 カメラ1 手動停止（管理室端末／BT-admin）」「8:12:00 再開」',
        'sakichi:surprised|障害じゃないバウ。「手動停止」って書いてあるバウ！',
        'bosston:sweat|そ、そのログは……表示形式の都合でそう見えるだけだ。'
      ], [{ give: 'ev_video_log' }])
    ] },
    { id: 'mo_server', loc: 'monitor', label: '予備サーバー', cond: { chapter: { min: 3 } }, results: [
      R(true, [
        '|部屋の隅で唸る予備サーバー。廊下カメラ2の録画が保存されているらしい。パスワード画面だ。',
        'sakichi:think|パスワードは……ボス・トンさんしか知らないバウ。'
      ]),
      R({ all: [{ route: 'A' }, { flag: 'pw_hint' }] }, [
        'sakichi:smug|パスワードは「TUXEDO0909」……ボス・トンさんの柄と、9月9日の誕生日バウ！',
        { se: 'found' },
        '|ログイン成功。廊下カメラ2の記録が残っていた。',
        'sakichi:surprised|8:06……厨房裏通路の濡れた床を、大柄なブルドッグっぽい後ろ姿が歩いていくバウ。全身が金色にピカピカ光ってるバウ！',
        'bosston:sweat|カメラ2が生きていたのか……！　止めようとしたのに、パスワードを思い出せなかったから……あっ。',
        'sakichi:think|（今、「止めようとした」って言ったバウ）'
      ], [{ give: 'ev_fragment' }, { secret: 's_bt_password' }])
    ] },
    { id: 'mo_coffee', loc: 'monitor', label: 'マグカップ', results: [
      R(true, [
        '|「I ♥ TUXEDO」と書かれたマグカップ。冷めたコーヒーが残っている。',
        'sakichi:normal|朝からずっとここにいたのは本当みたいバウ。マグの横に卓上カレンダー。9月9日に花丸がついてるバウ。'
      ])
    ] },

    /* ===== 広場 ===== */
    { id: 'pl_clock', loc: 'plaza', label: '時計台', results: [
      R(true, [
        '|広場の真ん中の時計台。針は8:00を指している。',
        'sakichi:normal|8時ちょうど……。',
        'sakichi:think|…………あれ？　ここに来てからずっと8時ちょうどな気がするバウ。',
        'buhita:normal|時計台は町の誇りブヒ。一秒も狂わないブヒ。'
      ], [{ give: 'ev_clock' }])
    ] },
    { id: 'pl_ground', loc: 'plaza', label: '地面', results: [
      R(true, [
        '|広場の土はまだ湿っていて、犬たちの泥の足跡がたくさんついている。',
        'sakichi:think|広場の足跡は泥だらけ。でも保管室の足跡には泥がついてなかったバウ。……覚えておくバウ。'
      ])
    ] },
    { id: 'pl_stage', loc: 'plaza', label: '開会式のステージ', results: [
      R(true, [
        '|飾り付けられたステージ。「世界ちゅ〜る祭り」の横断幕。テレビカメラが何台も並んでいる。',
        'sakichi:normal|ずいぶん大がかりな中継バウ。カメラに「ブサワンTV」って書いてあるバウ。',
        'buhita:normal|マダム・サキの局ブヒ。10時から生中継の予定ブヒ。……10時から。'
      ])
    ] },
    { id: 'pl_stall', loc: 'plaza', label: 'ちゅ〜るの屋台', results: [
      R(true, [
        '|開店前のちゅ〜る屋台。甘い香りが漂う。',
        'sakichi:drool|………………。',
        'buhita:normal|名探偵？',
        'sakichi:drool|………………………………。',
        { se: 'bonk' },
        'sakichi:sweat|はっ！　三秒、意識が飛んでいたバウ。'
      ])
    ] },

    /* ===== 厨房 ===== */
    { id: 'kt_book', loc: 'kitchen', label: '在庫帳', results: [
      R(true, [
        '|ちゅ〜るの在庫帳。二重線、修正液、書き直しの嵐。',
        'sakichi:normal|三日前から数が合ってないバウ。毎日4本ずつ減ってる。それに……今朝8:45付けで、新しい修正があるバウ。',
        'chef:sweat|そ、それは記録ミスブヒ！　ボーノ……じゃない、ボクの字が汚いだけブヒ！'
      ], [{ give: 'ev_inventory' }])
    ] },
    { id: 'kt_trash', loc: 'kitchen', label: 'ゴミ箱', cond: { has: 'ev_inventory' }, results: [
      R(true, [
        '|ゴミ箱の奥に丸められたメモ。',
        { se: 'found' },
        '|「味見①ボーノ　②ボーノ　③もう一本だけ　④これで最後」――三日分、びっしり。',
        'chef:surprised|ブヒィ！？　そ、それはレシピの研究ノートブヒ！'
      ], [{ give: 'ev_taste_memo' }])
    ] },
    { id: 'kt_fridge', loc: 'kitchen', label: '冷蔵庫', results: [
      R(true, [
        '|大きな業務用冷蔵庫。',
        'sakichi:drool|この中には、きっと夢と希望とちゅ〜るが……。',
        'chef:angry|開けちゃダメブヒ！！　食材の温度が変わるブヒ！　料理長の聖域ブヒ！',
        'sakichi:surprised|そ、そんなに怒らなくても……バウ。',
        'sakichi:think|（妙に必死だったバウ）'
      ]),
      R({ chapter: { min: 4 } }, [
        'chef:sweat|だ、だめだめ！　今は特にダメブヒ！',
        'sakichi:think|（「今は特に」……？）'
      ])
    ] },
    { id: 'kt_pot', loc: 'kitchen', label: '大鍋', results: [
      R(true, [
        '|空っぽの大鍋がひっくり返して干してある。',
        'chef:normal|今朝、だしを一鍋ぶちまけちゃったブヒ。8時ごろブヒ。裏通路がだしの海ブヒ。',
        'sakichi:think|だし……？'
      ])
    ] },
    { id: 'kt_handle', loc: 'kitchen', label: 'リフトの手回しハンドル', results: [
      R(true, [
        '|厨房の配膳リフトは、手回しハンドルで地下から荷物を引き上げる仕組みだ。',
        'sakichi:normal|ハンドルの油がまだ新しいバウ。今朝、誰かが回したみたいバウ。',
        'chef:sweat|き、気のせいブヒ。'
      ])
    ] },

    /* ===== 鍵番小屋 ===== */
    { id: 'kh_book', loc: 'keyhut', label: '鍵の帳面', results: [
      R({ not: { any: [{ trust: ['pekibaa', '>=', 60] }, { flag: 'badge' }] } }, [
        'pekibaa:angry|これ、勝手に覗くでない！　帳面は鍵番の命じゃ。見ず知らずの探偵に見せるもんかね。',
        'sakichi:sweat|手厳しいバウ……。ペキ婆さんに信用してもらうか、何か別の方法を考えるバウ。'
      ], [{ set: 'pk_refused' }]),
      R({ any: [{ trust: ['pekibaa', '>=', 60] }, { flag: 'badge' }] }, [
        'pekibaa:normal|……仕方ないのう。ほれ、見るがよい。',
        { se: 'found' },
        '|「7:35 ゴンザレス（町長代理）→7:45返却」「8:05 町長（最終確認）→8:13返却」「8:28 ペキ婆 点検」',
        'sakichi:surprised|犯行の 8:09〜8:12 に鍵を持っていたのは……町長だけバウ！',
        'pekibaa:smug|帳面は嘘をつかんのじゃ。'
      ], [{ give: 'ev_key_log' }])
    ] },
    { id: 'kh_hook', loc: 'keyhut', label: '鍵掛け', results: [
      R(true, [
        '|鍵掛けに保管室の鍵が一本だけ下がっている。合鍵はないそうだ。',
        'sakichi:normal|鍵は一本。貸したら必ず記録。……完璧な管理バウ。'
      ])
    ] },

    /* ===== 執務室 ===== */
    { id: 'of_floor', loc: 'office', label: '床', results: [
      R(true, [
        '|絨毯の上に、キラキラ光る金色の粉が散らばっている。',
        { se: 'found' },
        'sakichi:surprised|金色の粉バウ！　黄金のケースの塗装が剥げたものバウ？',
        'mayor:sweat|そ、それは……祭りの飾り付けの材料じゃ！　ワシは何も聞いておらん！',
        'sakichi:think|飾り付け……？　あのケースは金メッキで、粉が出るような塗装じゃなかったはずバウ。'
      ], [{ give: 'ev_gold_powder' }])
    ] },
    { id: 'of_banner', loc: 'office', label: '布をかけた大きな板', results: [
      R(true, [
        'mayor:angry|それに触るでない！　それは……その……来年の看板じゃ！',
        'sakichi:think|布の端から、金色の文字が少しだけ見えるバウ。「……失！？」'
      ]),
      R({ route: 'D' }, [
        '|町長の目を盗み、そっと布をめくる。',
        { fx: 'shake' },
        '|金粉塗料でピカピカの看板。「速報！　黄金のちゅ〜る消失！？　名探偵が10時に発見か！？」',
        'sakichi:shout|事件が起きる前に、「消失」の看板ができてるバウ！！',
        'mayor:sweat|ワ、ワシは何も聞いておらん！！'
      ], [{ set: 'saw_banner' }])
    ] },
    { id: 'of_safe', loc: 'office', label: '金庫', results: [
      R(true, [
        '|頑丈な金庫。4桁の番号式だ。',
        'sakichi:normal|開かないバウ。'
      ]),
      R({ all: [{ route: 'D' }, { flag: 'safe_hint' }] }, [
        'sakichi:smug|番号は「0222」。町長の誕生日、2月22日――ワンワンワンの日バウ！',
        { se: 'door' },
        '|カチリ。金庫が開いた。中には「極秘」と書かれた書類が。',
        { se: 'found' },
        '|「極秘：世界ちゅ〜る祭り話題沸騰作戦。黄金のちゅ〜るを消失させ、10時、名探偵が地下の箱7で発見。ブサワンTVで生中継」',
        'sakichi:surprised|これは……事件の筋書きバウ！'
      ], [{ give: 'ev_plan' }])
    ] },
    { id: 'of_desk', loc: 'office', label: '机の引き出し', cond: { chapter: { min: 3 } }, results: [
      R(true, [
        '|町長の机。演説原稿が山積みだ。「ワシは何も聞いておらん！（大声で）」と書いてある原稿もある。',
        'sakichi:sweat|あのセリフ、原稿だったバウ……。'
      ]),
      R({ all: [{ route: 'D' }, { flag: 'madame_refused' }] }, [
        'sakichi:think|マダムが教えてくれないなら……町長の側にも写しがあるはずバウ。',
        { se: 'found' },
        '|原稿の山の底から、署名入りの書類の写しが出てきた。「秘密協定書（写）」',
        'sakichi:surprised|町長とマダムの秘密協定バウ！'
      ], [{ give: 'ev_pact' }])
    ] },

    /* ===== VIPテント ===== */
    { id: 'vp_table', loc: 'vip', label: 'テーブル', results: [
      R(true, [
        '|豪華なテーブルに、紅茶と冊子が置いてある。冊子の表紙には「台本　第3稿」。',
        'madame:smug|あら、お目が高いこと。それは……今日の中継の進行表ですわ。',
        'sakichi:think|（台本……）'
      ])
    ] },

    /* ===== 厨房裏通路・搬入口 ===== */
    { id: 'bd_floor', loc: 'backdoor', label: '床', results: [
      R(true, [
        '|裏通路の床は一面、だし汁の水たまり。乾き始めた縁に、大きな足跡がくっきり残っている。',
        { se: 'found' },
        'sakichi:surprised|この匂い、この大きさ……保管室の足跡と同じバウ！　足跡は保管室の方へ向かってるバウ！'
      ], [{ give: 'ev_dashi' }])
    ] },
    { id: 'bd_panel', loc: 'backdoor', label: 'リフトの記録盤', results: [
      R(true, [
        '|搬入口の壁に、配膳リフトの運行を記録する古い記録盤がある。紙テープがカタカタと伸びている。',
        { se: 'found' },
        '|「8:11 保管室→地下」「8:40 地下→厨房（箱1・手回し）」',
        'sakichi:surprised|ケースは8:11に地下へ。そして8:40に地下から厨房へ、箱1が上がってきてるバウ！'
      ], [{ give: 'ev_lift_schedule' }])
    ] },
    { id: 'bd_cam', loc: 'backdoor', label: '天井のカメラ', results: [
      R(true, [
        '|天井に小さな監視カメラ。「廊下カメラ2」とラベルが貼ってある。赤いランプが点いている。',
        'sakichi:normal|このカメラ、ちゃんと動いてるバウ。'
      ])
    ] },

    /* ===== 地下倉庫入口 ===== */
    { id: 'gt_door', loc: 'gate', label: '扉', results: [
      R(true, [
        { se: 'door' },
        '|地下倉庫の扉が、蝶番ごと外れて斜めに倒れている。',
        'buhita:excited|怪力で押し入った跡ブヒ！　怪力といえばゴンザレスブヒ！',
        'sakichi:think|その話、ちょっと待つバウ。扉の破片……全部「外側」に散らばってるバウ。',
        { se: 'found' },
        'sakichi:shout|外から押し入ったなら破片は内側に落ちるはずバウ。これは内側から外へ、体当たりで壊されたんだバウ！'
      ], [{ give: 'ev_broken_door' }])
    ] },
    { id: 'gt_stairs', loc: 'gate', label: '暗い階段', results: [
      R(true, [
        '|地下へ続く階段は真っ暗だ。',
        'sakichi:sweat|……べ、別に怖くないバウ。暗いところで推理すると集中できるだけバウ。',
        'buhita:normal|名探偵、しっぽが足の間に入ってるブヒ。'
      ])
    ] },

    /* ===== 地下倉庫 ===== */
    { id: 'wh_waybill', loc: 'warehouse', label: '伝票差し', results: [
      R(true, [
        '|壁の伝票差しに、今日の輸送伝票。',
        { se: 'found' },
        '|「箱1：予備ちゅ〜る30本　地下→厨房　8:40（配膳リフト）」受領欄は修正液で白く消されている。「箱7：町長私物（触るな）」',
        'sakichi:surprised|受領欄が消されてるバウ。届いたのに「届いてない」ことにした犬がいるバウ！'
      ], [{ give: 'ev_waybill' }])
    ] },
    { id: 'wh_shelf', loc: 'warehouse', label: '箱の棚', results: [
      R(true, [
        '|木箱が番号順に並ぶ棚。番号は浮き彫りで、指でなぞって読める。',
        '|箱7のふたを開けると――中は空っぽ。内張りのスポンジが、ちょうど黄金ケースの形にくり抜かれている。',
        { se: 'found' },
        'sakichi:surprised|最初から、ケースを入れるために作られた箱バウ！　でも箱1の場所は……空いてるバウ。',
        'sakichi:think|浮き彫りの「1」と「7」。指でなぞると……暗闇ならそっくりバウ。'
      ], [{ give: 'ev_box_numbers' }])
    ] },
    { id: 'wh_bulb', loc: 'warehouse', label: '天井の電球', results: [
      R(true, [
        '|天井の電球は切れている。佐吉たちは懐中電灯で照らしている。',
        'buhita:normal|切れたのは今朝らしいブヒ。昨日まではチカチカしてたって管理係が言ってたブヒ。',
        'sakichi:think|今朝ここは、真っ暗だったバウ……。'
      ])
    ] },
    { id: 'wh_lift', loc: 'warehouse', label: '配膳リフトの出口', results: [
      R(true, [
        '|地下側の配膳リフトの出口。床に大きな犬の足跡と、何かを置いた四角い跡。',
        'sakichi:normal|ここで誰かが、下りてきたものを受け取ったバウ。足跡の大きさは……ゴンザレスさんくらいバウ。'
      ])
    ] },
    { id: 'wh_box7', loc: 'warehouse', label: '箱7に入ってみる', results: [
      R(true, [
        '|佐吉は空の箱7に入ってみた。',
        'sakichi:happy|……落ち着くバウ。',
        'buhita:normal|名探偵、捜査中ブヒ。',
        'sakichi:sweat|わかってるバウ。でもパグは狭いところが好きなんだバウ……。'
      ])
    ] }
  ];

  /* 章の目標（全て満たすと「捜査を終える」が押せる） */
  D.chapterGoals = {
    1: [
      { label: '保管室の床を調べる', cond: { has: 'ev_footprints' } },
      { label: '保管室の扉を調べる', cond: { has: 'ev_drool' } },
      { label: '保管室の壁の小さな扉を調べる', cond: { has: 'ev_lift' } },
      { label: '展示台の周りを調べる', cond: { has: 'ev_sock' } },
      { label: '監視室でモニターを確認する', cond: { has: 'ev_camera_gap' } },
      { label: '広場の時計台を調べる', cond: { has: 'ev_clock' } },
      { label: '容疑犬4匹から話を聞く', cond: { all: [{ heard: 'bt1_alibi' }, { heard: 'gz1_alibi' }, { heard: 'md1_alibi' }, { heard: 'ch1_alibi' }] } }
    ],
    2: [
      { label: '厨房の在庫帳を調べる', cond: { has: 'ev_inventory' } },
      { label: '鍵の貸出記録を手に入れる', cond: { has: 'ev_key_log' } },
      { label: '広場の記者から写真を見せてもらう', cond: { has: 'ev_photo' } },
      { label: '町長の執務室を調べる', cond: { has: 'ev_gold_powder' } },
      { label: '誰か一匹の嘘を、矛盾を突いて暴く', cond: { any: [{ flag: 'madame_broken' }, { flag: 'gz_broke_plaza' }, { flag: 'bt_broke' }, { flag: 'chef_broke_stock' }, { flag: 'chef_broke_nobody' }, { flag: 'mayor_broke_key' }] } }
    ],
    3: [
      { label: '【映像】停止ログを見つける', cond: { has: 'ev_video_log' }, show: { route: 'A' } },
      { label: '【映像】廊下カメラ2の映像を見つける', cond: { has: 'ev_fragment' }, show: { route: 'A' } },
      { label: '【在庫】リフトの運行記録を見つける', cond: { has: 'ev_lift_schedule' }, show: { route: 'B' } },
      { label: '【在庫】厨房裏通路を調べる', cond: { has: 'ev_dashi' }, show: { route: 'B' } },
      { label: '【物証】靴下をもう一度調べる', cond: { has: 'ev_measure_memo' }, show: { route: 'C' } },
      { label: '【物証】地下倉庫入口を調べる', cond: { has: 'ev_broken_door' }, show: { route: 'C' } },
      { label: '【秘密】町長の金庫の中身を見る', cond: { has: 'ev_plan' }, show: { route: 'D' } },
      { label: '【秘密】秘密協定の書類を手に入れる', cond: { has: 'ev_pact' }, show: { route: 'D' } }
    ],
    4: [
      { label: '地下倉庫の伝票を調べる', cond: { has: 'ev_waybill' } },
      { label: '地下倉庫の箱を調べる', cond: { has: 'ev_box_numbers' } }
    ]
  };
  // 表示条件（show）で絞った目標が「その章の目標」になるよう、core の goals を補う
  D.chapterEnd = { 1: 'c1_end', 2: 'c2_end', 3: 'c3_end', 4: 'c4_end' };

  /* 場所ごとに一言ヒント（移動時） */
  D.locationIntro = {
    plaza: '|祭りの広場。屋台と飾りと、そわそわしたブサ犬たち。',
    storage: '|黄金のちゅ〜るが消えた保管室。',
    display: '|保管室の奥、ガラス台座の展示台。',
    monitor: '|監視モニターがずらりと並ぶ監視室。',
    kitchen: '|湯気とだしの香りに満ちた祭りの厨房。',
    keyhut: '|鍵番小屋。壁に帳面が何十冊も並ぶ。',
    office: '|町長の執務室。なぜか床がキラキラしている。',
    vip: '|マダム・サキのVIPテント。紅茶の香り。',
    backdoor: '|厨房の裏通路。床がしっとり濡れている。',
    gate: '|地下倉庫への入口。ひんやりした空気が漂う。',
    warehouse: '|地下倉庫。懐中電灯の光が箱の列を照らす。'
  };
})(typeof window !== 'undefined' ? window : globalThis);
