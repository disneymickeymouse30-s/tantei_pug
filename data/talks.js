/* 聞き込みデータ
 * topics: 話題（deep:true は「詳しく聞く」）。ch で章を限定。testimony で証言を記録。
 * present: 証拠を見せたときの正解反応。wrong: 見当違いの証拠へのキャラ別リアクション。
 * contra: 矛盾の指摘（証言×証拠）。press: 追及（条件を満たさないと失敗し信頼度低下）。
 */
(function (G) {
  var D = G.GAME_DATA = G.GAME_DATA || {};
  D.talks = {};

  /* ================= ブヒ田刑事 ================= */
  D.talks.buhita = {
    topics: [
      { id: 'b1_case', ch: [1], label: '事件のあらまし', lines: [
        'buhita:normal|8:28、鍵番のペキ婆が点検で保管室を開けたら、黄金のちゅ〜るがケースごと消えてたブヒ。',
        'buhita:normal|扉は閉めると自動で鍵がかかるオートロック。鍵は一本きり。窓はなし。つまり完全な密室ブヒ！',
        'sakichi:think|密室……。ちゅ〜るは煙のように消えたりしないバウ。必ずどこかに道があるバウ。'
      ] },
      { id: 'b1_hunch', ch: [1], label: 'ブヒ田刑事の見立て', lines: [
        'buhita:excited|ボクの見立てでは、犯犬は――ゴンザレスか、ボス・トンか、シェフか、マダムブヒ！',
        'sakichi:sweat|それ、容疑犬全員バウ。',
        'buhita:smug|そして盗まれたちゅ〜るは、地下倉庫の箱7あたりにあるブヒ！',
        'sakichi:think|……なんで箱7なんだバウ？',
        'buhita:sweat|か、刑事の勘ブヒ！'
      ] },
      { id: 'b2_box7', ch: [2, 3, 4], label: 'なぜ「箱7」なのか', lines: [
        'buhita:sweat|しつこいブヒね。指示？　そんなもの受けてないブヒ！　刑事の勘ブヒ！',
        'buhita:normal|それに町長だって「10時になったら地下を調べるといい」って言ってたブヒ。……あっ。'
      ], testimony: 't_buhita_noorder' },
      { id: 'b2_badge', ch: [2, 3, 4], label: 'ペキ婆の帳面を見たい', cond: { all: [{ flag: 'pk_refused' }, { not: { has: 'ev_key_log' } }] }, lines: [
        'buhita:smug|ふっふっふ、ここはボクの出番ブヒ。警察手帳を見せれば、ペキ婆だって帳面を見せてくれるブヒ。',
        'buhita:normal|ただし名探偵、ペキ婆にお礼を言うのを忘れちゃダメブヒ。',
        '|ブヒ田刑事が鍵番小屋へ口添えしてくれることになった。'
      ], effects: [{ set: 'badge' }] },
      { id: 'b3_route', ch: [3], label: '捜査方針について', variants: [
        { cond: { route: 'A' }, lines: ['buhita:normal|映像を洗うブヒか。ボス・トンの理屈に丸め込まれないように気をつけるブヒ。'] },
        { cond: { route: 'B' }, lines: ['buhita:normal|在庫と輸送ブヒか。シェフの厨房はいい匂いがするから、名探偵は要注意ブヒ。'] },
        { cond: { route: 'C' }, lines: ['buhita:normal|物証ブヒか！　地下倉庫の入口も見ておくといいブヒ。……地下はいいブヒよ、地下は。'] },
        { cond: { route: 'D' }, lines: ['buhita:sweat|町長とマダムを調べるブヒ！？　お、お偉いさんを疑うのはボクの仕事じゃないブヒ……。'] }
      ], lines: [] },
      { id: 'b4_feel', ch: [4], label: '地下倉庫について', lines: [
        'buhita:excited|ついに地下倉庫ブヒ！　箱7！　箱7を開けるブヒ！　テレビカメラは……あれ？　まだ来てないブヒ？',
        'sakichi:think|テレビカメラ……？'
      ] },
      { id: 'b_trust', ch: [1, 2, 3, 4], deep: true, parent: 'b1_case', label: 'ブヒ田刑事自身のこと', lines: [
        'buhita:normal|ボクは刑事になって三年。検挙率は……数えたことないブヒ。数えると悲しくなるから。',
        'buhita:happy|でも名探偵と組むと、いつも事件が解決するブヒ！　だから今日も頼りにしてるブヒ！'
      ], effects: [{ trust: ['buhita', 5] }] }
    ],
    present: [
      { ev: 'ev_footprints', lines: ['buhita:excited|外部犯ブヒ！　……え、違うかもしれない？　じゃあ内部犯ブヒ！'] },
      { ev: 'ev_sock', lines: ['buhita:excited|GONZ！　ゴンザレスで決まりブヒ！', 'sakichi:sweat|決めるのは早すぎるバウ。'] },
      { ev: 'ev_box_numbers', ch: [4], lines: [
        'buhita:surprised|か、空っぽブヒ！？　そんなはずないブヒ！　だって町長は「10時に箱7を開ければ全て解決する」って……！',
        'buhita:sweat|……しまったブヒ。'
      ], effects: [{ trust: ['buhita', -5] }] }
    ],
    wrong: [
      ['buhita:excited|それは証拠ブヒ？　……つまり犯犬はお前ブヒ！', 'sakichi:sweat|ボクを逮捕しないでほしいバウ。'],
      ['buhita:normal|ふむふむ。よくわからないけど、すごい証拠ブヒ。'],
      ['buhita:smug|ボクにはお見通しブヒ。……何がお見通しかは、まだわからないブヒ。']
    ],
    contra: [
      { id: 'cb_order', testimony: 't_buhita_noorder', ev: ['ev_box_numbers', 'ev_plan'], lines: [
        { fx: 'objection' }, { se: 'objection' },
        'sakichi:shout|その話、ちょっと待つバウ！　箱7はケースの形にくり抜かれていた。最初から「ケースが入る予定」だったんだバウ。',
        'sakichi:shout|ブヒ田刑事は、それを知っていたから「箱7」と言い続けたバウ！',
        'buhita:sad|……ブヒ。昨日、町長から指示があったブヒ。「明日10時、名探偵を箱7へ導け」って。',
        'buhita:sad|町長は何か掴んでるんだと思ってたブヒ。黙っててごめんブヒ……。'
      ], effects: [{ secret: 's_buhita_order' }, { set: 'buhita_broken' }, { trust: ['buhita', -5] }] }
    ],
    contraMiss: ['buhita:surprised|ボクの証言が矛盾！？　……どこがブヒ？', 'sakichi:sweat|……ボクにもわからなくなってきたバウ。'],
    press: [
      { id: 'pb_who', ch: [2, 3, 4], show: { testimony: 't_buhita_noorder' }, label: '誰に何を言われた？', cond: { trust: ['buhita', '>=', 60] },
        lines: ['buhita:sad|……名探偵になら話すブヒ。町長に「10時に箱7」と言われたブヒ。でもそれ以上は本当に知らないブヒ。'],
        effects: [{ secret: 's_buhita_order' }],
        fail: ['buhita:angry|刑事を疑うブヒか！？　ひどいブヒ！', 'sakichi:sweat|（もう少し信頼を深めてからにすべきだったバウ）'] }
    ]
  };

  /* ================= ボス・トン ================= */
  D.talks.bosston = {
    topics: [
      { id: 'bt1_alibi', ch: [1, 2, 3, 4], label: '今朝の行動', lines: [
        'bosston:smug|私は7時から一歩もこの監視室を出ていない。コーヒーとモニターと私。完璧な三角形だ。',
        'sakichi:normal|証明できるバウ？',
        'bosston:smug|廊下のカメラに私が映っていないことが証明だ。論理的に考えたまえ。'
      ] },
      { id: 'bt1_gap', ch: [1, 2, 3, 4], label: '映像の欠落', cond: { has: 'ev_camera_gap' }, lines: [
        'bosston:normal|8:09から8:12の欠落か。あれは落雷による瞬間的な障害だ。よくあることだよ。',
        'sakichi:think|落雷……？'
      ], testimony: 't_bt_thunder' },
      { id: 'bt1_pw', ch: [1, 2], deep: true, parent: 'bt1_alibi', label: 'パスワード管理について', lines: [
        'bosston:smug|セキュリティの基本は、推測されにくいパスワードだ。私のパスワードは毎月変えている。',
        'bosston:sweat|……だから時々、自分でもわからなくなる。',
        'sakichi:sweat|本末転倒バウ。'
      ] },
      { id: 'bt2_cam2', ch: [2, 3, 4], label: 'ほかのカメラは？', lines: [
        'bosston:normal|会場には五台のカメラがある。保管室前の1、厨房裏通路の2、広場の3と4、正門の5。',
        'sakichi:normal|カメラ2の映像を見せてほしいバウ。',
        'bosston:sweat|カ、カメラ2は……メンテナンス中だ。予備サーバーにあるが、アクセスには……その……。'
      ] },
      { id: 'bt3_pw', ch: [3], label: '予備サーバーのパスワード', cond: { route: 'A' }, lines: [
        'bosston:sweat|予備サーバーのパスワード？　お、覚えているとも。私の「誇り」と「記念日」の組み合わせだ。……たぶん。',
        'sakichi:think|誇り……あの白黒の柄バウ。記念日は……マグカップの横のカレンダーに花丸があったバウ。',
        'bosston:surprised|な、なぜそれを……！'
      ], effects: [{ set: 'pw_hint' }] },
      { id: 'bt4_after', ch: [4], label: '契約の話', cond: { secret: 's_bt_manual' }, lines: [
        'bosston:sad|IT契約に目がくらんだ。それは認めよう。だが私は保管室には一歩も入っていない。それも事実だ。',
        'bosston:normal|探偵くん、映像を止めた者と、ケースを動かした者は別だ。論理的に考えたまえ。'
      ] }
    ],
    present: [
      { ev: 'ev_camera_gap', lines: ['bosston:smug|だから落雷だと言っているだろう。'] },
      { ev: 'ev_fragment', lines: [
        'bosston:sweat|カメラ2……あれさえ止められていれば……い、いや、何でもない。'
      ], effects: [{ trust: ['bosston', -3] }] },
      { ev: 'ev_video_log', lines: ['bosston:sweat|ログは……ログは嘘をつかない。だが解釈は自由だ。'] }
    ],
    wrong: [
      ['bosston:smug|それと監視システムに何の関係が？　論理的に考えたまえ。'],
      ['bosston:normal|興味深い。だが私の専門外だ。'],
      ['bosston:sweat|それは……パスワードのヒントか？　違う？　そうか……。']
    ],
    contra: [
      { id: 'cbt_thunder', testimony: 't_bt_thunder', ev: ['ev_video_log', 'ev_photo'], lines: [
        { fx: 'objection' }, { se: 'objection' },
        'sakichi:shout|その話、ちょっと待つバウ！　今朝は7時半に雨が上がって、そのあとは雲一つない青空バウ。雷なんか一度も鳴ってないバウ！',
        'bosston:surprised|ぐっ……！',
        'sakichi:shout|映像は事故で消えたんじゃない。誰かが――いや、管理者のあなたが止めたんだバウ！',
        'bosston:sad|…………論理的に、反論できない。そうだ、私が止めた。3分間だけ。',
        'bosston:sad|ある方に頼まれたのだ。見返りは来年度の町のIT契約。だが誓って言う、私は保管室には近づいてもいない。'
      ], effects: [{ secret: 's_bt_manual' }, { set: 'bt_broke' }, { trust: ['bosston', -5] }] }
    ],
    contraMiss: ['bosston:smug|その証拠は私の証言と矛盾しない。論理的に考えたまえ。'],
    press: [
      { id: 'pbt_client', ch: [2, 3, 4], show: { flag: 'bt_broke' }, label: '依頼主は誰だ？', cond: { any: [{ deduced: 'd_mayor' }, { has: 'ev_key_log' }] },
        lines: [
          'sakichi:shout|8:09に保管室の鍵を持っていた犬は一匹だけバウ。カメラを止めてほしかったのは、その犬バウ！',
          'bosston:sad|……町長だ。前日にメールが来た。「8:09から3分、保管室カメラを止めよ」と。',
          'bosston:normal|理由は聞かなかった。聞けば契約が消えると思ったからね。'
        ], effects: [{ trust: ['bosston', 5] }],
        fail: ['bosston:angry|推測で物を言うのは論理ではない。証拠を持ってきたまえ。'] }
    ]
  };

  /* ================= ゴンザレス ================= */
  D.talks.gonzalez = {
    topics: [
      { id: 'gz1_alibi', ch: [1, 2, 3, 4], label: '今朝の行動', lines: [
        'gonzalez:angry|オ、オレじゃねえぞ！　オレは朝からずっと広場にいた！',
        'gonzalez:normal|8時ちょうどにポン太の小僧が見てるはずだ。時計台の下でな！'
      ], testimony: 't_gz_plaza' },
      { id: 'gz1_power', ch: [1], deep: true, parent: 'gz1_alibi', label: '力自慢について', lines: [
        'gonzalez:smug|おうよ。扉なんて片手で外せるぜ。ふんっ！',
        '|ゴンザレスが近くの屋台の柱を軽く押すと、屋台が傾いた。',
        'chef:angry|ボクの屋台ブヒーーー！',
        'gonzalez:sweat|……す、すまねえ。'
      ] },
      { id: 'gz2_sock', ch: [2, 3, 4], label: '片方だけの靴下', cond: { has: 'ev_sock' }, lines: [
        'gonzalez:sweat|く、靴下？　知らねえ！　オレの靴下はちゃんと両足に……',
        '|ゴンザレスは自分の足元を見た。右足は真っ赤な靴下。左足は裸足。',
        'gonzalez:surprised|……片方ねえ！！'
      ], testimony: 't_gz_sock' },
      { id: 'gz2_dark', ch: [2, 3, 4], label: '苦手なもの', lines: [
        'gonzalez:normal|オレに苦手なもんなんかねえよ。',
        { se: 'thunder' },
        '|そのとき、どこかで照明がバチッと消えた。',
        'gonzalez:surprised|ヒィィィィッ！！　暗い！　暗いのはダメだああ！！',
        '|照明はすぐに戻った。ゴンザレスは佐吉の後ろで丸くなっていた。',
        'gonzalez:sweat|……い、今のは、その、準備運動だ。',
        'sakichi:think|（暗いところが大の苦手……覚えておくバウ）'
      ] },
      { id: 'gz4_after', ch: [3, 4], label: '地下で何を見た？', cond: { secret: 's_gz_dark' }, lines: [
        'gonzalez:sad|真っ暗な中で、箱の番号を指でなぞったんだ。「7」だと思った。だけど……。',
        'gonzalez:sad|そのあと扉が開かなくてよ。気がついたら体当たりしてた。怖くて、怖くて……。'
      ] }
    ],
    present: [
      { ev: 'ev_sock', lines: ['gonzalez:surprised|オ、オレの勝負靴下！　どこにあった！？', 'sakichi:normal|保管室の展示台の裏バウ。', 'gonzalez:sweat|……し、知らねえ！　靴下が勝手に歩いてったんだ！'], effects: [{ trust: ['gonzalez', -3] }] },
      { ev: 'ev_broken_door', lines: ['gonzalez:sweat|と、扉が壊れてたって？　オレは知らねえぞ。……破片が外に？　そりゃあ……ふ、不思議だな。'] },
      { ev: 'ev_photo', lines: ['gonzalez:surprised|オレが写ってる！　……ほらな！　広場にいただろ！'] }
    ],
    wrong: [
      ['gonzalez:angry|そんなもん見せられても、オレじゃねえ！'],
      ['gonzalez:sweat|む、難しいことはわかんねえよ……。'],
      ['gonzalez:normal|ふん。オレの筋肉のほうがよっぽど証拠になるぜ。']
    ],
    contra: [
      { id: 'cgz_plaza', testimony: 't_gz_plaza', ev: ['ev_photo'], lines: [
        { fx: 'objection' }, { se: 'objection' },
        'sakichi:shout|その話、ちょっと待つバウ！　この写真の時計台は8:00。でもカメラの記録は8:16バウ！',
        'sakichi:shout|時計台は止まっていた。あなたが広場を全力で走っていたのは8時じゃない、8時16分バウ！',
        'gonzalez:surprised|な、なにぃ！？',
        'sakichi:normal|8時9分から12分、あなたが広場にいた証拠はどこにもない。……どこから走ってきたんだバウ？',
        'gonzalez:sad|…………い、言えねえ。約束なんだ。'
      ], effects: [{ set: 'gz_broke_plaza' }, { trust: ['gonzalez', -5] }] },
      { id: 'cgz_sock', testimony: 't_gz_sock', ev: ['ev_measure_memo', 'ev_key_log'], lines: [
        { fx: 'objection' }, { se: 'objection' },
        'sakichi:shout|その話、ちょっと待つバウ！　7:35、あなたは「町長代理」として保管室の鍵を借りている。そして靴下の中には「ケース30×12cm」のメモ！',
        'gonzalez:sad|……バレちまったか。そうだよ。7時40分に、町長に頼まれてケースの大きさを測りに行ったんだ。',
        'gonzalez:sad|台に前足かけて踏ん張って、巻尺で……その時に靴下が脱げたんだと思う。',
        'sakichi:normal|事件の30分前……つまり靴下は、事件とは別の時間に落ちたものバウ。'
      ], effects: [{ secret: 's_gz_measure' }, { set: 'gz_broke_sock' }, { trust: ['gonzalez', 5] }] }
    ],
    contraMiss: ['gonzalez:angry|な、何が矛盾だ！　オレは頭は悪くても嘘は……いや、その……。'],
    press: [
      { id: 'pgz_dark', ch: [3, 4], show: { flag: 'gz_broke_plaza' }, label: '地下で何があった？', cond: { any: [{ has: 'ev_broken_door' }, { has: 'ev_box_numbers' }] },
        lines: [
          'sakichi:normal|地下倉庫の扉は、内側から壊されていたバウ。……あなたは、あの中で何をしてたんだバウ？',
          'gonzalez:sad|………………町長に頼まれて、地下でケースを受け取る係だったんだ。リフトで下りてくるから箱7に入れろって。',
          'gonzalez:sad|受け取った瞬間、電球がバチッて切れて……真っ暗で……指で番号なぞって箱に入れて……扉が開かなくて……。',
          'gonzalez:sad|気がついたら扉ぶっ壊して、広場を走ってた。情けねえだろ……。'
        ], effects: [{ secret: 's_gz_dark' }, { trust: ['gonzalez', 10] }],
        fail: ['gonzalez:sweat|お、オレは何も知らねえ！　何も！！', '|ゴンザレスは震えながら黙り込んでしまった。'] }
    ]
  };

  /* ================= マダム・サキ ================= */
  D.talks.madame = {
    topics: [
      { id: 'md1_alibi', ch: [1, 2, 3, 4], label: '今朝の行動', lines: [
        'madame:smug|わたくしは朝からVIPテントで紅茶をいただいておりましたわ。中継の打ち合わせもございましたし。',
        'madame:normal|でもね、名探偵さん。8時15分ごろ、少しだけお散歩をしましたの。そのとき――'
      ] },
      { id: 'md1_shadow', ch: [1, 2, 3, 4], deep: true, parent: 'md1_alibi', label: '散歩のときに見たもの', lines: [
        'madame:normal|保管室の扉の前に、怪しい影がございましたの。大きくて、丸い影。',
        'madame:smug|あら、台本どおり……コホン。はっきり覚えておりますわ。'
      ], testimony: 't_madame_shadow' },
      { id: 'md2_town', ch: [2, 3, 4], label: '町と祭りについて', lines: [
        'madame:sad|ブサワンシティの財政は火の車ですの。この祭りが全国に放送されて話題にならなければ、来年の祭りはございません。',
        'madame:normal|わたくしは町を愛しておりますの。そのためなら……少しくらいの「演出」は、ね。',
        'sakichi:think|（演出……？）'
      ] },
      { id: 'md3_pact', ch: [3], label: '町長との関係', cond: { route: 'D' }, variants: [
        { cond: { trust: ['madame', '>=', 50] }, lines: [
          'madame:normal|……あなたは誠実な方ね。いいわ、お見せしましょう。',
          { se: 'found' },
          '|マダムは扇子の奥から一枚の書類を取り出した。「秘密協定書」。町長とマダムの署名がある。',
          'madame:sad|わたくしが出資し、わたくしの局が独占中継する。台本どおり消えて、台本どおり見つかる……はずでしたのよ。'
        ], effects: [{ give: 'ev_pact' }, { trust: ['madame', 5] }] },
        { cond: true, lines: [
          'madame:smug|あら、そのようなこと、あなたにお話しする理由がございまして？',
          'sakichi:sweat|手ごわいバウ……。マダムが話してくれないなら、相手側――町長の執務室を探すしかないバウ。'
        ], effects: [{ set: 'madame_refused' }] }
      ], lines: [] },
      { id: 'md4_tea', ch: [2, 3, 4], deep: true, parent: 'md2_town', label: '紅茶をいただく', lines: [
        'madame:happy|あら、お付き合いくださるの？　うふふ、パグ同士、仲良くいたしましょう。',
        '|佐吉は紅茶をいただいた。ちゅ〜る味ではなかったが、上品な味がした。'
      ], effects: [{ trust: ['madame', 10] }] }
    ],
    present: [
      { ev: 'ev_pact', lines: ['madame:sad|……それをどこで。そう、知ってしまったのね。'] },
      { ev: 'ev_gold_powder', lines: ['madame:smug|まあ、きれい。町長がずいぶん張り切って看板を塗っていらしたもの。……あら、口が滑りましたわ。'] }
    ],
    wrong: [
      ['madame:smug|あら、可愛らしい証拠ね。でもわたくしには関係ございませんわ。'],
      ['madame:normal|名探偵さん、品のある捜査をなさって？'],
      ['madame:smug|うふふ。それ、台本には……いえ、何でもございませんわ。']
    ],
    contra: [
      { id: 'cmd_shadow', testimony: 't_madame_shadow', ev: ['ev_camera_gap', 'ev_pact'], lines: [
        { fx: 'objection' }, { se: 'objection' },
        'sakichi:shout|その話、ちょっと待つバウ！　保管室カメラは8:12に復旧しているバウ。そして8:28にペキ婆が来るまで、扉の前には誰ひとり映っていない！',
        'sakichi:shout|8時15分に「怪しい影」がいたなら、カメラに映っていないとおかしいバウ！',
        'madame:surprised|…………まあ。',
        'madame:sad|……見間違い、ということにしておいてくださるかしら。わたくしにも、守らなければならないものがございますの。'
      ], effects: [{ set: 'madame_broken' }, { trust: ['madame', -5] }] }
    ],
    contraMiss: ['madame:smug|あら、それのどこが矛盾ですの？　もう一度、よくお考えになって。'],
    press: [
      { id: 'pmd_script', ch: [3, 4], show: { flag: 'madame_broken' }, label: '「台本」とは何のことだ？', cond: { has: 'ev_pact' },
        lines: [
          'sakichi:normal|「目撃者役：マダム。8:15、保管室前に怪しい影」……協定書にそう書いてあるバウ。',
          'madame:sad|……そうよ。全部、台本でしたの。町長の「消失ショー」に、わたくしは目撃者として出演しただけ。',
          'madame:sad|でも本当に消えてしまったの。台本にない消失よ。わたくし、どうしていいかわからなくて……町の名誉を守るには、黙っているしかなかった。'
        ], effects: [{ secret: 's_madame_script' }, { trust: ['madame', 5] }],
        fail: ['madame:angry|根拠のないお話は、品がございませんわね。', '|マダムは扇子で顔を隠してしまった。'] }
    ]
  };

  /* ================= シェフ・ブヒーノ ================= */
  D.talks.chef = {
    topics: [
      { id: 'ch1_alibi', ch: [1, 2, 3, 4], label: '今朝の行動', lines: [
        'chef:happy|ボーノ！　ボクは7時からずっと厨房で仕込みブヒ。今は屋台の準備で広場に出てきたブヒ。',
        'chef:normal|今朝は誰も厨房を通らなかったブヒ。ずっと鍋の前にいたから確かブヒ。'
      ], testimony: 't_chef_nobody' },
      { id: 'ch1_taste', ch: [1], deep: true, parent: 'ch1_alibi', label: '料理のこだわり', lines: [
        'chef:smug|料理は愛と味見ブヒ。味見しない料理長は、地図を持たない探検家ブヒ。',
        'sakichi:normal|味見はどれくらいするバウ？',
        'chef:sweat|ひ、一日一回……くらい……ブヒ。……ボーノ。'
      ] },
      { id: 'ch2_stock', ch: [2, 3, 4], label: 'ちゅ〜るの在庫', lines: [
        'chef:smug|ちゅ〜るの在庫はぴったり合ってるブヒ。料理長の誇りにかけて！',
        'sakichi:think|（目が泳いでるバウ）'
      ], testimony: 't_chef_stock' },
      { id: 'ch3_box', ch: [3, 4], label: '今朝の荷物', lines: [
        'chef:sweat|箱？　今朝は何も届いてないブヒ。リフトなんて触ってないブヒ。',
        'chef:sweat|本当ブヒ。本当に本当ブヒ。本当の本当の……ブヒ。'
      ], testimony: 't_chef_nobox' },
      { id: 'ch2_fridge', ch: [2, 3, 4], deep: true, parent: 'ch2_stock', label: '冷蔵庫の中身', lines: [
        'chef:angry|冷蔵庫の話はやめてほしいブヒ！　料理長の聖域ブヒ！',
        'sakichi:drool|中にちゅ〜るは……',
        'chef:angry|ないブヒ！！　ちゅ〜るも、黄金も、なーんにもないブヒ！',
        'sakichi:think|（黄金……？）'
      ] }
    ],
    present: [
      { ev: 'ev_inventory', lines: ['chef:sweat|そ、それは記録ミスブヒ！'] },
      { ev: 'ev_dashi', lines: ['chef:sad|だしをこぼしたのはボクブヒ……8時ごろブヒ。その話はもう勘弁してほしいブヒ。'] },
      { ev: 'ev_waybill', ch: [4], lines: ['chef:surprised|ブ、ブヒッ！？　そ、その伝票は……！', 'chef:sweat|知らない、知らないブヒ……！'], effects: [{ trust: ['chef', -3] }] }
    ],
    wrong: [
      ['chef:happy|ボーノ！　……え、食べ物じゃないブヒ？'],
      ['chef:normal|それは料理に使えないブヒ。'],
      ['chef:sweat|ボ、ボクを疑ってるブヒ？　……違う？　ほっ。']
    ],
    contra: [
      { id: 'cch_stock', testimony: 't_chef_stock', ev: ['ev_inventory', 'ev_taste_memo'], lines: [
        { fx: 'objection' }, { se: 'objection' },
        'sakichi:shout|その話、ちょっと待つバウ！　在庫帳は三日前から毎日4本ずつ減っている。そしてゴミ箱には「味見①ボーノ②ボーノ」のメモ！',
        'chef:sad|…………ブヒ。ごめんなさいブヒ。三日前から、毎日ちょっとずつ……味見してたブヒ。',
        'chef:sad|でも盗難とは関係ないブヒ！　黄金のちゅ〜るには指一本……いや、舌一枚触れてないブヒ！'
      ], effects: [{ secret: 's_chef_taste' }, { set: 'chef_broke_stock' }, { trust: ['chef', -5] }] },
      { id: 'cch_nobody', testimony: 't_chef_nobody', ev: ['ev_dashi', 'ev_fragment'], lines: [
        { fx: 'objection' }, { se: 'objection' },
        'sakichi:shout|その話、ちょっと待つバウ！　8時にこぼれただし汁の上に、大きな足跡が残っていた。誰かが厨房の裏通路を通ったバウ！',
        'chef:sad|……ブヒ。8時6分ごろ、町長が通ったブヒ。顔がピカピカ光ってたブヒ。',
        'chef:sad|でもボク、その時ちょうど食料庫で味見してたから……見たって言ったら、味見がバレると思って……。'
      ], effects: [{ secret: 's_chef_saw_mayor' }, { set: 'chef_broke_nobody' }, { trust: ['chef', 5] }] },
      { id: 'cch_nobody2', testimony: 't_chef_nobody', ev: ['ev_footprints'], cond: { deduced: 'd_inside' }, lines: [
        { fx: 'objection' }, { se: 'objection' },
        'sakichi:shout|その話、ちょっと待つバウ！　保管室の足跡からは、かつおだしの匂いがしたバウ。足跡の主は厨房の裏通路を通ったんだバウ！',
        'chef:sad|……ブヒ。8時6分ごろ、町長が通ったブヒ。顔がピカピカ光ってたブヒ。',
        'chef:sad|でもボク、その時ちょうど食料庫で味見してたから……見たって言ったら、味見がバレると思って……。'
      ], effects: [{ secret: 's_chef_saw_mayor' }, { set: 'chef_broke_nobody' }, { trust: ['chef', 5] }] },
      { id: 'cch_nobox', testimony: 't_chef_nobox', ev: ['ev_waybill', 'ev_lift_schedule'], lines: [
        { fx: 'objection' }, { se: 'objection' },
        'sakichi:shout|その話、ちょっと待つバウ！　8:40、箱1が配膳リフトで地下から厨房へ上がっている。手回しハンドルで引き上げたのは、厨房にいた犬だけバウ！',
        'chef:sad|……ブヒィ……。',
        'chef:sad|箱を開けたら、予備のちゅ〜るの上に……金ピカのケースが乗ってたブヒ。',
        'chef:sad|味見のことがあるのに、ボクが持ってたら絶対に犯犬にされると思って……冷蔵庫に……隠したブヒ……。'
      ], effects: [{ secret: 's_chef_hide' }, { set: 'chef_broke_nobox' }, { trust: ['chef', -5] }] }
    ],
    contraMiss: ['chef:sweat|ブヒ？　ボクの言ったこととそれ、関係あるブヒ？'],
    press: [
      { id: 'pch_fridge', ch: [4], show: { testimony: 't_chef_nobox' }, label: '冷蔵庫を開けてもいいか？', cond: { secret: 's_chef_hide' },
        lines: ['chef:sad|……もう隠せないブヒね。でも、みんなの前で開けるのは……最後まで待ってほしいブヒ。'],
        fail: ['chef:angry|ダメブヒ！　料理長の聖域ブヒ！', '|シェフは冷蔵庫の前に仁王立ちした。'] }
    ]
  };

  /* ================= ブサワン町長 ================= */
  D.talks.mayor = {
    topics: [
      { id: 'my1_speech', ch: [1], label: '町長のご挨拶', lines: [
        'mayor:smug|おお、名探偵佐吉殿！　よくぞ来てくださった！　ブサワンシティの未来は、そなたの鼻にかかっておる！',
        'mayor:smug|見よ、このワシの顔の輝き！　今日は祭りの日、ワシも黄金のように輝いておるのじゃ！',
        'sakichi:think|（本当に顔がキラキラしてるバウ……何か付いてるバウ？）'
      ] },
      { id: 'my1_case', ch: [1, 2, 3, 4], label: '黄金のちゅ〜るについて', lines: [
        'mayor:sad|黄金のちゅ〜るは、町の宝。金メッキのケースに入れて、保管室の展示台に飾っておったのじゃ。',
        'mayor:sweat|それが……消えた。本当に、消えてしまったのじゃ……。',
        'sakichi:think|（「本当に」……？　妙な言い方バウ）'
      ] },
      { id: 'my2_key', ch: [2, 3, 4], label: '今朝、鍵を借りたか', lines: [
        'mayor:angry|ワシが？　鍵を？　借りておらん！　断じて借りておらん！',
        'mayor:angry|ワシは何も聞いておらん！'
      ], testimony: 't_mayor_nokey' },
      { id: 'my3_safe', ch: [3], label: '金庫の番号', cond: { all: [{ route: 'D' }, { flag: 'saw_banner' }] }, lines: [
        'mayor:angry|金庫の番号など教えるわけがなかろう！　ワシの誕生日でもないし、ワンワンワンの日でもない！',
        'sakichi:smug|……ワンワンワンの日。2月22日バウね。',
        'mayor:surprised|ワ、ワシは何も聞いておらん！！'
      ], effects: [{ set: 'safe_hint' }] },
      { id: 'my2_banner', ch: [2, 3, 4], deep: true, parent: 'my1_case', label: '顔のキラキラについて', lines: [
        'mayor:sweat|こ、これは……朝の洗顔料じゃ！　最新の！　キラキラ洗顔じゃ！',
        'sakichi:think|（洗顔料で金粉が付くわけないバウ）'
      ] }
    ],
    present: [
      { ev: 'ev_gold_powder', lines: ['mayor:sweat|飾り付けの材料じゃと言うておろう！'] },
      { ev: 'ev_plan', lines: ['mayor:surprised|そ、それをどこで！？　ワシは何も……何も聞いておらんのじゃーーー！！'], effects: [{ trust: ['mayor', -10] }] },
      { ev: 'ev_drool', lines: ['mayor:sweat|よだれ？　ブルドッグなら誰でも垂らすものじゃ。ワシだけではない！'] }
    ],
    wrong: [
      ['mayor:smug|ふむ、見事な証拠じゃ！　……で、それが何か？'],
      ['mayor:angry|ワシは何も聞いておらん！'],
      ['mayor:normal|名探偵殿、ワシの演説を聞いていかんか？　三時間ほどじゃが。']
    ],
    contra: [
      { id: 'cmy_key', testimony: 't_mayor_nokey', ev: ['ev_key_log'], lines: [
        { fx: 'objection' }, { se: 'objection' },
        'sakichi:shout|その話、ちょっと待つバウ！　ペキ婆の帳面には「8:05 町長（最終確認）→8:13返却」とはっきり書いてあるバウ！',
        'mayor:surprised|ぐぬぬぬ……！',
        'mayor:angry|ワシは何も聞いておらん！！',
        'sakichi:sweat|聞いてなくても書いてあるバウ。',
        'mayor:sweat|……さ、最終確認じゃ！　ケースの！　確認しただけで、すぐ返したのじゃ！'
      ], effects: [{ secret: 's_mayor_key' }, { set: 'mayor_broke_key' }, { trust: ['mayor', -10] }] }
    ],
    contraMiss: ['mayor:angry|矛盾などない！　ワシは何も聞いておらん！'],
    press: [
      { id: 'pmy_plan', ch: [3, 4], show: { has: 'ev_plan' }, label: '「話題沸騰作戦」とは？', cond: { deduced: 'd_stunt' },
        lines: [
          'mayor:sad|………………。',
          'mayor:sad|最終推理の場で、全てを話そう。ワシは逃げも隠れもせん。……ただ、ちゅ〜るは本当に、どこへ行ったのじゃ……。'
        ],
        fail: ['mayor:angry|ワシは何も聞いておらんと言っておろうが！！'] }
    ]
  };

  /* ================= ペキ婆 ================= */
  D.talks.pekibaa = {
    topics: [
      { id: 'pk_rule', ch: [2, 3, 4], label: '鍵の管理について', lines: [
        'pekibaa:smug|保管室の鍵は一本きり。合鍵はない。誰に貸しても、分刻みで帳面に書くんじゃ。',
        'pekibaa:normal|帳面は嘘をつかんのじゃ。'
      ], testimony: 't_pekibaa_rule' },
      { id: 'pk_find', ch: [2, 3, 4], label: '消失を見つけたとき', lines: [
        'pekibaa:normal|8:28、いつもの点検で扉を開けたら、台の上が空っぽじゃった。腰が抜けたわい。',
        'pekibaa:normal|扉はちゃんと鍵がかかっておった。床が濡れておって、取っ手はべとべとじゃったな。'
      ] },
      { id: 'pk_tea', ch: [2, 3, 4], deep: true, parent: 'pk_rule', label: '鍵番四十年の話を聞く', lines: [
        'pekibaa:happy|おや、年寄りの話を聞いてくれるのかい。',
        '|ペキ婆の四十年にわたる鍵番の思い出話は、長かった。とても長かった。',
        'pekibaa:happy|……というわけで、昭和の大鍵紛失事件は、鍵がわしの毛の中に埋まっておったのじゃ。',
        'sakichi:sweat|（長かったバウ……でもペキ婆さん、嬉しそうバウ）'
      ], effects: [{ trust: ['pekibaa', 12] }] }
    ],
    present: [
      { ev: 'ev_camera_gap', lines: ['pekibaa:normal|ほう、映像まで確かめとるのかい。ちゃんと調べとる探偵は嫌いじゃないよ。'], effects: [{ trust: ['pekibaa', 6] }] },
      { ev: 'ev_drool', lines: ['pekibaa:normal|取っ手のよだれかい。わしが点検に来たときにはもう付いとったよ。'], effects: [{ trust: ['pekibaa', 4] }] },
      { ev: 'ev_key_log', lines: ['pekibaa:smug|帳面に書いてあることが全てじゃ。わしは嘘は書かん。'] }
    ],
    wrong: [
      ['pekibaa:normal|はて。年寄りにはよくわからんのう。'],
      ['pekibaa:angry|それより、ちゃんとお茶でも飲んでいかんかい。'],
      ['pekibaa:normal|わしの帳面には書いてないことじゃな。']
    ],
    contra: [],
    contraMiss: ['pekibaa:angry|わしの言うことに嘘はないよ。'],
    press: []
  };

  /* ================= ポン太 ================= */
  D.talks.ponta = {
    topics: [
      { id: 'pn_saw', ch: [2, 3, 4], label: '今朝見たこと', lines: [
        'ponta:excited|スクープですワン！　時計台がちょうど8時を指したとき、ゴンザレスさんが広場を全速力で走っていきましたワン！',
        'ponta:normal|ぼく、時刻はいつも時計台で確かめるんですワン。町一番正確な時計ですから！'
      ], testimony: 't_ponta_8' },
      { id: 'pn_camera', ch: [2, 3, 4], deep: true, parent: 'pn_saw', label: 'ご自慢のカメラ', lines: [
        'ponta:happy|おじいちゃんの形見のカメラですワン！　撮った時刻もちゃんと記録されるんですワン。',
        'ponta:excited|ゴンザレスさんの写真もありますよ！　見ますワン？',
        { se: 'found' },
        '|全力疾走するゴンザレスの写真。背景の時計台は8:00。空は雲一つない青空。',
        'sakichi:think|写真の隅に、カメラの記録時刻が……「8:16」？'
      ], effects: [{ give: 'ev_photo' }] },
      { id: 'pn_weather', ch: [2, 3, 4], label: '今朝の天気', lines: [
        'ponta:normal|雨は7時半ぴったりに止みましたワン。それからはずーっと快晴ですワン。雷？　一回も鳴ってませんワン。',
        'sakichi:think|（雷は鳴っていない……）'
      ] }
    ],
    present: [
      { ev: 'ev_clock', lines: [
        'sakichi:normal|ポン太くん、時計台をよく見てほしいバウ。さっきからずっと8:00なんだバウ。',
        'ponta:surprised|ほ、本当だワン！　止まってる！？',
        'ponta:normal|じゃ、じゃあ、ぼくがゴンザレスさんを見たのは何時……そうだ、写真の記録を見てくださいワン！',
        { se: 'found' },
        '|全力疾走するゴンザレスの写真。背景の時計台は8:00。だがカメラの記録は「8:16」。空は雲一つない青空。'
      ], effects: [{ give: 'ev_photo' }, { trust: ['ponta', 10] }] }
    ],
    wrong: [
      ['ponta:excited|スクープですかワン！？　……ちがう？　残念ですワン。'],
      ['ponta:normal|メモしておきますワン！　（何に使うかはわからないけど）'],
      ['ponta:happy|探偵さん、かっこいいですワン！']
    ],
    contra: [
      { id: 'cpn_8', testimony: 't_ponta_8', ev: ['ev_clock'], lines: [
        'sakichi:normal|ポン太くん。時計台は8:00で止まっていたバウ。だから君が見た時刻は8時じゃないバウ。',
        'ponta:surprised|ええっ！？　じゃ、じゃあ記事を書き直さなきゃですワン……！',
        'ponta:normal|写真の記録時刻は「8:16」ですワン。こっちが本当ですワン！'
      ], effects: [{ give: 'ev_photo' }] }
    ],
    contraMiss: ['ponta:surprised|ぼくの記憶違いですかワン！？　……あれ、違うんですかワン？'],
    press: []
  };

  /* 場所にいない（会えない）条件 */
  D.absent = {};
})(typeof window !== 'undefined' ? window : globalThis);
