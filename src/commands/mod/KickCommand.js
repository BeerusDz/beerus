const { Command, EmbedBuilder } = require('../../utils')

module.exports = class KickCommand extends Command {
  constructor() {
    super({
      name: 'kick',
      arguments: 1,
      aliases: ['expulsar'],
      permissions: [{
        entity: 'user',
        permissions: ['kickMembers']
      }, {
        entity: 'bot',
        permissions: ['kickMembers', 'embedLinks']
      }]
    })
  }

  async run(ctx) {
    const member = ctx.message.mentions[0] || ctx.client.users.get(ctx.args[0])
    const reason = ctx.args.slice(1)?.join(' ') || ctx._locale('basic:noReason')

    if (!member) return ctx.replyT('error', 'basic:invalidUser')
    if (member.id === ctx.message.author.id) return ctx.replyT('error', 'commands:kick.selfKick')
    if (member.id === ctx.message.channel.guild.ownerID) return ctx.replyT('error', 'commands:kick.ownerKick')

    const guildMember = ctx.message.channel.guild.members.get(member.id)

    try {
      const embed = new EmbedBuilder()
      embed.setTitle(ctx._locale('basic:punishment.kicked', { member: `${member.username}#${member.discriminator}` }))
      embed.setColor('MODERATION')
      embed.setThumbnail(member.avatarURL)
      embed.addField(ctx._locale('basic:punishment.embed.memberName'), `${guildMember.user.username}#${guildMember.user.discriminator} (\`${guildMember.user.id}\`)`)
      embed.addField(ctx._locale('basic:punishment.embed.staffName'), `${ctx.message.author.username}#${ctx.message.author.discriminator} (\`${ctx.message.author.id}\`)`)
      embed.addField(ctx._locale('basic:punishment.embed.reason'), reason)
      guildMember.kick(reason).then(() => ctx.send(embed.build()))

      if (ctx.db.guild.punishModule) {
        await ctx.message.channel.guild.channels.get(ctx.db.guild.punishChannel).createMessage({
          embed: embed
        })
      }
    } catch (e) {
      return ctx.replyT('error', 'commands:kick.error')
    }
  }
}
