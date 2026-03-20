# OpenClaw VM — 技術スタック・VMスペック設計

## VM環境

### ハイパーバイザー選定

| 候補 | メリット | デメリット | 推奨度 |
|---|---|---|---|
| **VirtualBox** | 無料、クロスプラットフォーム、GUIあり | パフォーマンスがやや劣る | ○ 手軽に始めるなら |
| **VMware Workstation** | 安定性高い | 有料（Player は無料） | ○ |
| **QEMU/KVM** | 高パフォーマンス、Linux ネイティブ | 設定がやや複雑 | ◎ Linux ホストなら最推奨 |
| **UTM (macOS)** | M1/M2/M3対応、QEMU ベース | macOS限定 | ○ Macユーザー向け |

### 推奨: QEMU/KVM（Linux ホスト）または VirtualBox（Windows/Mac ホスト）

> **重要**: OpenClaw はセキュリティ上、メインマシンではなくVM上で実行すべき。
> Cisco のセキュリティ研究チームもVM実行を推奨している。

---

## VMスペック（推奨）

OpenClaw は Node.js ベースの単一プロセスなので、ゲームエンジン等と比べれば軽量。
ただし LLM API 呼び出しやブラウザ自動化（Puppeteer/Playwright）を行う場合はメモリに余裕が必要。

### 最小スペック

| 項目 | スペック | 理由 |
|---|---|---|
| CPU | 2 vCPU | Gateway プロセス + ブラウザ自動化 |
| RAM | 4 GB | OpenClaw 公式の最低要件 |
| ディスク | 20 GB | OS + Node.js + OpenClaw + Memory ファイル |
| GPU | 不要 | ヘッドレス運用なら GPU 不要 |
| ネットワーク | NAT | LLM API / メッセージングプラットフォームへの接続用 |

### 推奨スペック（快適に開発・実験するなら）

| 項目 | スペック | 理由 |
|---|---|---|
| CPU | 4 vCPU | ブラウザ自動化 + 複数タスク並行 |
| RAM | 8 GB | 公式推奨。Puppeteer/Playwright が重い |
| ディスク | 40 GB | Memory ファイル蓄積 + ログ + スキル開発 |
| ディスプレイ | 1280x800 以上 | Web UI（Canvas）確認用。ヘッドレスなら不要 |
| ネットワーク | NAT + Host-Only | SSH接続用に Host-Only NIC を追加 |

---

## ゲストOS

### 推奨: Ubuntu 24.04 LTS（またはそれ以降）

| 候補 | メリット | デメリット |
|---|---|---|
| **Ubuntu 24.04 LTS** | Node.js セットアップが容易、情報が多い、LTSで安定 | やや重い |
| **Debian 12 (Bookworm)** | 軽量、安定 | Node.js 22 は手動追加が必要 |
| **Fedora 39+** | 最新パッケージ | ローリングに近く変化が早い |
| **Alpine Linux** | 超軽量（Docker的な使い方） | 学習コストが高い |

Ubuntu 24.04 LTS を推奨。理由:
- Node.js 22 の公式リポジトリが利用可能（NodeSource）
- 情報が豊富でトラブルシューティングしやすい
- systemd 対応で Gateway のデーモン化が簡単

軽量にしたい場合は **Ubuntu Server**（GUI無し）+ SSH 接続でも十分。

---

## OpenClaw 技術スタック

### ランタイム・言語

| 項目 | 詳細 |
|---|---|
| **ランタイム** | Node.js 22 以上（必須） |
| **パッケージマネージャ** | npm（グローバルインストール） or pnpm（ソースビルド） |
| **言語** | TypeScript / JavaScript |

### OpenClaw アーキテクチャ（5つのサブシステム）

```
OpenClaw Gateway (単一の永続 Node.js プロセス)
│
├── Gateway ─────── メッセージチャネルのルーティング
│   ├── Slack コネクタ
│   ├── Telegram コネクタ
│   ├── WhatsApp コネクタ
│   ├── Discord コネクタ
│   ├── Signal コネクタ
│   └── iMessage コネクタ ... 他
│
├── Brain ──────── LLM 呼び出しオーケストレーション
│   ├── ReAct ループ (Reasoning + Acting)
│   ├── モデルフォールバック (複数LLMプロバイダー切替)
│   └── ContextEngine (v2026.3.7〜 プラガブルコンテキスト管理)
│
├── Memory ─────── 永続コンテキスト管理
│   └── Markdown ファイル（ローカルディスク保存）
│
├── Skills ─────── プラグイン機能
│   ├── 組み込みスキル (メール, カレンダー, ブラウザ等)
│   ├── ユーザー自作スキル (SKILL.md)
│   └── ClawHub (コミュニティスキルレジストリ)
│
└── Heartbeat ──── スケジューラー・監視
    ├── cron ベースの定期実行
    └── 受信トレイ監視
```

