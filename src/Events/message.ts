import { Event, Command} from '../Interfaces';
import Client from '../Client';
import { Message } from 'discord.js';

export const event: Event = {
    name: "messageCreate",
    run: (client: Client, message: Message) => {
        if (
            message.author.bot ||
            !message.guild ||
            !message.content.startsWith(client.config.prefix)
        ) return;

        const validatePermissions = (permissions: string[]) => {
            const validPermissions = [
                'CREATE_INSTANT_INVITE',
                'KICK_MEMBERS',
                'BAN_MEMBERS',
                'ADMINISTRATOR',
                'MANAGE_CHANNELS',
                'MANAGE_GUILD',
                'ADD_REACTIONS',
                'VIEW_AUDIT_LOG',
                'PRIORITY_SPEAKER',
                'STREAM',
                'VIEW_CHANNEL',
                'SEND_MESSAGES',
                'SEND_TTS_MESSAGES',
                'MANAGE_MESSAGES',
                'EMBED_LINKS',
                'ATTACH_FILES',
                'READ_MESSAGE_HISTORY',
                'MENTION_EVERYONE',
                'USE_EXTERNAL_EMOJIS',
                'VIEW_GUILD_INSIGHTS',
                'CONNECT',
                'SPEAK',
                'MUTE_MEMBERS',
                'DEAFEN_MEMBERS',
                'MOVE_MEMBERS',
                'USE_VAD',
                'CHANGE_NICKNAME',
                'MANAGE_NICKNAMES',
                'MANAGE_ROLES',
                'MANAGE_WEBHOOKS',
                'MANAGE_EMOJIS',
            ]
        
            for (const permission of permissions) {
                if (!validPermissions.includes(permission)) {
                    throw new Error(`Unknown permission node "${permission}"`)
                }
            }
        }
        const args = message.content
            .slice(client.config.prefix.length)
            .trim()
            .split(/ + /g);
        
        const cmd = args.shift()?.toLowerCase();
        if (!cmd) return
        const command = client.commands.get(cmd) || client.aliases.get(cmd);
        // validatePermissions(command?.permissions || []);
        console.log(command)
        if (command?.permissions) {
            command?.permissions.forEach((p) => {
                if (!message.member?.permissions.toArray().includes(p)) return
            })
        }
        
        if (command) (command as Command).run(client, message, args);


        
    }
}