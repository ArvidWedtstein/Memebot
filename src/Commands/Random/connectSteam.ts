import { Command } from '../../Interfaces';
import { Settings } from '../../Functions/settings';
import * as gradient from 'gradient-string';
import language from '../../Functions/language';
import { addCoins, setCoins, getCoins, getColor } from '../../Functions/economy';
import Discord, { Client, Intents, Constants, Collection, MessageActionRow, MessageButton, MessageEmbed, MessageAttachment } from 'discord.js';
import temporaryMessage from '../../Functions/temporary-message';
import profileSchema from '../../schemas/profileSchema';
import { addXP, getXP, getLevel } from '../../Functions/Level';
import moment from 'moment';
import axios from 'axios';
export const command: Command = {
    name: "connectsteam",
    description: "Connect your personal profile to steam",
    details: "Connect your personal profile to steam",
    aliases: ["steam"],
    ownerOnly: false,
    ClientPermissions: ["SEND_MESSAGES", "SEND_MESSAGES_IN_THREADS", "VIEW_CHANNEL"],
    UserPermissions: ["SEND_MESSAGES"],
    run: async(client, message, args) => {
        const { guild, mentions, author, channel, content } = message;

        if (!guild) return;
        if (!args[0]) return temporaryMessage(channel, 'Please provide a steam id', 50);
        
        profileSchema.findOne({
            userId: author.id,
            guildId: guild.id
        }).then(async(results) => {
            if (!results) return temporaryMessage(channel, 'You do not have a profile. Please create one with -profile', 50);
            
            axios.get(`https://api.brawlhalla.com/search?steam_id=${args[0]}&api_key=${process.env.BRAWLHALLA_API_KEY}`).then(async(res) => {
                if (!res.data.length) return temporaryMessage(channel, 'No results found', 50);

                if (res.data.brawlhalla_id) {
                    results.brawlhallaId = res.data.brawlhalla_id;
                    // return temporaryMessage(channel, `Successfully connected your profile to Brawlhalla`, 50);
                }
            });
            results.steamId = args[0];
            results.save().then(() => {
                return temporaryMessage(channel, 'Your steam id has been linked to your profile', 50);
            })
        })
    }
}