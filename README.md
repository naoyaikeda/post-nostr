# post-nostr

Nostrリレーにメッセージを投稿するためのシンプルなCLIツールです。Node.jsと`nostr-tools`を使用しています。

## インストール

1. リポジトリをクローンまたはダウンロードします。
2. 依存関係をインストールします。

```bash
npm install
```

## 設定

プロジェクトのルートディレクトリに `.env` ファイルを作成し、以下の変数を設定してください。

```env
NOSTR_NSEC=nsec1... # あなたの秘密鍵 (nsec形式)
NOSTR_RELAY_URL=wss://relay.damus.io # (オプション) 投稿先のリレーURL。デフォルトは wss://relay.damus.io
```

## 使い方

以下のコマンドでメッセージを投稿できます。

```bash
# デフォルトメッセージ ("Hello, Nostr!") を投稿
node post.js

# 任意のメッセージを投稿
node post.js "投稿したいメッセージ"
```

または `npm` スクリプトを使用する場合:

```bash
npm run post -- "投稿したいメッセージ"
```

## ライセンス

[2-Clause BSD License](./license.txt)
