#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const os = require('os')
const yaml = require('js-yaml')
const { finalizeEvent } = require('nostr-tools/pure')
const { SimplePool } = require('nostr-tools/pool')
const nip19 = require('nostr-tools/nip19')

const homedir = os.homedir()
const envPath = path.join(homedir, 'post-nostr.env')
const configPath = path.join(homedir, 'post-nostr-profiles.yaml')

require('dotenv').config({ path: envPath })

function showHelp() {
    console.log(`
Usage: post-nostr [options] <message>

Options:
  -p, --profile <name>  Specify the profile to use (default: settings in ~/post-nostr.env)
  -h, --help            Show this help message

Examples:
  node post.js "Hello Nostr"
  node post.js -p sub "Message from sub account"
`)
}

// 引数の解析
const args = process.argv.slice(2)
let profileName = process.env.DEFAULT_PROFILE || 'default'
let messageParts = []

// 引数がない、またはヘルプフラグがある場合
if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    showHelp()
    process.exit(0)
}

// 引数からプロファイルとメッセージを抽出
for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--profile' || arg === '-p') {
        if (args[i + 1]) {
            profileName = args[i + 1]
            i++ // 値をスキップ
        } else {
            console.error('Error: --profile requires an argument')
            process.exit(1)
        }
    } else {
        messageParts.push(arg)
    }
}

const message = messageParts.join(' ')

if (!message) {
    console.error('Error: Message is required.')
    showHelp()
    process.exit(1)
}

// post-nostr-profiles.yaml の読み込み
let config
try {
    const fileContents = fs.readFileSync(configPath, 'utf8')
    config = yaml.load(fileContents)
} catch (e) {
    console.error(`Failed to load post-nostr-profiles.yaml from ${configPath}:`, e)
    process.exit(1)
}

// プロファイルの取得
const profile = config.profiles[profileName]
if (!profile) {
    console.error(`Profile "${profileName}" not found in post-nostr-profiles.yaml`)
    process.exit(1)
}

if (!profile.nsec) {
    console.error(`nsec not set for profile "${profileName}"`)
    process.exit(1)
}

// リレーの統合 (共通 + プロファイル固有)
const commonRelays = config.common?.relays || []
const profileRelays = profile.relays || []
const relayUrls = [...new Set([...commonRelays, ...profileRelays])]

if (relayUrls.length === 0) {
    console.error('No relays defined in common or profile settings')
    process.exit(1)
}

async function main() {
    const pool = new SimplePool()
    let exitCode = 0

    try {
        const { type, data } = nip19.decode(profile.nsec)
        const secretKey = data

        const eventTemplate = {
            kind: 1,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: message,
        }

        const signedEvent = finalizeEvent(eventTemplate, secretKey)
        console.log(`Publishing to [${profileName}]:`, relayUrls)

        await Promise.any(pool.publish(relayUrls, signedEvent))
        console.log('Event published successfully:', signedEvent.id)
    } catch (error) {
        console.error('Failed to publish event:', error)
        exitCode = 1
    } finally {
        pool.close(relayUrls)
        process.exitCode = exitCode
    }
}

main()
