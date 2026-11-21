"""
ブラウザE2Eテスト（Playwright / Chromium）
 - スマホ縦画面で、UIを実際にクリックしてトゥルーエンドとEND1まで通しプレイ
 - セーブ→再読み込み→ロードで証拠・信頼度・フラグが復元されるか
 - 壊れたセーブデータ・壊れた周回データでも起動するか
 - 音声APIが無い環境でも進行できるか
 - PC・横画面・縦画面で、ボタンのサイズと画面外へのはみ出しを確認
使い方： node tools/serve.js 8080 を起動した状態で python3 tests/ui_e2e.py
"""
import json, re, sys, os
from playwright.sync_api import sync_playwright

URL = os.environ.get('SAKICHI_URL', 'http://localhost:8080/')
SHOTS = os.environ.get('SAKICHI_SHOTS', '')
FAST = json.dumps({"ver": 1, "endings": {}, "read": {}, "settings": {"bgm": 0, "se": 0, "mute": True, "textSpeed": 4, "autoWait": 0.8, "skipUnread": False, "fontSize": 1}, "deductionsEver": [], "clears": 0})
results = []

def ok(name, cond, detail=''):
    results.append((name, bool(cond), detail))
    print(('PASS ' if cond else 'FAIL ') + name + ((' — ' + detail) if detail else ''))

def shot(pg, name):
    if SHOTS:
        pg.screenshot(path=os.path.join(SHOTS, name + '.png'))

