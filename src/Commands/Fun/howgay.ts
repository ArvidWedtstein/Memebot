import { Command } from '../../Interfaces';
import { Settings } from '../../Functions/settings';
import * as gradient from 'gradient-string';
import language from '../../Functions/language';
import { addCoins, setCoins, getCoins, getColor } from '../../Functions/economy';
import Discord, { Client, Intents, Constants, Collection, MessageActionRow, MessageButton, MessageEmbed, EmojiIdentifierResolvable } from 'discord.js';
import temporaryMessage from '../../Functions/temporary-message';
export const command: Command = {
    name: "howgay",
    description: "check the true gayness of your homie",
    group: __dirname,
    run: async(client, message, args) => {
        const { guild, channel, mentions } = message
        // message.delete()
        const guildId = guild?.id
        const emoji: any = client.emojis.cache.get('801707111657504799')
        const getRandomIntInclusive = (async (min: number, max: number) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            const res: any = Math.floor(Math.random() * (max - min + 1)) + min;
            return res; //The maximum is inclusive and the minimum is inclusive 
        })
        const member = mentions.users.first()?.username || args[0];
        if (!member) return temporaryMessage(channel, `Could not find any member`)
        
        const gay = await getRandomIntInclusive(0, 100);

        let messages = [
            `results`,
            `measurements`,
            `research`,
            `conclusion`,
            `calculations`,
            `decision`,
            `opinion`
        ]
        let randomMsg = messages[Math.floor(Math.random()*messages.length)];
        let embed = new Discord.MessageEmbed()
                .setColor('#ff00ff')
                .setTitle('Gayness Meter')
                .setDescription(`According to my ${randomMsg}, ${member}.\nis ${gay}% gay`)
        let messageEmbed = await message.channel.send({embeds: [embed]}).then(embedMessage => {
            if (gay > 60) {
                embedMessage.react(emoji)
            }
        });
    }
}
