import { Event, Command} from '../Interfaces';
import Client from '../Client';
import { Message, EmbedBuilder } from 'discord.js';
import afk from '../Collection';
import moment from 'moment';
import { time } from '@discordjs/builders';
import temporaryMessage from '../Functions/temporary-message';

export const event: Event = {
    name: "messageCreate",
    run: (client: Client, message: Message) => {
        if (
            message.author.bot ||
            !message.guild
        ) return;
        // const member = message.mentions.members?.first();
        // if (member) {
        //     const data: any = afk.get(member.id);

        //     if (data) {
        //         const reason = data[1];
        //         const timestamp = data[0];
        //         const timeAgo: any = moment(timestamp).fromNow();

        //         const embed = new EmbedBuilder() 
        //             .setAuthor({name: `.`, iconURL: member.displayAvatarURL()})
        //             .setTitle(`Reason: ${reason}`)
        //             .setFooter({ text: `${member.user.tag} is currently afk`})
        //             .setTimestamp(timeAgo)
        //         message.reply({ embeds: [embed] })
        //     }
        // }
        const getData = afk.get(message.author.id);
        if (getData) {
            afk.delete(message.author.id)
            temporaryMessage(message.channel, `${message.member} is not afk anymore.`,);
        }
        
        


        
    }
}