/* シナリオ本文（章ごとのイベントシーン）
 * 行の書式 "話者:表情|本文"、ナレーションは "|本文"。
 * 命令：{bg}{bgm}{se}{fx}{show}{effects}{choice}{jump}{branch}{hub}{final}{card}
 */
(function (G) {
  var D = G.GAME_DATA = G.GAME_DATA || {};
  var S = D.scenes = D.scenes || {};

  /* ================= プロローグ ================= */
  S.prologue = [
    { bg: 'town' }, { bgm: 'title' }, { show: [] },
    { card: 'プロローグ', sub: 'ブサワンシティの朝' },
    '|ここはブサワンシティ。しわしわの顔、ぺちゃんこの鼻、ちょっと出っ歯。愛すべきブサ犬だけが暮らす町。',
    '|今日は年に一度の「世界ちゅ〜る祭り」。町じゅうが甘い香りに包まれる、一年で一番しあわせな日――のはずだった。',
    { bg: 'office_sakichi' }, { bgm: 'comedy' },
    '|町はずれの古いビルの二階。「佐吉探偵事務所」。',
    'sakichi:sleep|すぴー……すぴー……ちゅ〜る……むにゃ……。',
    { se: 'phone' },
    'sakichi:surprised|はっ！　電話バウ！　……もしもし、佐吉探偵事務所バウ。',
    'buhita:excited|名探偵！　大事件ブヒ！　祭りの目玉、黄金のちゅ〜るが消えたブヒーーー！！',
    'sakichi:surprised|お、黄金の……ちゅ〜る……？',
    'sakichi:drool|………………。',
    'buhita:normal|名探偵？　聞いてるブヒ？',
    'sakichi:shout|すぐ行くバウ！！　ちゅ〜るのためなら、たとえ火の中水の中バウ！',
    'buhita:normal|ちゅ〜るのためじゃなくて、事件のためブヒ。',
    { se: 'door' },
    '|こうして、名探偵・佐吉の長い一日が始まった。',
    { jump: 'c1_intro' }
  ];

  /* ================= 第1章 ================= */
  S.c1_intro = [
    { bg: 'plaza' }, { bgm: 'comedy' }, { show: [] },
    { card: '第1章', sub: '黄金のちゅ〜る消失事件' },
    { effects: [{ chapter: 1 }] },
    '|9時20分。祭りの広場は、開会式の延期でざわついていた。',
    { se: 'bark' },
    'buhita:excited|名探偵！　待ってたブヒ！',
    'sakichi:normal|ブヒ田刑事。状況を教えてほしいバウ。',
    'buhita:normal|8時28分、鍵番のペキ婆が点検で保管室を開けたら、黄金のちゅ〜るがケースごと消えてたブヒ。扉には鍵がかかってた。完全な密室ブヒ！',
    'mayor:shout|おおお、名探偵佐吉殿！！',
    { show: ['mayor', 'buhita'] },
    'mayor:sad|黄金のちゅ〜るは町の宝！　10時からはテレビの生中継も控えておる！　どうか、どうか見つけてくだされ！',
    'sakichi:think|（顔がキラキラしてるバウ……）　お任せくださいバウ。',
    'mayor:smug|うむ！　期待しておるぞ！　ワシはこれから記者会見じゃ！　ワシは何も聞いておらんがな！',
    '|町長は、なぜか少し安心したような顔で去っていった。',
    { show: ['buhita'] },
    'buhita:normal|容疑犬は四匹ブヒ。監視システムのボス・トン、力持ちのゴンザレス、スポンサーのマダム・サキ、料理長のシェフ・ブヒーノ。',
    'buhita:excited|あと、ちゅ〜るは地下倉庫の箱7あたりにある気がするブヒ！',
    'sakichi:think|……その根拠は？',
    'buhita:smug|刑事の勘ブヒ！',
    'sakichi:normal|わかったバウ。まずは現場を調べて、容疑犬たちから話を聞くバウ。',
    { card: '捜査開始', sub: '「調べる」「話す」「移動する」で現場を捜査しよう' },
    { hub: 1, loc: 'storage' }
  ];

  S.c1_end = [
    { bg: 'plaza' }, { bgm: 'mystery' }, { show: ['buhita'] },
    'buhita:normal|名探偵、一通り調べたブヒね。で、誰が一番怪しいブヒ？',
    'sakichi:think|うーん……。',
    'sakichi:think|まだ真相は見えない。でも捜査は「疑うこと」から始まるバウ。まず誰から洗うか、決めるバウ。',
    { choice: [
      { id: 'c1_sus_gonzalez', label: '靴下の持ち主、ゴンザレスが怪しい', next: 'c1_sus_g', effects: [{ trust: ['gonzalez', -10] }, { set: 'sus_gonzalez' }] },
      { id: 'c1_sus_bosston', label: '映像を消せるボス・トンが怪しい', next: 'c1_sus_b', effects: [{ trust: ['bosston', -10] }, { set: 'sus_bosston' }] },
      { id: 'c1_sus_chef', label: 'ちゅ〜るに一番近いシェフが怪しい', next: 'c1_sus_c', effects: [{ trust: ['chef', -10] }, { set: 'sus_chef' }] },
      { id: 'c1_sus_madame', label: '影を見たというマダムが怪しい', next: 'c1_sus_m', effects: [{ trust: ['madame', -10] }, { set: 'sus_madame' }] }
    ], prompt: '最初に疑う犬は？' }
  ];
  S.c1_sus_g = [
    'sakichi:normal|現場に靴下を落としたゴンザレスさん。まずは彼から洗うバウ。',
    'buhita:excited|さすが名探偵ブヒ！　ボクもそう思ってたブヒ！',
    'gonzalez:angry|聞こえてるぞ！！　オ、オレじゃねえぞ！！',
    { jump: 'c1_close' }
  ];
  S.c1_sus_b = [
    'sakichi:normal|映像を自由に消せるのはボス・トンさん。まずは彼から洗うバウ。',
    'bosston:smug|ほう、私を疑うか。論理的な判断とは言いがたいね。',
    { jump: 'c1_close' }
  ];
  S.c1_sus_c = [
    'sakichi:normal|ちゅ〜るに一番近い場所にいたのはシェフ。まずは彼から洗うバウ。',
    'chef:sweat|ブヒィ！？　ボ、ボクは味見しか……じゃなくて、何もしてないブヒ！',
    { jump: 'c1_close' }
  ];
  S.c1_sus_m = [
    'sakichi:normal|都合よく「怪しい影」を見たマダム・サキ。まずは彼女から洗うバウ。',
    'madame:smug|あら、光栄ですわ。わたくしを疑うなんて、度胸のある探偵さん。',
    { jump: 'c1_close' }
  ];
  S.c1_close = [
    { se: 'clock' },
    '|そのとき、広場の時計台が――鳴らなかった。',
    'sakichi:think|……10時の鐘、まだ鳴らないバウ？',
    'buhita:normal|まだ8時ブヒ。時計台がそう言ってるブヒ。',
    'sakichi:sweat|そ、そうバウ？　……なんか、ずっと8時な気がするバウ。',
    { jump: 'c2_intro' }
  ];

  /* ================= 第2章 ================= */
  S.c2_intro = [
    { bg: 'plaza' }, { bgm: 'mystery' }, { show: [] },
    { card: '第2章', sub: '全員が嘘つき？' },
    { effects: [{ chapter: 2 }] },
    { branch: [
      { cond: { flag: 'sus_gonzalez' }, next: 'c2_open_g' },
      { cond: { flag: 'sus_bosston' }, next: 'c2_open_b' },
      { cond: { flag: 'sus_chef' }, next: 'c2_open_c' }
    ], 'else': 'c2_open_m' }
  ];
  S.c2_open_g = [
    'gonzalez:angry|おい探偵！　オレを疑ってるって本当か！　オレは広場にいたんだ！　証犬だっているんだぞ！',
    'sakichi:normal|それなら、その証犬に話を聞かせてもらうバウ。',
    { jump: 'c2_common' }
  ];
  S.c2_open_b = [
    'bosston:smug|私を疑っているそうだね。ならば私は、監視室で論理的に待っていよう。逃げも隠れもしない。',
    'sakichi:normal|（自信満々バウ……でも、何か隠してる匂いがするバウ）',
    { jump: 'c2_common' }
  ];
  S.c2_open_c = [
    'chef:sweat|名探偵さん、ボクのこと疑ってるブヒ？　ボ、ボクの厨房は清潔そのものブヒ！　冷蔵庫以外は見ていいブヒ！',
    'sakichi:think|（冷蔵庫以外……？）',
    { jump: 'c2_common' }
  ];
  S.c2_open_m = [
    'madame:smug|わたくしを疑っていらっしゃるのね。よろしくてよ。でも、品のない捜査はお断りですわ。',
    'sakichi:normal|（簡単には口を割りそうにないバウ）',
    { jump: 'c2_common' }
  ];
  S.c2_common = [
    { show: ['buhita'] },
    'buhita:normal|名探偵、厨房と鍵番小屋と町長の執務室にも入れるようになったブヒ。',
    'sakichi:normal|ありがとうバウ。みんなのアリバイを確かめるバウ。',
    'sakichi:think|大事なのは「嘘をついているか」じゃないバウ。「なぜ嘘をついたのか」だバウ。嘘つきが犯犬とは限らないバウ。',
    'buhita:surprised|嘘つきは泥棒の始まりじゃないブヒ！？',
    'sakichi:normal|始まりかもしれないけど、終わりとは限らないバウ。',
    { card: '捜査再開', sub: '証言の矛盾を見つけたら「矛盾を指摘する」で突きつけよう' },
    { hub: 2, loc: 'plaza' }
  ];
  S.c2_end = [
    { bg: 'storage' }, { bgm: 'mystery' }, { show: ['buhita'] },
    'sakichi:think|整理するバウ。鍵の記録、止まった時計、金色の粉、合わない在庫……。',
    'sakichi:think|みんな嘘をついている。でも嘘の向きがバラバラだバウ。一つの事件を、何匹もの犬がそれぞれの理由で隠してる……そんな匂いがするバウ。',
    'buhita:normal|名探偵、次はどこから攻めるブヒ？',
    { jump: 'c3_intro' }
  ];

  /* ================= 第3章 ================= */
  S.c3_intro = [
    { bg: 'storage' }, { bgm: 'tense' }, { show: ['buhita'] },
    { card: '第3章', sub: 'よだれは嘘をつかない' },
    { effects: [{ chapter: 3 }] },
    'sakichi:normal|時間がないバウ。10時の中継まであとわずか。全部は追えない。一本の糸に絞るバウ。',
    { choice: [
      { id: 'route_A', label: '【映像】監視映像と時刻を追う', next: 'c3_A', effects: [{ route: 'A' }] },
      { id: 'route_B', label: '【在庫】ちゅ〜るの在庫と輸送記録を追う', next: 'c3_B', effects: [{ route: 'B' }] },
      { id: 'route_C', label: '【物証】足跡と現場の物証を追う', next: 'c3_C', effects: [{ route: 'C' }] },
      { id: 'route_D', label: '【秘密】町長とマダムの秘密を追う', next: 'c3_D', effects: [{ route: 'D' }] }
    ], prompt: '捜査方針を選ぶ（この章では一つだけ）' }
  ];
  S.c3_A = [
    'sakichi:normal|消えた3分間。あそこに全部が詰まってる気がするバウ。監視室に戻るバウ。',
    'buhita:normal|ボス・トンの理屈攻めに負けちゃダメブヒ。',
    { bg: 'monitor' }, { show: ['bosston'] },
    'bosston:smug|また来たのかね。何度見ても、映像は落雷で途切れているよ。',
    'sakichi:normal|今度は管理端末と、カメラ2の記録を見せてもらうバウ。',
    'bosston:sweat|カ、カメラ2は……。',
    { hub: 3, loc: 'monitor' }
  ];
  S.c3_B = [
    'sakichi:normal|数の合わないちゅ〜る。数は嘘をつかないバウ。厨房と搬入口を洗うバウ。',
    'buhita:normal|厨房はいい匂いがするブヒ。名探偵、よだれに気をつけるブヒ。',
    { bg: 'backdoor' },
    '|厨房の裏通路。床はまだしっとり濡れていて、かつおだしの香りが立ち込めている。',
    'sakichi:drool|……いい匂いバウ……はっ、捜査、捜査バウ。',
    { hub: 3, loc: 'backdoor' }
  ];
  S.c3_C = [
    'sakichi:normal|物は嘘をつかないバウ。足跡、靴下、傷。現場の物をもう一度洗い直すバウ。',
    'buhita:excited|地下倉庫の入口も調べられるブヒ！　地下はいいブヒよ、地下は！',
    { bg: 'gate' },
    '|地下倉庫の入口。ひやりとした風が吹き上がってくる。',
    { hub: 3, loc: 'gate' }
  ];
  S.c3_D = [
    'sakichi:normal|町長は「本当に」消えたと言った。マダムは「台本どおり」と口を滑らせた。偉い犬たちの秘密を追うバウ。',
    'buhita:sweat|お、お偉いさんを疑うブヒ！？　ボクの首が飛ぶブヒ……。',
    'sakichi:normal|首輪は飛んでも首は飛ばないバウ。行くバウ。',
    { bg: 'office' },
    { hub: 3, loc: 'office' }
  ];
  S.c3_end = [
    { bg: 'plaza' }, { bgm: 'tense' }, { show: ['buhita'] },
    { branch: [
      { cond: { route: 'A' }, next: 'c3_end_A' },
      { cond: { route: 'B' }, next: 'c3_end_B' },
      { cond: { route: 'C' }, next: 'c3_end_C' }
    ], 'else': 'c3_end_D' }
  ];
  S.c3_end_A = [
    'sakichi:think|映像は止められた。止めたのはボス・トンさん。でも止めた犬は保管室に入っていない……。',
    'sakichi:think|カメラ2に映っていたあの光る後ろ姿。あれが、本当に保管室へ向かった犬だバウ。',
    { jump: 'c3_close' }
  ];
  S.c3_end_B = [
    'sakichi:think|ケースは8:11にリフトで地下へ。そして8:40、地下から厨房へ箱1が上がってきた……。',
    'sakichi:think|ケースは扉からじゃなく、ちゅ〜るの通り道を旅していたんだバウ。',
    { jump: 'c3_close' }
  ];
  S.c3_end_C = [
    'sakichi:think|7:40に採寸、行き先は箱7。地下の扉は内側から壊されて、8:16に広場を全力疾走……。',
    'sakichi:think|ゴンザレスさんは押し入ったんじゃない。何かから逃げ出したんだバウ。',
    { jump: 'c3_close' }
  ];
  S.c3_end_D = [
    'sakichi:think|事件の前からあった「消失！？」の看板。箱7で発見する計画。目撃者役の台本……。',
    'sakichi:think|消失は仕組まれていた。でも町長は「本当に消えた」と青ざめていた。計画のどこかが狂ったんだバウ。',
    { jump: 'c3_close' }
  ];
  S.c3_close = [
    'buhita:excited|名探偵！　どの道を通っても、最後は地下倉庫ブヒ！　箱7ブヒ！',
    'sakichi:normal|……ブヒ田刑事、そこまで言うなら行くバウ。地下倉庫へ。',
    { jump: 'c4_intro' }
  ];

  /* ================= 第4章 ================= */
  S.c4_intro = [
    { bg: 'gate' }, { bgm: 'tense' }, { show: ['buhita'] },
    { card: '第4章', sub: '地下倉庫の秘密' },
    { effects: [{ chapter: 4 }] },
    '|地下倉庫の入口。壊れた扉はすでに係員が脇へ片付けていた。',
    { se: 'step' },
    'sakichi:sweat|く、暗いバウ……。',
    { bg: 'warehouse' }, { show: ['buhita', 'gonzalez'] },
    'gonzalez:sweat|お、オレも行く。……い、行かなきゃいけねえ気がするんだ。',
    'buhita:excited|箱7！　箱7はどこブヒ！',
    'sakichi:normal|落ち着くバウ。順番に調べるバウ。伝票と、箱の棚から。',
    { hub: 4, loc: 'warehouse' }
  ];
  S.c4_end = [
    { bg: 'warehouse' }, { bgm: 'tense' }, { show: ['buhita', 'gonzalez'] },
    'sakichi:think|空っぽの箱7。消された受領欄。……答えはもう、すぐそこにある気がするバウ。',
    'sakichi:think|でも、この先を一匹で全部見通すのは無理バウ。誰かの力を借りる必要があるバウ。',
    { show: [] },
    '|地下倉庫に、関係者たちが集まってきた。ブヒ田刑事、マダム・サキ、ボス・トン、シェフ・ブヒーノ。',
    { show: ['madame', 'bosston', 'chef'] },
    'madame:normal|名探偵さん。わたくしにお話ししたいことがございますの。',
    'bosston:normal|探偵くん、私にもまだ出せる情報がある。',
    'chef:sweat|ボ、ボクも……ちょっとだけなら……。',
    'buhita:sad|名探偵……ボクも、言わなきゃいけないことがあるブヒ。',
    { choice: [
      { id: 'trust_buhita', label: 'ブヒ田刑事を信頼する', next: 'c4_t_buhita', effects: [{ trust: ['buhita', 20] }] },
      { id: 'trust_madame', label: 'マダム・サキを信頼する', next: 'c4_t_madame', effects: [{ trust: ['madame', 20] }] },
      { id: 'trust_bosston', label: 'ボス・トンを信頼する', next: 'c4_t_bosston', effects: [{ trust: ['bosston', 20] }] },
      { id: 'trust_chef', label: 'シェフ・ブヒーノを信頼する', next: 'c4_t_chef', effects: [{ trust: ['chef', 20] }] }
    ], prompt: '誰を信頼する？（一匹だけ）' }
  ];
  S.c4_t_buhita = [
    { show: ['buhita'] },
    'sakichi:normal|ブヒ田刑事。話してほしいバウ。',
    'buhita:sad|……ずっと黙っててごめんブヒ。昨日、町長からこれを渡されたブヒ。',
    { se: 'found' },
    '|ブヒ田刑事が手帳から一枚のメモを差し出した。「明日10時、名探偵を地下倉庫の箱7へ導くべし。テレビ中継を用意しておく――町長」',
    'buhita:sad|町長は何か掴んでて、手柄を名探偵にくれるつもりなんだと思ってたブヒ。でも……箱7は空っぽだったブヒ。',
    'sakichi:normal|話してくれてありがとうバウ。ブヒ田刑事は、やっぱりボクの相棒バウ。',
    'buhita:happy|め、名探偵ぃ……ブヒィィ……！',
    { effects: [{ give: 'ev_buhita_order' }, { secret: 's_buhita_order' }] },
    { jump: 'c4_disclose' }
  ];
  S.c4_t_madame = [
    { show: ['madame'] },
    'sakichi:normal|マダム。お話を聞かせてほしいバウ。',
    { branch: [{ cond: { has: 'ev_pact' }, next: 'c4_t_madame2' }], 'else': 'c4_t_madame1' }
  ];
  S.c4_t_madame1 = [
    'madame:sad|……あなたなら、町の名誉を正しく扱ってくださると信じますわ。',
    { se: 'found' },
    '|マダムは扇子の奥から一枚の書類を差し出した。「秘密協定書」。町長とマダムの署名入り。',
    'madame:sad|「目撃者役：マダム。8:15、保管室前に怪しい影」。わたくしの証言は、台本でしたの。',
    { effects: [{ give: 'ev_pact' }, { secret: 's_madame_script' }] },
    { jump: 'c4_disclose' }
  ];
  S.c4_t_madame2 = [
    'madame:sad|協定書はもうお持ちね。なら、わたくしの口から申し上げますわ。8:15の影は、台本でしたの。',
    'madame:normal|でもね、名探偵さん。台本では、ケースは今ごろ箱7の中のはずでしたのよ。それが空っぽ。ここから先は、台本にない物語ですわ。',
    { effects: [{ secret: 's_madame_script' }, { set: 'madame_broken' }] },
    { jump: 'c4_disclose' }
  ];
  S.c4_t_bosston = [
    { show: ['bosston'] },
    'sakichi:normal|ボス・トンさん。出せる情報、全部出してほしいバウ。',
    { branch: [{ cond: { has: 'ev_fragment' }, next: 'c4_t_bosston2' }], 'else': 'c4_t_bosston1' }
  ];
  S.c4_t_bosston1 = [
    'bosston:sad|……いいだろう。君の論理に賭けよう。廊下カメラ2の記録だ。パスワードは……さっき思い出した。',
    { se: 'found' },
    '|ボス・トンのタブレットに、8:06の映像。濡れた床を、金色に光る大柄な後ろ姿が保管室の方へ歩いていく。',
    'bosston:sad|私が保管室カメラを止めたのは事実だ。だがカメラ2は止められなかった。……パスワードを忘れていたからね。',
    { effects: [{ give: 'ev_fragment' }, { secret: 's_bt_password' }] },
    { jump: 'c4_disclose' }
  ];
  S.c4_t_bosston2 = [
    'bosston:sad|カメラ2の映像はもう君の手にある。なら言うことは一つだ。私に3分間の停止を頼んだのは、町長だよ。',
    { effects: [{ secret: 's_bt_manual' }, { set: 'bt_broke' }] },
    { jump: 'c4_disclose' }
  ];
  S.c4_t_chef = [
    { show: ['chef'] },
    'sakichi:normal|シェフ。話してほしいバウ。',
    { branch: [{ cond: { has: 'ev_lift_schedule' }, next: 'c4_t_chef2' }], 'else': 'c4_t_chef1' }
  ];
  S.c4_t_chef1 = [
    'chef:sad|……搬入口の記録盤、これが今朝の分ブヒ。ボク、見なかったことにしようとしてたブヒ。',
    { se: 'found' },
    '|紙テープ。「8:11 保管室→地下」「8:40 地下→厨房（箱1・手回し）」',
    { effects: [{ give: 'ev_lift_schedule' }] },
    { jump: 'c4_disclose' }
  ];
  S.c4_t_chef2 = [
    'chef:sad|運行表はもう持ってるブヒね……。名探偵さん、ボク、怖いブヒ。でも名探偵さんなら、ちゃんと聞いてくれる気がするブヒ。',
    { effects: [{ trust: ['chef', 10] }] },
    { jump: 'c4_disclose' }
  ];
  S.c4_disclose = [
    { show: ['buhita', 'chef'] },
    'sakichi:think|もう一つ決めなきゃいけないバウ。この輸送伝票――「箱1は8:40に厨房へ届いた。受領欄は消された」……。',
    'sakichi:think|今ここでみんなに公表すれば、隠した犬は追い詰められる。でも、追い詰められた犬は本当のことを言わなくなるかもしれないバウ。',
    { choice: [
      { id: 'disclose', label: '輸送伝票の件を、みんなの前で公表する', next: 'c4_open' },
      { id: 'conceal', label: '今は伏せて、相手が話すのを待つ', next: 'c4_hide' }
    ], prompt: '重要証拠をどうする？' }
  ];
  S.c4_open = [
    { fx: 'shake' },
    'sakichi:shout|みんな聞いてほしいバウ！　箱1は8:40に厨房へ届いている！　なのに受領欄が消されているバウ！',
    'chef:surprised|ブヒィィィッ！！',
    '|シェフ・ブヒーノは真っ青になって、地下倉庫から逃げ出していった。',
    'madame:normal|……隠し事を明るみに出す勇気。嫌いじゃありませんわ。',
    'buhita:excited|逃げたブヒ！　犯犬はシェフで決まりブヒ！',
    'sakichi:think|……それを決めるのは、最後の推理バウ。',
    { effects: [{ trust: ['chef', -20] }, { trust: ['madame', 10] }, { set: 'disclosed' }] },
    { jump: 'c4_close' }
  ];
  S.c4_hide = [
    'sakichi:normal|（今はまだ言わないバウ）',
    '|佐吉は伝票をそっとポケットにしまった。',
    '|しばらくして、皆が地上へ戻りかけたとき――シェフが佐吉の袖をくいっと引いた。',
    'chef:sad|……名探偵さん。これ、あとで読んでほしいブヒ。',
    { se: 'found' },
    '|油の染みたメモ。「探偵さんだけに。箱1を開けたら金ピカのケースが……怖くて冷蔵庫の『味見用』の段に入れたブヒ」',
    'sakichi:normal|（……ありがとうバウ、シェフ）',
    { effects: [{ trust: ['chef', 20] }, { give: 'ev_chef_note' }, { secret: 's_chef_hide' }, { set: 'concealed' }] },
    { jump: 'c4_close' }
  ];
  S.c4_close = [
    { show: ['buhita'] },
    'buhita:normal|名探偵、町長が広場にみんなを集めてるブヒ。中継の時間ブヒ。',
    'sakichi:normal|わかったバウ。……そこで全部、終わらせるバウ。',
    { jump: 'c5_intro' }
  ];

  /* ================= 第5章 ================= */
  S.c5_intro = [
    { bg: 'stage' }, { bgm: 'climax' }, { show: [] },
    { card: '第5章', sub: '犯犬はお前だバウ！' },
    { effects: [{ chapter: 5 }] },
    '|10時。祭りの広場のステージ。テレビカメラの赤いランプが一斉に灯る。',
    { show: ['mayor'] },
    'mayor:smug|ブサワンシティの皆さん！　お待たせした！　名探偵佐吉殿が、黄金のちゅ〜る消失事件の真相を明かしてくださる！',
    'mayor:sweat|……な、なにとぞ、穏便に……。',
    { show: ['madame', 'bosston', 'gonzalez'] },
    '|容疑犬たちがステージに並ぶ。マダム・サキ、ボス・トン、ゴンザレス。少し離れてシェフ・ブヒーノ。',
    { show: ['buhita'] },
    'buhita:excited|名探偵！　ビシッと決めてやるブヒ！',
    'sakichi:normal|……。',
    'sakichi:think|証拠は揃った。あとは、どう組み立てるか。犯犬、動機、トリック、そして決め手の証拠。',
    'sakichi:think|一つでも間違えたら、ボクはただの迷探偵バウ。',
    'sakichi:think|……最後に手に入れた証拠も、推理ノートで組み合わせておくバウ。',
    { se: 'objection' }, { fx: 'flash' },
    'sakichi:shout|皆さん、お待たせしたバウ。この事件の真相を――今から明らかにするバウ！',
    { final: true }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
