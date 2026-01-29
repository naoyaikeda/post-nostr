# post-nostr

Nostrリレーにメッセージを投稿するためのシンプルなCLIツールです。プロファイル管理により複数のアカウントや設定を切り替えて使用できます。

## インストール

1. リポジトリをクローンまたはダウンロードします。
2. 依存関係をインストールします。

```bash
npm install
```

## 設定

### 1. プロファイル設定 (post-nostr-profiles.yaml)

ホームディレクトリに `post-nostr-profiles.yaml` を作成し、プロファイルとリレーを設定してください。

Linux/Mac: `~/post-nostr-profiles.yaml`

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

### 2. デフォルトプロファイル (post-nostr.env)

ホームディレクトリに `post-nostr.env` ファイルを作成し、デフォルトで使用するプロファイルを指定できます。

Linux/Mac: `~/post-nostr.env`

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

### 設定ファイルを指定して実行

`--config` オプションで設定ファイルのパスを指定できます（テスト時などに便利です）。

```bash
node post.js --config ./my-test-config.yaml "テスト設定での投稿"
```

## 技術スタック
- Node.js
- nostr-tools
- js-yaml
- cac (CLI引数解析)
- zod (設定バリデーション)

## ライセンス

[2-Clause BSD License](./license.txt)