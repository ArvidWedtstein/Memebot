import { EmbedBuilder } from 'discord.js';
import temporaryMessage from '../../Functions/temporary-message';
import language, { insert } from '../../Functions/language';
import { Settings } from '../../Functions/settings';
import { Command } from '../../Interfaces';
import { ErrorEmbed } from '../../Functions/ErrorEmbed';

export const command: Command = {
    name: "mute",
    description: "mute a user",
    group: __dirname.toLowerCase(),
    UserPermissions: ["MuteMembers"],
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
        const guildId = guild?.id
        const setting = await Settings(message, 'moderation');
        if (!setting) return ErrorEmbed(message, client, command, `${insert(guild, 'SETTING_OFF', "Moderation")}`);

        const user = mentions.users.first();
        const length: number = parseInt(args[1]);
        const reason: string = args.slice(2, args.length-1).join(' ');
        if (!user) return ErrorEmbed(message, client, command, `${language(guild, 'VALID_USER')}`);
        if (!length) return ErrorEmbed(message, client, command, "Please provide a length of the timeout"); 
        if (!reason) return ErrorEmbed(message, client, command, "Please provide a reason"); 
        const member = guild.members.cache.get(user.id)
        member?.timeout(length*1000, reason);
        const embed = new EmbedBuilder()
            .setTitle("Mute")
            .setDescription(`${user.username} was given a **${length}** timeout for **${reason}**`)
            .setFooter({ text: "Today at " })
            .setTimestamp()
        message.reply({embeds: [embed]})
    }
}