# 名探偵・佐吉 〜ちゅ〜る狂騒曲〜

ブサ犬だけの町「ブサワンシティ」を舞台にした、ギャグミステリー × サウンドノベル × コマンド選択式推理アドベンチャー。
スマートフォン／PCのブラウザで動作。外部API・外部サーバー・依存パッケージなし。

## 起動方法

```bash
# どちらか一つ
node tools/serve.js 8080          # → http://localhost:8080/
python3 -m http.server 8080       # → http://localhost:8080/
```

`index.html` をダブルクリックして直接開いても遊べます（file:// 動作確認済み）。
スマホで遊ぶ場合は、同じWi‑Fi内でPCのIPアドレス（例 `http://192.168.x.x:8080/`）にアクセスしてください。

## テスト

```bash
npm test          # データ検証 + コア単体テスト + 全分岐128通りの自動プレイ
npm run test:ui   # ブラウザE2E（要 Playwright + Chromium、サーバー起動中に実行）
```

## ファイル構成

| パス | 内容 |
|---|---|
| `index.html` | 画面の骨組み。データ→コア→表示の順に読み込む |
| `css/style.css` | デザイン（ダークネイビー／ブラウン／クリーム／ゴールド） |
| `js/core.js` | ゲームのルール（DOM非依存）。条件・効果・シーン進行・調査・聞き込み・推理・エンディング判定・セーブ移行 |
| `js/ui.js` | 画面制御（タイトル、会話、選択肢、捜査、聞き込み、推理ノート、最終推理、エンディング、セーブ／ロード、設定） |
| `js/store.js` | localStorage 保存（壊れたデータに耐性、使えない環境ではメモリ保存） |
| `js/art.js` | **仮素材**：SVGで描く立ち絵（9匹×12表情）と背景16種 |
| `js/audio.js` | Web Audio API による自作BGM8曲・効果音14種（音声ファイル不要） |
| `data/characters.js` | キャラクター定義 |
| `data/evidence.js` | 証拠24種（ID・説明・発見場所・発見条件・関連人物/証言/証拠・解放会話・エンディングへの影響） |
| `data/notebook.js` | 証言・秘密・未解決の謎・時系列・推理の組み合わせ |
| `data/locations.js` | 調査場所11か所・調査対象39個・章の目標 |
| `data/talks.js` | 聞き込み（話題・証拠提示・矛盾指摘・追及・信頼度による分岐） |
| `data/scenes.js` | プロローグ〜第5章のシナリオ本文と選択肢 |
| `data/endings.js` | 最終推理の選択肢・6エンディングの到達条件と本文 |
| `data/assets.js` | 本番画像への差し替え設定 |
| `docs/SCENARIO.md` | 真相・時系列・嘘の理由・伏線・分岐条件の仕様書（ネタバレ） |
| `tools/validate.js` | 存在しないID・終端のないシーン・到達不能シーン・入手不能な証拠を検出 |
| `tests/` | 単体テスト、全分岐自動プレイ、ブラウザE2E |

## 画像の差し替え

`data/assets.js` の `ART_OVERRIDES` に `'sakichi:normal': 'assets/chars/sakichi_normal.png'` や
`'bg:plaza': 'assets/bg/plaza.jpg'` のように登録すると、仮素材の代わりに表示されます。
