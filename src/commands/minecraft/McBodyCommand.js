const { Command, EmbedBuilder, Emoji } = require('../../utils')

module.exports = class McBodyCommand extends Command {
    constructor() {
        super({
            name: 'mcbody',
            aliases: [],
            arguments: 1,
            permissions: [{
                entity: 'bot',
                permissions: ['embedLinks']
            }]
        })
    }

    async run(ctx) {
        const body = `https://mc-heads.net/body/${ctx.args[0]}`
        const embed = new EmbedBuilder()
        embed.setColor('MINECRAFT')
        embed.setImage(body)
        embed.setDescription(`${Emoji.getEmoji('minecraft')} [[Download]](${body})`)
        embed.setFooter(`©️ ${ctx.client.user.username}`)
        embed.setTimestamp()

        ctx.send(embed.build())
    }
}