### フロントエンド・管理画面

| 技術 | 用途 |
|---|---|
| Vue.js 3 | Admin Dashboard |
| Canvas API | スクリーンショット処理 |
| A2UI | エージェントインタラクション |
| WebSocket | リアルタイム通信 |

### バックエンド

| 技術 | 用途 |
|---|---|
| Node.js | プライマリランタイム |
| Express.js | Web フレームワーク |
| WebSocket | リアルタイムメッセージング |

### 自動化ツール

| 技術 | 用途 |
|---|---|
| Puppeteer / Playwright | ブラウザ自動化 |
| Node.js child_process | シェルコマンド実行 |
| fs / path | ファイル操作 |

### 対応 LLM プロバイダー

| プロバイダー | モデル例 | 備考 |
|---|---|---|
| **Anthropic** | Claude Opus 4.6, Sonnet 4.6 | 最も人気のプロバイダー |
| **OpenAI** | GPT-4o, GPT-4.5 | |
| **Google** | Gemini | |
| **DeepSeek** | DeepSeek-V3 | コスト効率が高い |
| **Ollama** | Llama, Mistral 等 | ローカル実行、API コスト不要 |
| **Doubao / Qwen** | | 中国市場向け |

> モデルフォールバック機能: プライマリモデルがレート制限された場合、
> 自動的にセカンダリプロバイダーに切り替え可能。

---

## インストール手順概要

### 1. Node.js 22+ のインストール

```bash
# NodeSource リポジトリから Node.js 22 をインストール
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # v22.x.x を確認
```

### 2. OpenClaw のインストール

```bash
# npm グローバルインストール（推奨）
npm install -g openclaw@latest
openclaw --version

# または Docker
# docker pull openclaw/openclaw:latest
```

### 3. オンボーディング

```bash
# ウィザードを実行（LLM プロバイダー、API キー、メッセージング設定）
openclaw onboard --install-daemon
```

これにより:
- `~/.openclaw/` ディレクトリが作成される
- `~/.openclaw/openclaw.json` に設定が保存される
- systemd サービスとして Gateway がインストールされる（Linux）

### 4. ヘルスチェック

```bash
openclaw doctor
```

Node.js バージョン、OpenClaw バージョン、Gateway 状態、API キー設定、ワークスペースを確認。

### 5. Gateway の起動・管理

```bash
# フォアグラウンド（デバッグ用）
openclaw gateway --verbose

# デーモンとして起動
openclaw gateway --daemon

# ポート指定（デフォルト: 18789）
openclaw gateway --port 18790
```

---

## 設定ファイル

### ~/.openclaw/openclaw.json

主要な設定項目:

```json
{
  "agent": {
    "model": "anthropic/claude-opus-4-6"
  },
  "gateway": {
    "port": 18789,
    "token": "your-strong-random-token-here"
  },
  "canvas": {
    "host": "127.0.0.1"
  }
}
```

> **セキュリティ注意**: `canvas.host` はデフォルトで `0.0.0.0` の場合があるため、
> 必ず `127.0.0.1` に変更すること。VPS上で運用する場合は SSH トンネル経由でアクセスする。

---

## ネットワーク構成

| 用途 | 設定 |
|---|---|
| LLM API 通信 | NAT（VM→インターネット。Anthropic/OpenAI API エンドポイント） |
| メッセージング | NAT（VM→インターネット。Telegram/Slack API） |
| SSH接続（ホスト→VM） | ポートフォワーディング or Host-Only NIC |
| Web UI アクセス | SSH トンネル（`ssh -L 18789:localhost:18789 vm-user@vm-ip`） |
| Gateway ポート | 18789（デフォルト。外部に直接公開しない） |

SSH でホストからVM に接続し、必要に応じて Gateway ポートをトンネルするのが安全。

---

## 開発ツール（スキル開発用・オプション）

| ツール | 用途 |
|---|---|
| VS Code (Remote SSH) | VM内のスキルファイルをホストから編集 |
| vim / neovim | VM内での SKILL.md 直接編集 |
| `openclaw gateway --verbose` | デバッグログの確認 |
| `openclaw doctor` | システムヘルスチェック |
| htop | リソース使用量モニタリング |
| jq | JSON 設定ファイルの操作 |

---

## コスト見積もり

| 利用パターン | LLM API 月額目安 |
|---|---|
| ライトユーザー（1-2タスク/日） | $3 - $15 |
| 通常利用（2-4時間/日） | $20 - $60 |
| ヘビー開発者 | $200+ |

> Ollama でローカルモデルを使えば API コストをゼロにできるが、
> 応答品質は Claude や GPT に比べて劣る場合がある。
