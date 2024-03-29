import { Event, Command, SlashCommand} from '../Interfaces';
import Client from '../Client';
import { Interaction, Message, CommandInteraction, GuildMember, PermissionsString, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonInteraction } from 'discord.js';
import temporaryMessage from '../Functions/temporary-message';
import language from '../Functions/language';
import { arg } from 'mathjs';
import TicketSchema from '../schemas/TicketSchema';
import settingsSchema from '../schemas/settingsSchema';


export const event: Event = {
    name: "interactionCreate",
    run: async (client: Client, interaction: ButtonInteraction) => {
        if (!interaction.isButton()) return
        const { customId, guild, member, channel } = interaction

        if (!guild) return
        if (!member) return
        if (!channel) return
        if (!channel.isTextBased()) return

        if (!["closeticket", "lockticket", "unlockticket"].includes(customId)) return

        if (!Object(await member.permissions).has("Administrator")) return temporaryMessage(channel, `${language(guild, 'PERMISSION_ERROR')}`, 10);

        const embed = new EmbedBuilder()
            .setColor(client.config.botEmbedHex)
        
        const getEmoji = (emojiName: string) => client.emojis.cache.find((emoji) => emoji.name === emojiName);
        TicketSchema.findOne({ guildId: guild.id, ChannelId: channel.id }, async (err: any, ticket: any) => {
            if (err) throw err;
            if (!ticket) return interaction.reply({
                content: `No data was found related to this ticket, please delete manually`,
                ephemeral: true
            });

            switch (customId) {
                case "closeticket":
                    await TicketSchema.updateOne({
                        guildId: guild.id,
                        ChannelId: channel.id
                    }, {
                        Closed: true
                    })
                    // discord-html-transcripts?
                    let msgs = Array.from(channel.messages.cache.keys())
                    guild.members.cache.get(ticket.userId)?.send({ content: `Your ticket has been closed by ${member}\n${msgs.join('\n')}` })

                    interaction.reply({
                        embeds: [embed.setDescription(`Ticket closed\nChannel will be deleted in 10 seconds`)]
                    })
                    setTimeout(() => {
                        channel.delete()
                    }, 1000 * 10)
                    break;
                case "lockticket":
                    if (ticket.Locked == true) return interaction.reply({
                        content: `This ticket is already locked`,
                        ephemeral: true
                    });

                    await TicketSchema.updateOne({
                        guildId: guild.id,
                        ChannelId: channel.id
                    }, {
                        Locked: true
                    })

                    embed.setDescription(`🔒 | Ticket is now locked for reviewing.`)
                    // channel.permissionOverwrites.edit(guild.roles.everyone, {
                    //     ViewChannel: false,
                    //     SendMessages: false,
                    //     AddReactions: false,
                    //     AttachFiles: false,
                    //     EmbedLinks: false,
                    //     ReadMessageHistory: false
                    // })

                    return interaction.reply({
                        embeds: [embed]
                    })
                    break;
                case "unlockticket":
                    if (ticket.Locked == false) return interaction.reply({
                        content: `This ticket is already unlocked`,
                        ephemeral: true
                    });

                    await TicketSchema.updateOne({
                        guildId: guild.id,
                        ChannelId: channel.id
                    }, {
                        Locked: false
                    })

                    embed.setDescription(`🔓 | Ticket is now unlocked.`)

                    return interaction.reply({
                        embeds: [embed]
                    })
                    break;
            }
        })
    }
}