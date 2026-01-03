# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-01-03

### Added
- **Core**: `post.js` によるNostrへのメッセージ投稿機能実装 (Node.js, nostr-tools)
- **Configuration**:
  - `config.yaml` 導入によるプロファイル管理（複数アカウント・リレー設定のサポート）
  - `.env` をデフォルトプロファイル指定用に変更
- **CLI**:
  - `--profile` / `-p` オプション追加（プロファイル切り替え）
  - `-h` / `--help` オプション追加（ヘルプ表示）
  - メッセージ引数の必須化と自動結合機能
- **Documentation**: `README.md`, `license.txt` (BSD-2-Clause) 作成

### Fixed
- **Performance**: 投稿処理完了後にプロセスがハングする問題を修正 (`process.exit` の追加)
