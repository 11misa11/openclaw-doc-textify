# openclaw-doc-textify

OpenClaw 系ドキュメントや一般的な HTML を、読みやすい **プレーンテキスト** と **Markdown** に変換する CLI ツールです。

## Phase 0 の内容

- 単一 URL の取得
- ローカル HTML ファイルの入力
- Readability ベースの本文抽出
- `nav` / `footer` / `script` などのノイズ除去
- `.md` / `.txt` 出力
- 出力ファイルへの基本メタデータ付与
  - `sourceType`
  - `source`
  - `fetchedAt`

## セットアップ

```bash
npm install
```

## 使い方

### URL から変換

```bash
npm run textify -- url https://docs.openclaw.ai/ --out ./output
```

### ローカルファイルから変換

```bash
npm run textify -- file ./test/fixtures/sample.html --out ./output
```

## 出力例

- `output/<slug>.md`
- `output/<slug>.txt`

Markdown にはタイトルとメタデータを先頭に付けます。Text には軽いヘッダ情報を付けます。

## テスト

```bash
npm test
npm run build
```

## 軽検証済み URL

- `https://docs.openclaw.ai/`
- `https://docs.openclaw.ai/start/getting-started`

## 次の予定

- 複数 URL のクロール
- sitemap 対応
- 重複排除
- index 生成
- 設定ファイル対応
