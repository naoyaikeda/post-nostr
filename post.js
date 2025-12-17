const { finalizeEvent } = require('nostr-tools/pure')
const { SimplePool, useWebSocketImplementation } = require('nostr-tools/pool')
const nip19 = require('nostr-tools/nip19')

require('dotenv').config()

const relayUrl = process.env.NOSTR_RELAY_URL || 'wss://relay.damus.io'
const nsec = process.env.NOSTR_NSEC
const message = process.argv[2] || 'Hello, Nostr!'

if (!nsec) {
    console.error('NOSTR_NSEC is not set in environment variables.')
    process.exit(1)
}

async function main() {
    const pool = new SimplePool()

    const { type, data } = nip19.decode(nsec)
    const secretKey = data

    const eventTemplate = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: message,
    }

    const signedEvent = finalizeEvent(eventTemplate, secretKey)

    try {
        await Promise.any(pool.publish([relayUrl], signedEvent))
        console.log('Event published successfully:', signedEvent.id)
    } catch (error) {
        console.error('Failed to publish event:', error)
    } finally {
        pool.close([relayUrl])
    }
}

main()
