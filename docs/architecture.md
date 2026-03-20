# openclaw-doc-textify — architecture

## 1. 目的

本ドキュメントは、Slack 経由で書類画像を受け取り、OCR・分類・レビューを経て Notion に反映するためのシステム構造を整理する。

対象は以下の2フロー。

- 新規書類取り込みフロー
- 既存 Notion 画像のテキスト化マイグレーションフロー

---

## 2. システム全体像

```text
User
  ↓
Slack channel / DM
  ↓
OpenClaw Gateway (Slack connector)
  ↓
Document Textify Skill / workflow logic
  ├─ OCR
  ├─ LLM classification / structuring
  ├─ review state management
  └─ Notion write integration
  ↓
Notion API
  ├─ database lookup
  ├─ page block read
  └─ page block append / update
```

---

## 3. 主要コンポーネント

## 3.1 Slack connector

責務:
- 書類画像の受信
- レビュー用メッセージ送信
- ユーザーの承認 / 修正 / スキップ指示の受信

前提:
- このプロジェクトでは Slack チャンネルが事実上の専用UIとなる
- メンション必須にはせず、対象チャンネル内の発話を処理対象にできる構成を想定する

---

## 3.2 OCR layer

責務:
- 画像から文字情報を抽出する
- 抽出結果をレビュー前に保存する

入出力:
- Input: 書類画像
- Output: OCR raw text

考慮点:
- OCR の質が低い場合でもレビューに回せるようにする
- マイグレーション時は先にOCRだけまとめて実行できるようにする

---

## 3.3 Classification / structuring layer

責務:
- OCR結果と画像内容から文書種別を推定する
- Notion の追加先ページ候補を決める
- 人が確認しやすい追加テキストを構造化する

出力項目:
- documentType
- title
- destinationPage
- summary
- structuredContent
- confidence

---

## 3.4 Review state manager

責務:
- 書類ごとの状態管理
- バッチ処理の進捗管理
- 修正後の再プレビュー生成

状態の例:
- received
- ocr_done
- classified
- review_pending
- approved
- skipped
- cancelled
- notion_written
- failed

保持したい情報:
- source message id
- source image reference
- OCR結果
- 分類結果
- 現在のレビュー状態
- 承認履歴 / 修正履歴
- Notion反映結果

実装方針:
- 初期段階では軽量なローカル状態管理で開始可能
- 将来的に永続ストアへ移行しやすい形にする

---

## 3.5 Notion integration layer

責務:
- 対象DB / ページの探索
- ページ内ブロック読み取り
- テキストブロック追加
- 画像ブロックの移動 / 再構成

主要操作:
- DBレコード候補の取得
- ページ本文ブロック列の取得
- ブロック追加
- トグル配下へのブロック整理

---

## 4. 新規書類取り込みフロー

```text
1. User sends image(s) in Slack
2. System receives file references
3. OCR runs for each image
4. Classification / structuring runs
5. Review preview is posted to Slack
6. User chooses: OK / 修正 / キャンセル / スキップ
7a. OK      -> write to Notion -> completion message
7b. 修正    -> reclassify / re-render preview
7c. キャンセル -> mark cancelled
7d. スキップ -> defer item and move on
```

### レビュー単位
- 1画像 = 1レビュー単位を基本とする
- 複数画像投稿時も内部では個別アイテムとして扱う

### バッチ処理
- バッチ開始時に一覧サマリーを出す
- 詳細レビューは1件ずつ進める
- 将来は「全部OK」を追加可能な構造にする

---

## 5. 既存画像マイグレーションフロー

```text
1. User requests migration in Slack
2. System identifies target Notion page(s)
3. Existing image blocks are collected
4. OCR runs on all candidate images
5. Review requests are posted in batches
6a. テキスト化 -> add text block + move image under original-image toggle
6b. スキップ   -> no change
7. Final summary is posted
```

### マイグレーションの原則
- 元画像は削除しない
- 文字主体の画像だけをユーザー判断でテキスト化する
- 図表・写真などはスキップできる

