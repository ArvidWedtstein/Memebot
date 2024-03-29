import { Command } from '../../Interfaces';
import { Settings } from '../../Functions/settings';
import language, { insert } from '../../Functions/language';
import { addCoins, setCoins, getCoins, getColor } from '../../Functions/economy';
import Discord, { Client, Constants, Collection, EmbedBuilder } from 'discord.js';
import temporaryMessage from '../../Functions/temporary-message';
import settingsSchema from '../../schemas/settingsSchema';
import { ErrorEmbed } from '../../Functions/ErrorEmbed';

export const command: Command = {
    name: "kick",
    description: "lets you kick a unwanted user",
    aliases: [],
    group: __dirname,
    UserPermissions: ["KickMembers"],
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
        message.delete()
        const { guild, author, mentions, channel } = message
        if (!guild) return;
        const guildId = guild.id;
        const setting = await Settings(message, 'moderation');

        if (!setting) return ErrorEmbed(message, client, command, `${insert(guild, 'SETTING_OFF', "Moderation")}`);
        
        const target = mentions.users.first();
        if (!target) return ErrorEmbed(message, client, command, `${author}, ${language(guild, 'USER_NOTFOUND')}`);
        

        let reason = args.slice(1).join(' ');

        // If there is no reason
        if (!reason) reason = `${await language(guild, 'BAN_NOREASON')}`;

        if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

        const targetMember = guild.members.cache.get(target.id);
        let result = await settingsSchema.findOne({
            guildId
        })
        let userembed = new EmbedBuilder()
            .setColor(client.config.botEmbedHex)
            .setTitle(`Important Message`)
            .setDescription(`I'm sorry to inform you that you have been forcefully removed from **${guild.name}**.
            You have been removed because ${reason}. 
            `)
            .setFooter({ text: `Best regards, ${client.user?.username}`, iconURL: targetMember?.displayAvatarURL() })
            .setTimestamp()

        targetMember?.kick(reason);

        if (!result?.serverlog) return 
        const logchannel = guild.channels.cache.find(channel => channel.id === result?.serverlog);
        if (!logchannel) return;
        if (!logchannel.isTextBased()) return
        let logembed = new EmbedBuilder()
            .setColor(client.config.botEmbedHex)
            .setAuthor({ name: `${author.username}`, iconURL: author.displayAvatarURL() })
            .setDescription(`kicked\n\n${language(guild, 'BAN_REASON')}: ${reason}`)
            .setFooter({ text: `${targetMember}`, iconURL: targetMember?.displayAvatarURL() })
        logchannel.send({ embeds: [logembed] });
    }
}