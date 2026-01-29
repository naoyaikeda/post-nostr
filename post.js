#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const os = require('os')
const yaml = require('js-yaml')
const { finalizeEvent } = require('nostr-tools/pure')
const { SimplePool } = require('nostr-tools/pool')
const nip19 = require('nostr-tools/nip19')
const cac = require('cac')
const { z } = require('zod')

const homedir = os.homedir()
const envPath = path.join(homedir, 'post-nostr.env')
const defaultConfigPath = path.join(homedir, 'post-nostr-profiles.yaml')

require('dotenv').config({ path: envPath })

const ProfileSchema = z.object({
    nsec: z.string().refine((val) => {
        try {
            const { type } = nip19.decode(val)
            return type === 'nsec'
        } catch (e) {
            return false
        }
    }, { message: "Invalid nsec format or checksum. Must be a valid bech32 'nsec' string." }),
    relays: z.array(z.string()).optional()
})

const ConfigSchema = z.object({
    common: z.object({
        relays: z.array(z.string()).optional()
    }).optional(),
    profiles: z.record(z.string(), ProfileSchema)
})

// CAC Setup
const cli = cac('post-nostr')

cli.command('[...message]', 'Post a message')
    .option('-p, --profile <name>', 'Specify the profile to use', {
        default: process.env.DEFAULT_PROFILE || 'default'
    })
    .option('--config <path>', 'Specify config file path', {
        default: defaultConfigPath
    })

cli.help()

const parsed = cli.parse()

const profileName = parsed.options.profile
const configPath = parsed.options.config
const message = parsed.args.join(' ')

if (!message) {
    console.error('Error: Message is required.')
    cli.outputHelp()
    process.exit(1)
}

// post-nostr-profiles.yaml の読み込み
let config
try {
    const fileContents = fs.readFileSync(configPath, 'utf8')
    const rawConfig = yaml.load(fileContents)
    const result = ConfigSchema.safeParse(rawConfig)

    if (!result.success) {
        console.error(`Invalid configuration in ${configPath}:`)
        result.error.issues.forEach(issue => {
            console.error(` - Path: ${issue.path.join('.') || 'root'}`)
            console.error(`   Error: ${issue.message}`)
        })
        process.exit(1)
    }
    config = result.data
} catch (e) {
    console.error(`Failed to load post-nostr-profiles.yaml from ${configPath}:`, e.message)
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
        // Force exit if the process doesn't exit naturally within 3 seconds
        setTimeout(() => {
            process.exit(exitCode)
        }, 3000).unref()
    }
}

main()
