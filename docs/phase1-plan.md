# Phase 1 plan

## 目的
単一ページ textify を、複数ページ収集に拡張する。

## 範囲
- discover: 開始URLから同一ホストのリンクを抽出
- sitemap: sitemap.xml からURLを取得
- queue: 重複を避けながら巡回順を管理
- crawl: 軽量クロールで visited URL 一覧を作る
- index: 収集URLの index.json を出力する

## 実装順
1. discover
2. sitemap
3. queue / dedupe
4. crawl command
5. index 出力
6. 収集URLに対する textify のバッチ化

## 次の改善候補
- include / exclude パターン
- depth 制限
- retry
- 並列取得
- manifest に title / status を追加
