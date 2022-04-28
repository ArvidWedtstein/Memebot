import { Command } from '../../Interfaces';
import { Settings } from '../../Functions/settings';
import * as gradient from 'gradient-string';
import language from '../../Functions/language';
import { addCoins, setCoins, getCoins, getColor } from '../../Functions/economy';
import Discord, { Client, Intents, Constants, Collection, MessageActionRow, MessageButton, MessageEmbed, Interaction, MessageAttachment } from 'discord.js';
import temporaryMessage from '../../Functions/temporary-message';
import { addXP } from '../../Functions/Level';
export const command: Command = {
    name: "testembed",
    description: "testembed",
    details: "testembed",
    aliases: ["testingembed"],
    hidden: true,
    UserPermissions: ["ADMINISTRATOR"],
    ClientPermissions: ["SEND_MESSAGES", "ADD_REACTIONS", "EMBED_LINKS"],
    ownerOnly: true,
    examples: ["testembed"],
    
    run: async(client, message, args) => {
        const { guild, channel, author } = message;

        const guildId = guild?.id;
        const userId = author.id

        let color = await getColor(guildId, userId)
        
        const btn = new MessageButton()
            .setCustomId('daily')
            .setLabel(`Click to claim your XP`)
            .setEmoji('💸')
            .setStyle('SUCCESS')
        const row = new MessageActionRow()
            .addComponents(btn)
        const attachment = new MessageAttachment('./img/banner.jpg', 'banner.jpg');
        const embed = new MessageEmbed()
            .setColor(color)
            .setDescription(`jjj`)
            .setImage('attachment://banner.jpg')
            .setFooter({ text: `Requested By ${author.tag}`, iconURL: author.displayAvatarURL() })
        message.reply({ embeds: [embed], components: [row], files: [attachment] }).then(async msg => {
            const filter = (i: Interaction) => i.user.id === author.id;
            let collect = msg.createMessageComponentCollector({
                filter, 
                max: 1,
                time: 60*1000
            });
            collect.on('collect', async (reaction) => {
                if (!reaction) return;
                reaction.deferUpdate();
                // reaction.message.embeds[0].description = `${author} ${await language(guild, "DAILY_ERLINGCOINS")}! (${xpreward}xp)`
                // msg.edit({ embeds: [embed.setDescription(`${author} ${await language(guild, "DAILY_ERLINGCOINS")}! (${xpreward}xp)`)] })
            })
        })
    }
}