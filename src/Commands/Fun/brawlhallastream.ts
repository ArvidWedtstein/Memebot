import { Command } from '../../Interfaces';
import { Settings } from '../../Functions/settings';
import * as gradient from 'gradient-string';
import language from '../../Functions/language';
import { addCoins, setCoins, getCoins, getColor } from '../../Functions/economy';
import Discord, { Client, Intents, Constants, Collection, MessageActionRow, MessageButton, MessageEmbed, Interaction } from 'discord.js';
import temporaryMessage from '../../Functions/temporary-message';
import profileSchema from '../../schemas/profileSchema';
export const command: Command = {
    name: "brawlhalla",
    description: "get brawlhalla stream notifications",
    aliases: ["brawlhallastream"],
    hidden: false,
    UserPermissions: ["SEND_MESSAGES"],
    ClientPermissions: ["SEND_MESSAGES", "ADD_REACTIONS"],
    ownerOnly: false,
    examples: ["brawlhalla"],
    
    run: async(client, message, args) => {
        const { channel, author, guild, mentions } = message;

        const userId = author.id;
        const guildId = guild?.id;
        const results = await profileSchema.findOne({
            userId,
            guildId
        })
        if (!results.brawlhalla) {
            await new profileSchema({
                guildId,
                userId
            }).save()
        }

        const btnoff = new MessageButton() 
            .setCustomId('brawlhallabuttonoff')
            .setEmoji('885437713707331634')
            .setLabel('I want brawlhalla notification plz')
            .setStyle("DANGER")
        const rowoff = new MessageActionRow().addComponents(btnoff);

        const btnon = new MessageButton() 
            .setCustomId('brawlhallabuttonon')
            .setEmoji('885437713707331634')
            .setLabel('I do not wish brawlhalla notification plz')
            .setStyle("SUCCESS")
        const rowon = new MessageActionRow().addComponents(btnon);
        const btn = new MessageButton() 
            .setCustomId('brawlhallabutton')
            .setEmoji('885437713707331634')
            .setLabel(results.brawlhalla ? 'I do not wish brawlhalla notification plz' : 'I do not wish brawlhalla notification plz')
            .setStyle(results.brawlhalla ? "SUCCESS" : "DANGER")
        const row = new MessageActionRow().addComponents(btn);


        const embedoff = new MessageEmbed()
            .setAuthor({name: `${author.username}`, iconURL: author.displayAvatarURL()})
            .setTitle(`is not registered to recieve brawlhalla notifications`)
            .setFooter({ text: `Requested by ${author.tag}`})
            .setTimestamp()
        
        const embed = (data: any) => {
            const currentembed = new MessageEmbed()
                .setAuthor({name: `${author.username}`, iconURL: author.displayAvatarURL()})
                .setTitle(data ? `is now registered to recieve brawlhalla notifications`: `is not registered to recieve brawlhalla notifications`)
                .setFooter({ text: `Requested by ${author.tag}`})
                .setTimestamp()
            return currentembed
        }
        const embedon = new MessageEmbed()
            .setAuthor({name: `${author.username}`, iconURL: author.displayAvatarURL()})
            .setTitle(`is now registered to recieve brawlhalla notifications`)
            .setFooter({ text: `Requested by ${author.tag}`})
            .setTimestamp()

        channel.send({ 
            embeds: [embed(results.brawlhalla) ], 
            components: [row] 
        }).then(async msg => {
            const filter = (i: Interaction) => i.user.id === author.id;
            let collect = msg.createMessageComponentCollector({
                filter, 
                max: 1,
                time: 60*1000
            });

            // Check for button interaction
            collect.on('collect', async (reaction: any) => {
                if (!reaction) return;
                if (!reaction.isButton()) return;
                if (reaction.customId !== 'brawlhallabutton') return

                const res = await profileSchema.findOneAndUpdate({
                    userId,
                    guildId
                }, {
                    brawlhalla: results.brawlhalla ? false : true
                })
                reaction.update({ embeds: [embed(!results.brawlhalla)] })
                return 
            })
        })
    }
}