---

## 6. Slack レビュー設計

## 6.1 単票レビュー

Slack に返すレビュー情報の最小単位:
- 文書種別
- タイトル / 要約
- 追加先 Notion ページ
- 追加予定内容
- 次アクション案

想定アクション:
- OK
- 修正
- キャンセル
- スキップ（バッチ時）

## 6.2 修正フロー

```text
review_pending
  ↓ user says correction
reclassifying
  ↓
review_pending (updated preview)
```

修正入力例:
- これは幼稚園じゃなくてスイミング
- 追加先は medical records じゃなくて 通院履歴
- タイトルをもっと短くして

## 6.3 バッチレビュー

Slack 上で必要な情報:
- 総件数
- 現在位置（例: 2/5）
- 完了件数
- 残件数

---

## 7. Notion ページ構造

## 7.1 新規書類追加時の標準形

```text
[Heading or title block]
[Short summary paragraph]
[Bullet list / structured content]
[Optional original image block]
```

追加の方針:
- 可読性を優先する
- ページ内で後から見返して意味が分かる粒度にする
- LLM出力をそのまま貼るのではなく、人が読む前提の体裁に整える

## 7.2 マイグレーション時の標準形

```text
[Extracted text block(s)]
[Toggle: 原本画像]
  └─ [Original image block]
```

メリット:
- 検索可能になる
- ページが軽くなる
- 原本保持の要件を満たせる

---

## 8. Notion 追加先解決

### 8.1 解決方法
- Notion DB 「📂 DOMAIN」のレコード一覧を候補として使う
- OCR内容と既知カテゴリの意味的近さから候補を選ぶ
- 必要なら候補を複数提示する

### 8.2 候補選定に使う情報
- レコード名
- Domain
- description
- 過去に同種文書が入っているページ実績（将来）

---

## 9. データモデル案

## 9.1 ReviewItem

```json
{
  "id": "review-item-id",
  "sourceSurface": "slack",
  "sourceChannel": "channel-id",
  "sourceMessageTs": "...",
  "sourceFileId": "...",
  "mode": "new_document | migration",
  "status": "review_pending",
  "ocrText": "...",
  "documentType": "...",
  "title": "...",
  "summary": "...",
  "structuredContent": ["..."],
  "destinationPageId": "...",
  "destinationPageTitle": "...",
  "confidence": 0.87
}
```

## 9.2 BatchSession

```json
{
  "id": "batch-id",
  "mode": "new_document | migration",
  "itemIds": ["..."],
  "currentIndex": 0,
  "completedCount": 0,
  "skippedCount": 0,
  "cancelledCount": 0
}
```

---

## 10. エラーハンドリング

## 10.1 OCR失敗
- 画像ごとに失敗を返す
- バッチ全体は止めない
- 再試行可能にする

## 10.2 Notion書き込み失敗
- 承認済みでも `notion_write_failed` として保持する
- 再書き込み可能にする
- Slack に失敗理由を返す

## 10.3 分類曖昧
- confidence が低い場合は候補を複数提示する
- ユーザーが正しい追加先を選べるようにする

---

## 11. 実装順の推奨

### Phase 1
- 単票の新規書類取り込み
- OCR
- 分類
- Slackレビュー
- Notion書き込み

### Phase 2
- 複数画像バッチ処理
- 進捗管理
- スキップ / キャンセル制御

### Phase 3
- 既存画像マイグレーション
- 画像収集
- OCR先行バッチ
- 原本画像トグル整理

### Phase 4
- confidence ベースの候補提示改善
- OCR編集
- 一括承認
- 再試行UI改善

---

## 12. 次に切るべきタスク

この architecture を元に、次は `tasks.md` で以下を実装単位へ分解する。

- Slack受信とレビュー返信
- OCR呼び出し
- 分類ロジック
- Notion候補解決
- Notionブロック追加
- バッチ状態管理
- マイグレーション処理
- エラー処理 / 再試行
