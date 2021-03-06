const { Command, ReactionCollector, Emoji } = require('../../utils')

module.exports = class MarryCommand extends Command {
    constructor() {
        super({
            name: 'marry',
            aliases: ['casar'],
            arguments: 1,
            permissions: [{
                entity: 'bot',
                permissions: ['addReactions']
            }]
        })
    }

    async run(ctx) {
        const member = ctx.client.users.get(ctx.args[0]?.replace(/[<@!>]/g, ''))
        if (!member) return ctx.replyT('error', 'basic:invalidUser')
        let author = ctx.db.user
        let couple = await ctx.client.database.users.getOrCreate(member.id)
        if (member.id === ctx.message.author.id) return ctx.replyT('broken_heart', 'commands:marry.cannotMarryWithYourself')
        if (member.id === ctx.client.user.id) return ctx.replyT('broken_heart', 'commands:marry.cannotMarryWithMe')
        if (member.bot) return ctx.replyT('broken_heart', 'commands:marry.cannotMarryWithBot')
        if (author.yens < Number(7500)) return ctx.replyT('error', 'commands:marry.youNeedToMarry', { 0: Number(7500 - author.yens).toLocaleString() })
        if (couple.yens < Number(7500)) return ctx.replyT('error', 'commands:marry.theyNeedToMarry', { 0: member.mention, 1: Number(7500 - couple.yens).toLocaleString() })
        if (author.isMarry) return ctx.replyT('error', 'commands:marry.youAlreadyMarried')
        if (couple.isMarry) return ctx.replyT('error', 'commands:marry.theyAlreadyMarried', { 0: member.mention })

        ctx.sendT('commands:marry.requestConfirm', { 0: member.mention, 1: ctx.message.author.mention }).then(async msg => {
            await msg.addReaction(Emoji.getEmojiReaction('success').mention)
            await msg.addReaction(Emoji.getEmojiReaction('error').mention)

            const collector = new ReactionCollector(msg, (_, emoji, userID) => ([Emoji.getEmojiReaction('success').name, Emoji.getEmojiReaction('error').name].includes(emoji.name)) && (userID === member.id))
            collector.on('collect', (_, emoji) => {
                switch (emoji.name) {
                    case Emoji.getEmojiReaction('success').name: {
                        author.yens -= Number(7500)
                        author.isMarry = true
                        author.marryWith = member.id
                        couple.yens -= Number(7500)
                        couple.isMarry = true
                        couple.marryWith = ctx.message.author.id
                        author.save()
                        couple.save()
                        msg.delete()
                        ctx.replyT('ring_couple', 'commands:marry.successfullyMarried')
                    }
                        break
                    case Emoji.getEmojiReaction('error').name: {
                        msg.delete()
                        ctx.replyT('broken_heart', 'commands:marry.rejectedRequest', { 0: member.mention })
                    }
                }
            })
        })
    }
}