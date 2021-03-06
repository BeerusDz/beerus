const Listener = require('../structures/events/Listener')
const Logger = require('../structures/util/Logger')

module.exports = class ShardReadyListener extends Listener {
    constructor() {
        super()
        this.event = 'shardReady'
    }

    async on(client, shardID) {
        client.shardUptime.set(shardID, {
            shardID,
            uptime: Date.now()
        })
        
        Logger.shardMessage(`Ok! Shard ${shardID} has been connected!`)
    }
}
