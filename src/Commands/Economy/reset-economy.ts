import { Command } from '../../Interfaces';
import { Settings } from '../../Functions/settings';
import * as gradient from 'gradient-string';
import language from '../../Functions/language';
import { addCoins, setCoins, getCoins, getColor } from '../../Functions/economy';
import Discord, { Client, Intents, Constants, Collection, MessageActionRow, MessageButton, MessageEmbed, MessageAttachment } from 'discord.js';
import temporaryMessage from '../../Functions/temporary-message';
import profileSchema from '../../schemas/profileSchema';

export const command: Command = {
  name: "reseteconomy",
  description: "reset economy.",
  details: "Reset the whole economy of this guild",
  aliases: ["resetmoney"],
  hidden: false,
  UserPermissions: ["ADMINISTRATOR"],
  ClientPermissions: ["SEND_MESSAGES", "ADD_REACTIONS"],
  ownerOnly: false,
  run: async(client, message, args) => {
    const { guild, channel, author, mentions, member } = message;
    const guildId = guild?.id

    const setting = await Settings(message, 'money');
    if (setting == false) return temporaryMessage(channel, `${language(guild, 'SETTING_OFF')} Economy ${language(guild, 'SETTING_OFF2')}`, 10);

    const confirmation = await message.channel.send(`${language(guild, 'ECONOMY_RESET')} (Y, N, yes, no)`)
    const filter = (m: any) => m.author.id === message.author.id

    const collector = confirmation.channel.createMessageCollector({
      filter, 
      max: 1,
      time: 60000,
    });
  
    collector.on('collect', async (m) => {
      if (m.content.toLowerCase() == 'y' || 'yes') {
        const result = await profileSchema.deleteMany({
          guildId
        })
        temporaryMessage(m.channel, `${language(guild, 'ECONOMY_RESETSUCCESS')}`, 10)
      } else if (m.content.toLowerCase() == 'n' || 'no') return temporaryMessage(m.channel, `${language(guild, 'ECONOMY_PAYCANCELLED')}`, 5)
    });
    
  
    collector.on('end', (collected, reason) => {
      console.log(reason)
      if (reason === 'time') return temporaryMessage(message.channel,  `${language(guild, 'ECONOMY_PAYCANCELLED')}`, 5);
    });
  }
}
