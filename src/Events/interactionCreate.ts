import { Event, Command, SlashCommand} from '../Interfaces';
import Client from '../Client';
import { Interaction, Message, CommandInteraction, GuildMember, PermissionString } from 'discord.js';
import temporaryMessage from '../Functions/temporary-message';
import language from '../Functions/language';


export const event: Event = {
    name: "interactionCreate",
    run: async (client: Client, interaction: Interaction) => {
        const member = interaction.member as GuildMember;
        const validatePermissions = (permissions: PermissionString[]) => {
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
        if (
            interaction.user.bot ||
            !interaction.guild
        ) return;
        
        if (interaction.isCommand()) {
            interaction.deferReply({ ephemeral: true})
            const cmd = interaction.commandName
            if (!cmd) return;
            const command = client.slashCommands.get(cmd);
            if (command?.permissions) {
                validatePermissions(command?.permissions);
                
                command?.permissions.forEach(async (perm) => {
                    if (!member.permissions.has(perm)) return temporaryMessage(interaction.channel, `${await language(interaction.guild, 'PERMISSION_ERROR')}`);
                })
            }

            if (command?.ClientPermissions && interaction.guild.me?.permissions) {
                validatePermissions(interaction.guild.me?.permissions.toArray());
                
                command?.ClientPermissions.forEach(async (perm) => {
                    if (!interaction.guild?.me?.permissions.has(perm)) return temporaryMessage(interaction.channel, `${await language(interaction.guild, 'CLIENTPERMISSION_ERROR')}`);;
                })
            }
            if (command) (command as SlashCommand).run(client, interaction);
        };
        if (interaction.isButton()) return
        if (interaction.isContextMenu() || interaction.isUserContextMenu()) {
            await interaction.deferReply({ ephemeral: true });
            console.log(client.slashCommands.get(interaction.commandName))
            const command = client.slashCommands.get(interaction.commandName);
            if (command?.permissions) {
                validatePermissions(command?.permissions);
                
                command?.permissions.forEach(async (perm) => {
                    if (!member.permissions.has(perm)) return temporaryMessage(interaction.channel, `${await language(interaction.guild, 'PERMISSION_ERROR')}`);
                })
            }

            if (command?.ClientPermissions && interaction.guild.me?.permissions) {
                validatePermissions(interaction.guild.me?.permissions.toArray());
                
                command?.ClientPermissions.forEach(async (perm) => {
                    if (!interaction.guild?.me?.permissions.has(perm)) return temporaryMessage(interaction.channel, `${await language(interaction.guild, 'CLIENTPERMISSION_ERROR')}`);;
                })
            }
            if (command) command.run(client, interaction);

        }
    }
}