class Player:
    def __init__(self, pg):
        self.pg = pg
    def ev(self, js, arg=None):
        return self.pg.evaluate(js, arg)
    def mode(self):
        return self.ev('SakichiUI.getMode()')
    def vis(self, sel):
        return self.pg.is_visible(sel)
    def settle(self, ms=60):
        self.pg.wait_for_timeout(ms)
    def advance(self, plan=()):
        """会話を進める。選択肢は plan の文字列を含むものを選ぶ。止まったら mode を返す"""
        for _ in range(4000):
            if self.vis('#card'):
                self.pg.click('#card'); self.settle(); continue
            if self.vis('#choices'):
                btns = self.pg.locator('#choices .choice')
                labels = btns.all_inner_texts()
                idx = 0
                for i, l in enumerate(labels):
                    if any(p in l for p in plan): idx = i; break
                btns.nth(idx).click(); self.settle(); continue
            if self.vis('#dialog') and not self.vis('#panel'):
                self.pg.click('#text'); self.settle(25); continue
            return self.mode()
        raise RuntimeError('advance runaway')
    def cmd(self, label):
        self.pg.locator('#commands .cmd', has_text=label).first.click(); self.settle()
    def item(self, text, regex=False):
        loc = self.pg.locator('#panel .item')
        if regex:
            loc = loc.filter(has=self.pg.locator('.main', has_text=re.compile(text)))
        else:
            loc = loc.filter(has_text=text)
        loc.first.click(); self.settle()
    def btn(self, text):
        self.pg.locator('#panel .btn', has_text=text).first.click(); self.settle()
    def close_panel(self):
        if self.vis('#panel') and self.vis('#panel-close'):
            self.pg.click('#panel-close'); self.settle()

    # ---- 状態をもとに「やるべきこと」を判断（実行は必ずクリック） ----
    ORACLE = r"""() => {
      const C = SakichiCore, D = GAME_DATA, st = SakichiUI.getState();
      const name = id => D.evidence[id].name;
      const out = { loc: st.loc, locs: C.locations(st).map(l => ({id: l.id, name: l.name})), people: {}, combos: [], sig: '' };
      out.targets = C.targets(st, st.loc).filter(t => ['new','again'].includes(C.targetStatus(st, t))).length;
      for (const p of C.peopleHere(st)) {
        const td = D.talks[p];
        out.people[p] = {
          name: D.characters[p].name,
          topics: C.topics(st, p, false).filter(t => !st.heard[t.id]).length,
          deep: C.topics(st, p, true).filter(t => !st.heard[t.id]).length,
          presents: (td.present||[]).filter(x => st.evidence.includes(x.ev) && (!x.ch || x.ch.includes(st.chapter)) && C.evalCond(st, x.cond) && !st.heard['present:'+p+':'+x.ev+':'+(x.id||0)]).map(x => name(x.ev)),
          contras: (td.contra||[]).filter(c => st.testimonies.includes(c.testimony) && !st.heard['contra:'+c.id] && C.evalCond(st, c.cond) && c.ev.some(e => st.evidence.includes(e)))
                     .map(c => [D.testimonies[c.testimony].text, name(c.ev.find(e => st.evidence.includes(e)))]),
          presses: C.presses(st, p).filter(x => !st.heard['press:'+x.id] && C.evalCond(st, x.cond)).map(x => x.label)
        };
      }
      const ev = st.evidence;
      for (const d of D.deductions) if (!st.deductions.includes(d.id)) {
        const pr = d.pairs.find(pp => ev.includes(pp[0]) && ev.includes(pp[1]));
        if (pr) out.combos.push([name(pr[0]), name(pr[1])]);
      }
      out.sig = [ev.length, st.secrets.length, st.deductions.length, Object.keys(st.heard).length, Object.values(st.investigated).flat().length, st.loc].join(',');
      out.canFinish = C.canFinishChapter(st);
      return out;
    }"""

    def go(self, locname):
        self.cmd('移動する'); self.item('^' + re.escape(locname), regex=True); self.advance()

    def open_talk(self, pname, people_count):
        self.cmd('話す')
        if people_count > 1: self.item(pname)

    def combine(self, a, b):
        self.cmd('推理する') if self.mode() == 'hub' else self.pg.locator('#commands .cmd', has_text='推理ノート').first.click()
        self.settle()
        self.item('^' + re.escape(a), regex=True); self.item('^' + re.escape(b), regex=True)
        self.pg.locator('#panel .btn', has_text='組み合わせる').click(); self.settle()
        self.advance(); self.close_panel()

    def explore_hub(self):
        for _ in range(30):
            o = self.ev(self.ORACLE)
            before = o['sig']
            for L in o['locs']:
                o = self.ev(self.ORACLE)
                if o['loc'] != L['id']:
                    self.go(L['name']); o = self.ev(self.ORACLE)
                while o['targets'] > 0:
                    self.cmd('調べる')
                    self.pg.locator('#panel .item').filter(has=self.pg.locator('.b-new, .b-again')).first.click(); self.settle()
                    self.advance(); o = self.ev(self.ORACLE)
                for pid in list(o['people'].keys()):
                    P = o['people'][pid]
                    n = len(o['people'])
                    if not (P['topics'] or P['deep'] or P['presents'] or P['contras'] or P['presses']): continue
                    self.open_talk(P['name'], n)
                    while True:
                        P = self.ev(self.ORACLE)['people'][pid]
                        if P['topics']:
                            self.btn('話す'); self.advance(); continue
                        if P['deep']:
                            self.btn('詳しく聞く'); self.pg.locator('#panel .item').filter(has=self.pg.locator('.b-new')).first.click(); self.settle(); self.advance(); continue
                        if P['presents']:
                            self.btn('証拠を見せる'); self.item('^' + re.escape(P['presents'][0]), regex=True); self.advance(); continue
                        if P['contras']:
                            t, e = P['contras'][0]
                            self.btn('矛盾を指摘する'); self.item(t[:12]); self.item('^' + re.escape(e), regex=True); self.advance(); continue
                        if P['presses']:
                            self.btn('追及する'); self.item(P['presses'][0]); self.advance(); continue
                        break
                    self.btn('会話を終了する')
            o = self.ev(self.ORACLE)
            for a, b in o['combos']:
                self.combine(a, b)
            if self.ev(self.ORACLE)['sig'] == before: return
        raise RuntimeError('explore did not converge')

    def play_to_final(self, plan):
        m = self.advance(plan)
        while m == 'hub':
            self.explore_hub()
            ok('第%d章の目標を全て達成できる' % self.ev('SakichiUI.getState().chapter'), self.ev(self.ORACLE)['canFinish'])
            self.pg.locator('#commands .cmd.finish').click(); self.settle()
            self.btn('先へ進む')
            m = self.advance(plan)
        return m

    def accuse(self, suspect, motive, trick, evidence):
        for a, b in self.ev(self.ORACLE)['combos']:
            self.combine(a, b)
        self.pg.locator('#commands .cmd.finish').click(); self.settle()
        self.item(suspect); self.item(motive); self.item(trick); self.item('^' + re.escape(evidence), regex=True)
        self.btn('犯犬はお前だバウ！')
        self.pg.wait_for_timeout(1100)
        self.advance()
        return self.ev('SakichiUI.getState().endingId')


def new_page(b, **kw):
    ctx = b.new_context(**kw)
    ctx.add_init_script("if (!sessionStorage.getItem('seeded')) { localStorage.clear(); localStorage.setItem('sakichi.sys', %s); sessionStorage.setItem('seeded','1'); }" % json.dumps(FAST))
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto(URL); pg.wait_for_timeout(400)
    return pg, errs

PHONE = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)

