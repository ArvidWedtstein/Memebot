import { Command } from '../../Interfaces';
import { Settings } from '../../Functions/settings';

import language, { insert } from '../../Functions/language';
import { addCoins, setCoins, getCoins, getColor } from '../../Functions/economy';
import Discord, { Client, Constants, Collection, ActionRowBuilder, ButtonBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import temporaryMessage from '../../Functions/temporary-message';
import profileSchema from '../../schemas/profileSchema';
import { ErrorEmbed } from '../../Functions/ErrorEmbed';

export const command: Command = {
    name: "birthday",
    description: "set your birthday",
    details: "set your birthday to recieve xp on your birthday.",
    aliases: ["setbirthday", "addbirthday"],
    hidden: false,
    UserPermissions: ["SendMessages"],
    ClientPermissions: ["SendMessages", "AddReactions"],
    ownerOnly: false,
    examples: ["birthday <day>/<month>/<year>", "birthday 03/10/2004"],
    
    run: async(client, message, args) => {

        const { guild, channel, author, mentions } = message

        if (!guild) return;
        
    
        const setting = await Settings(message, 'moderation');
        if (!setting) return ErrorEmbed(message, client, command, `${insert(guild, 'SETTING_OFF', "Birthdays")}`);
        
        const user = guild.members.cache.get(mentions?.users?.first()?.id || author.id)

        if (mentions.users.first()) args.shift();
        
        const joined = args.join(" ");
        const split = joined.trim().split("/");
        let [ day, month, year ]: any = split;

        
        if (!day) return ErrorEmbed(message, client, command, `${language(guild, 'BIRTHDAY_DAY')}`);
        if (!month) return ErrorEmbed(message, client, command, `${language(guild, 'BIRTHDAY_MONTH')}`);
        if (!year) return ErrorEmbed(message, client, command, `${language(guild, 'BIRTHDAY_YEAR')}`);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return ErrorEmbed(message, client, command, `${language(guild, 'BIRTHDAY_NaN')}`);

        day = parseInt(day);
        month = parseInt(month);
        year = parseInt(year);

        function ifNumberIsLessThanTen(number: number) {
            if (number < 10) {
                return `0${number}`;
            }
            return number;
        }
        
        day = ifNumberIsLessThanTen(day);
        month = ifNumberIsLessThanTen(month);
 
        if ((day > 31 || day < 1) || (month > 12 || month < 1) || (year > new Date().getFullYear() || year < 1900)) return ErrorEmbed(message, client, command, `${language(guild, 'BIRTHDAY_FORMAT')}`);

        const birthday = `${day}/${month}/${year}`;

        
        const userId = user?.id;
        const proresult = await profileSchema.updateMany({ userId }, { $set: { birthday } });


        const attachment = new AttachmentBuilder('./img/banner.jpg');
        
        let embed = new EmbedBuilder()
            .setColor(client.config.botEmbedHex)
            .setAuthor({ 
                name: `${user?.user.username}'s ${language(guild, 'BIRTHDAY_CHANGE')} ${birthday}`, 
                iconURL: user?.user.displayAvatarURL()
            })
            .setImage('attachment://banner.jpg')

        return message.reply({ 
            embeds: [embed],
            files: [attachment]
        })
    }
}

