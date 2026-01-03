# post-nostr

Nostrリレーにメッセージを投稿するためのシンプルなCLIツールです。プロファイル管理により複数のアカウントや設定を切り替えて使用できます。

## インストール

1. リポジトリをクローンまたはダウンロードします。
2. 依存関係をインストールします。

```bash
npm install
```

## 設定

### 1. プロファイル設定 (config.yaml)

プロジェクトルートに `config.yaml` を作成し、プロファイルとリレーを設定してください。

```yaml
common:
  relays:
    - wss://relay.damus.io
    - wss://relay-jp.nostr.wirednet.jp

profiles:
  default:
    nsec: nsec1... # メインアカウントの秘密鍵
    relays:
      - wss://nos.lol # 追加のリレー
  
  sub:
    nsec: nsec1... # サブアカウントの秘密鍵
    relays: []
```

### 2. デフォルトプロファイル (.env)

`.env` ファイルでデフォルトで使用するプロファイルを指定できます。

```env
DEFAULT_PROFILE=default
```

## 使い方

### 基本的な投稿

デフォルトプロファイルを使用してメッセージを投稿します。

```bash
node post.js "Hello, Nostr!"
```

### プロファイルを指定して投稿

`--profile` または `-p` オプションでプロファイルを切り替えます。

```bash
node post.js --profile sub "サブ垢からの投稿です"
```

## 技術スタック
- Node.js
- nostr-tools
- js-yaml

## ライセンス

[2-Clause BSD License](./license.txt)