with sync_playwright() as p:
    b = p.chromium.launch()

    # ---------- 1. トゥルーエンド通しプレイ（スマホ縦） ----------
    pg, errs = new_page(b, **PHONE)
    P = Player(pg)
    shot(pg, 'm01_title')
    pg.click('text=はじめから'); P.settle(200)
    plan = ['靴下の持ち主', '【秘密】', 'ブヒ田刑事を信頼', '今は伏せて']
    # 第1章のハブに着いたら、途中でセーブ→再読み込み→ロードを試す
    m = P.advance(plan)
    ok('プロローグ→第1章の捜査に到達', m == 'hub')
    shot(pg, 'm02_hub')
    P.cmd('調べる'); shot(pg, 'm03_investigate'); P.close_panel()
    P.explore_hub()
    before = P.ev('JSON.stringify((s=>({e:s.evidence,t:s.trust,f:s.flags,h:Object.keys(s.heard).length,d:s.deductions}))(SakichiUI.getState()))')
    pg.click('#btn-menu-hub'); P.settle(); P.item('セーブ'); P.item('スロット 1'); P.close_panel()
    pg.reload(); pg.wait_for_timeout(500)
    ok('再読み込み後にタイトル画面が出る', P.vis('#title'))
    pg.click('text=つづきから'); P.settle(300)
    P.close_panel()
    pg.click('#btn-menu-hub'); P.settle(); P.item('ロード'); P.item('スロット 1'); P.settle(300)
    after = P.ev('JSON.stringify((s=>({e:s.evidence,t:s.trust,f:s.flags,h:Object.keys(s.heard).length,d:s.deductions}))(SakichiUI.getState()))')
    ok('セーブ→再読み込み→ロードで証拠・信頼度・フラグ・推理が復元', before == after)
    ok('ロード後は捜査画面に戻る', P.mode() == 'hub')
    pg.locator('#commands .cmd.finish').click(); P.settle(); P.btn('先へ進む')
    m = P.play_to_final(plan)
    ok('第5章の最終推理に到達', m == 'final')
    shot(pg, 'm04_final')
    P.cmd('推理ノート'); shot(pg, 'm05_notebook'); P.pg.locator('.tab', has_text='時系列').click(); P.settle(); shot(pg, 'm06_timeline'); P.close_panel()
    end = P.accuse('町長を中心に', '自作自演', '配膳リフト', '輸送伝票')
    ok('UI操作でトゥルーエンド(END6)に到達', end == 'end6', str(end))
    shot(pg, 'm07_ending')
    ok('エンディングの回収状況が保存される', P.ev("JSON.parse(localStorage.getItem('sakichi.sys')).endings.end6 !== undefined"))
    P.btn('タイトルへ戻る')
    ok('エンディング後にタイトルへ戻れる', P.vis('#title'))
    ok('2周目用「第3章から」が解放される', pg.locator('#title-menu .btn', has_text='第3章から').count() == 1)
    pg.locator('#title-menu .btn', has_text='エンディング一覧').click(); P.settle(); shot(pg, 'm08_endlist')
    ok('エンディング一覧に END6 が表示される', '真相解明' in pg.inner_text('#panel'))
    P.close_panel()
    ok('トゥルーエンド通しプレイ中のJSエラーなし', not errs, '; '.join(errs[:3]))

    # ---------- 2. 第3章から→【映像】ルート→END1（別ルートを開始できるか） ----------
    errs.clear()
    pg.locator('#title-menu .btn', has_text='第3章から').click(); P.settle(); P.btn('始める')
    m = P.play_to_final(['【映像】', 'ボス・トンを信頼', 'みんなの前で公表'])
    shot(pg, 'm09_routeA_final')
    end = P.accuse('ボス・トン', 'IT契約', '監視カメラを止めた', '監視システム停止ログ')
    ok('第3章からの別ルートでEND1に到達', end == 'end1', str(end))
    P.btn('タイトルへ戻る')

    # ---------- 3. バッドエンド（見落とし表示） ----------
    pg.locator('#title-menu .btn', has_text='第3章から').click(); P.settle(); P.btn('始める')
    P.advance(['【在庫】'])
    # 捜査を最小限で切り上げる：目標だけ満たして進む
    P.explore_hub(); pg.locator('#commands .cmd.finish').click(); P.settle(); P.btn('先へ進む')
    m = P.advance(['シェフ・ブヒーノを信頼', '公表'])
    P.pg.locator('#commands .cmd.finish').click() if False else None
    while m == 'hub':
        P.explore_hub(); pg.locator('#commands .cmd.finish').click(); P.settle(); P.btn('先へ進む'); m = P.advance(['シェフ・ブヒーノを信頼', '公表'])
    pg.locator('#commands .cmd.finish').click(); P.settle()
    P.item('ゴンザレス'); P.item('独り占め'); P.item('怪力で扉'); P.pg.locator('#panel .item').first.click(); P.settle()
    P.btn('犯犬はお前だバウ！'); pg.wait_for_timeout(1100); P.advance()
    ok('誤った告発でバッドエンド(END5)', P.ev('SakichiUI.getState().endingId') == 'end5')
    ok('END5で見落とした情報が表示される', pg.locator('#panel .miss').count() > 0)
    shot(pg, 'm10_badend')
    ok('ルート別・バッドエンドのプレイ中JSエラーなし', not errs, '; '.join(errs[:3]))
    pg.context.close()

    # ---------- 4. 壊れたデータ ----------
    ctx = b.new_context(**PHONE)
    ctx.add_init_script("""if (!sessionStorage.getItem('x')) { localStorage.setItem('sakichi.sys', '{broken'); localStorage.setItem('sakichi.slot.2', '{"state": 12'); localStorage.setItem('sakichi.slot.3', JSON.stringify({savedAt:'x', state:{ver:99}})); localStorage.setItem('sakichi.slot.1', JSON.stringify({savedAt:'2026-01-01', state:{ver:1, chapter:2, mode:'hub', loc:'kitchen', trust:[70,60,50,40,30,20,10,90], talked:{b1_case:true}, evidence:['ev_clock','ev_nonexistent'], scene:{id:'c2_common', idx:3}}})); sessionStorage.setItem('x','1'); }""")
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(500)
    P = Player(pg)
    ok('壊れた周回データでも起動する', P.vis('#title') and not errs, '; '.join(errs[:2]))
    pg.click('text=つづきから'); P.settle(200)
    txt = pg.inner_text('#panel')
    ok('壊れたスロットは「壊れています」と表示', txt.count('壊れています') == 2, txt.replace('\n', ' ')[:200])
    P.item('スロット 1'); P.settle(300)
    st = P.ev('(s=>({t:s.trust.buhita, h:!!s.heard.b1_case, e:s.evidence, m:SakichiUI.getMode()}))(SakichiUI.getState())')
    ok('旧形式(v1)セーブを移行してロード（信頼度配列→名前付き、存在しない証拠は除去）', st['t'] == 70 and st['h'] and st['e'] == ['ev_clock'] and st['m'] == 'hub', json.dumps(st))
    ctx.close()

    # ---------- 5. 音声APIなし ----------
    ctx = b.new_context(**PHONE)
    ctx.add_init_script("delete window.AudioContext; delete window.webkitAudioContext; localStorage.setItem('sakichi.sys', %s);" % json.dumps(FAST))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(300)
    P = Player(pg)
    pg.click('text=はじめから'); P.settle(200)
    ok('音声APIが無くても第1章まで進行できる', P.advance() == 'hub' and not errs, '; '.join(errs[:2]))
    ctx.close()

    # ---------- 6. レイアウト（PC・横画面・縦画面） ----------
    LAYOUT = r"""() => {
      const bad = [], small = [];
      const W = innerWidth, H = innerHeight;
      document.querySelectorAll('button, .choice, .item').forEach(e => {
        if (!e.offsetParent) return;
        const r = e.getBoundingClientRect();
        if (r.width === 0) return;
        if (r.right > W + 1 || r.left < -1) bad.push((e.innerText||e.className).slice(0,20));
        if (r.height < 30) small.push((e.innerText||e.className).slice(0,20) + ':' + Math.round(r.height));
      });
      return {bad, small, hscroll: document.documentElement.scrollWidth > W + 1};
    }"""
    for name, kw in [('pc', dict(viewport={'width': 1280, 'height': 800})), ('phone_landscape', dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True)), ('phone_portrait', PHONE), ('small_phone', dict(viewport={'width': 320, 'height': 568}, is_mobile=True, has_touch=True))]:
        pg, errs = new_page(b, **kw)
        P = Player(pg)
        shot(pg, 'L_%s_title' % name)
        r1 = P.ev(LAYOUT)
        pg.click('text=はじめから'); P.settle(200)
        P.advance(['靴下'])
        shot(pg, 'L_%s_hub' % name)
        r2 = P.ev(LAYOUT)
        P.cmd('話す'); P.settle(); P.item('ボス') if P.vis('#panel .item') else None
        shot(pg, 'L_%s_talk' % name)
        r3 = P.ev(LAYOUT)
        P.btn('会話を終了する') if P.vis('#panel') else None
        # 長い文章・選択肢
        pg.evaluate("SakichiUI.getState() && 0")
        bad = r1['bad'] + r2['bad'] + r3['bad']
        small = r1['small'] + r2['small'] + r3['small']
        ok('[%s] 画面外へのはみ出し・横スクロールなし' % name, not bad and not (r1['hscroll'] or r2['hscroll'] or r3['hscroll']), str(bad))
        ok('[%s] ボタンが小さすぎない(30px以上)' % name, not small, str(small[:5]))
        ok('[%s] JSエラーなし' % name, not errs, '; '.join(errs[:2]))
        pg.context.close()
    b.close()

failed = [r for r in results if not r[1]]
print('\n%d passed, %d failed' % (len(results) - len(failed), len(failed)))
sys.exit(1 if failed else 0)
