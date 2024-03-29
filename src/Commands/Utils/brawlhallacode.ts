import { Command } from '../../Interfaces';
import { Settings } from '../../Functions/settings';
import language from '../../Functions/language';
import { addCoins, setCoins, getCoins, getColor } from '../../Functions/economy';
import Discord, { Client, Constants, Collection, ActionRowBuilder, ButtonBuilder, EmbedBuilder, Interaction, AttachmentBuilder } from 'discord.js';
import temporaryMessage from '../../Functions/temporary-message';
import { addXP } from '../../Functions/Level';
import profileSchema from '../../schemas/profileSchema';
import { ErrorEmbed } from '../../Functions/ErrorEmbed';
export const command: Command = {
    name: "brawlhallacode",
    description: "Brawlhalla Code",
    details: "Brawlhalla Code",
    aliases: ["bwlcode", "addbrawlhallacode"],
    hidden: true,
    UserPermissions: ["Administrator"],
    ClientPermissions: ["SendMessages", "AddReactions", "EmbedLinks"],
    ownerOnly: true,
    examples: ["brawlhallacode {code} {name}"],
    run: async(client, message, args) => {
        const { guild, channel, author } = message;
        if (!guild) return


        // Make sure code doesn't get left in chat for everyone to read.
        message.delete();


        const capWords = (arr: any) => {
            return arr.map((el: any) => {
              return el.toLowerCase().charAt(0).toUpperCase() + el.toLowerCase().slice(1).toLowerCase();
            });
        }

        let codeRegex = new RegExp(/[a-zA-Z0-9]{6}-[a-zA-Z0-9]{6}/g);
        let code = args[0];
        if (!code || !codeRegex.test(code)) return ErrorEmbed(message, client, command, `${language(guild, "INVALID_BRAWLHALLA_CODE")} | ABCDEF-GHIJKL {Name}`);

        args.shift();

        if (args.join(' ').length < 1) return ErrorEmbed(message, client, command, `Name is not long enough`);
        const check = await profileSchema.findOne({
            userId: author.id,
            guildId: guild.id
        })

        if (check.brawlhallacodes.find((x:any) => x.code === code)) return ErrorEmbed(message, client, command, `${language(guild, "CODE_ALREADY_EXISTS")}`);
        
        if(args[0] === "Esport") args[0] = "Esports"
        
        let brawlhallacodes = {
            code: code,
            name: capWords(args).join(' '),
            redeemed: false
        }

        // $AddToSet operator adds a value to an array unless the value is already present
        const results = await profileSchema.findOneAndUpdate({
            userId: author.id,
            guildId: guild.id
        }, {
            $push: {
                brawlhallacodes
            }
        })

        return temporaryMessage(channel, `${language(guild, 'ADDED_BRAWLHALLA_CODE')}`, 30);
    }
}