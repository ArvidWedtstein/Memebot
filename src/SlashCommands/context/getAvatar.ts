import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, ContextMenuInteraction } from "discord.js";
import { SlashCommand } from '../../Interfaces';
export const slashCommand: SlashCommand = {
    name: "getavatar",
    // description: "getavatar",
    type: "USER",
    permissions: ["ADMINISTRATOR"],
    // options: [
    //     {
    //         name: "test",
    //         type: "BOOLEAN",
    //         description: "test"
    //     }  
    // ],
    testOnly: true,
    run: async (client, interaction) => {
        // if (!interaction.isCommand()) return
        if (interaction.isCommand()) return

        
        if (interaction.isUserContextMenu()) {

            // const msg = await interaction.channel?.messages.fetch(
            //     interaction.targetId
            // )
            const user = interaction.targetUser
            await interaction.reply({ content: `.${user.avatarURL()?.toString()}`, fetchReply: true })
            return
        }
        // if (interaction.isContextMenu()) console.log('context MENU')
        //const subCommand = interaction.options.getSubcommand();
        
    }
    
}