import { ColorResolvable, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../Interfaces';
import language, { insert } from '../../Functions/language';
import { addCoins, setCoins, getCoins, getColor } from '../../Functions/economy';
import temporaryMessage from '../../Functions/temporary-message';
import { Settings } from '../../Functions/settings';
import { ErrorEmbed } from '../../Functions/ErrorEmbed';
export const command: Command = {
    name: "balance",
    aliases: ["bal"],
    description: "check your balance",
    UserPermissions: ["SendMessages"],
    ClientPermissions: [
        'SendMessages',
        'AddReactions',
        'AttachFiles',
        'EmbedLinks',
        'ManageMessages',
        'ReadMessageHistory',
        'ViewChannel'
    ],
    run: async(client, message, args) => {
        const { guild, author, mentions, channel } = message
        if (!guild) return;
        const target = author || mentions.users.first();
        const guildId = guild?.id
        const userId = target.id
        const setting = await Settings(message, 'money');
        // const setting: boolean = true;

        if (!setting) return ErrorEmbed(message, client, command, `${insert(guild, 'SETTING_OFF', "Economy")}`);

        // Get coins and user defined color
        let coins = await getCoins(guildId, userId);
        let color: ColorResolvable = await getColor(guildId, userId);
        
        const attachment = new AttachmentBuilder('./img/banner.jpg');

        const erlingcoin = client.emojis.cache.get('853928115696828426');
        let embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({name: `${target.username}`, iconURL: target.displayAvatarURL()})
            .setTitle(`${await language(guild, "BALANCE_TITLE")}`)
            .setDescription(`${await language(guild, "BALANCE_AMOUNT")} **${coins}** ErlingCoin${coins === 1 ? '' : 's'} ${erlingcoin}`)
            .setImage('attachment://banner.jpg')
        channel.send({embeds: [embed], files: [attachment] });
    }
}