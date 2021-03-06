import Discord, { Client, Intents, Constants, Collection, MessageActionRow, MessageButton, MessageEmbed, ApplicationCommandOption } from 'discord.js';
import mongoose, { connect, mongo } from 'mongoose';
import path from 'path';
import { readdirSync } from 'fs';
import { Command, SlashCommand, Event, Config } from '../Interfaces';
import * as dotenv from 'dotenv';
import * as gradient from 'gradient-string';
import { REST } from '@discordjs/rest';
import { ApplicationCommandOptionTypes, ApplicationCommandTypes } from 'discord.js/typings/enums';
import { Routes } from 'discord-api-types/v10';
import { Registry } from '../Interfaces/Registry';
import { Player } from 'discord-player';
import { GetToken } from '../Functions/TwitchTokenManager';


dotenv.config();

class ExtendedClient extends Client {
    public slashCommands: Collection<string, SlashCommand> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public registry = new Registry(this);
    public player = new Player(this, {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        },
        connectionTimeout: 10000
    });

    public config: Config = {
        token: process.env.CLIENT_TOKEN, 
        mongoURI: process.env.REMOTE_MONGODB, 
        prefix: process.env.PREFIX,
        botEmbedHex: "#ff4300",
        testServer: "848946037628076082",
        invite: "https://discord.com/oauth2/authorize?client_id=787324889634963486&scope=bot&permissions=10200548352",
        owner: "320137922370338818",
        BrawlhallaToken: ""
    };
    public constructor() {
        super({ 
            intents: [
                Intents.FLAGS.GUILDS, 
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_PRESENCES,
                Intents.FLAGS.GUILD_BANS,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
                Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
                Intents.FLAGS.GUILD_INVITES,
                Intents.FLAGS.GUILD_INTEGRATIONS,
                Intents.FLAGS.GUILD_MESSAGE_TYPING,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_VOICE_STATES
            ],
            messageCacheLifetime: 60,
            // messageSweepInterval: 180,
            restGlobalRateLimit: 180,
            shards: 'auto',
            restTimeOffset: 0, // Enabled speed reacting
            restWsBridgeTimeout: 100,
            failIfNotExists: true,
            
            allowedMentions: { parse: ['users', 'roles', 'everyone'], repliedUser: true},
            partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBER", "USER"],
            presence: {
                status: "online",
                activities: [
                    {
                        type: "PLAYING",
                        name: "-help"
                    }
                ],
                afk: false
            }
        });
    }
    public async init() {
        this.login(this.config.token);
        
        // ----------------------------
        // Connect to database
        // ----------------------------
        let options = {
            "keepAlive": true,
            "useNewUrlParser": true,
            "useUnifiedTopology": true
        }
        await mongoose.connect(this.config.mongoURI, options).then(async (t) => {
            console.log(`Connected to ${gradient.fruit('Database')}`)
        }).catch((err) => {
            console.error('App starting error:', err.stack);
        });
        
        // AGSIOS Clyent https://betterprogramming.pub/how-to-write-clean-api-calls-with-axios-ddbc7df4256c

        
        // ----------------------------
        // Load Commands
        // ----------------------------
        const commandPath = path.join(__dirname, "..", "Commands");

        this.registry.registerGroups([
            { id: "admin", name: "Admin" },
            { id: "economy", name: "Economy" },
            { id: "fun", name: "Fun" },
            { id: "general", name: "General" },
            { id: "guild", name: "Guild" },
            { id: "inventory", name: "Inventory" },
            { id: "language", name: "Language" },
            { id: "level", name: "Level" },
            { id: "music", name: "Music" },
            { id: "random", name: "Random" },
            { id: "reaction", name: "Reaction" },
            { id: "utils", name: "Utils" },
        ])
        this.registry.registerCommandsIn(commandPath)

        // ----------------------------
        // Load Events
        // ----------------------------
        const eventPath = path.join(__dirname, "..", "Events");
        readdirSync(eventPath).forEach(async (file) => {
            const { event } = await import(`${eventPath}/${file}`);
            if (!event) return;
            this.events.set(event.name, event);
            this.on(event.name, event.run.bind(null, this));
        })


        // ----------------------------
        // Load Slash Commands
        // ----------------------------
        const rest = new REST({ version: '10' }).setToken(this.config.token);
        const slashCommandPath = path.join(__dirname, "..", "SlashCommands");
        const testcmds: any = []
        const globalcmds: any = []
        readdirSync(slashCommandPath).forEach((dir) => {
            const commands = readdirSync(`${slashCommandPath}/${dir}`).filter((file) => file.endsWith('.js'));

            for (const file of commands) {
                const { slashCommand } = require(`${slashCommandPath}/${dir}/${file}`);
                let commandtypes = [
                    'CHAT_INPUT',
                    'USER',
                    'MESSAGE'
                ]
                let commandoptiontypes = [
                    "SUB_COMMAND",
                    "SUB_COMMAND_GROUP",
                    "STRING",
                    "INTEGER",
                    "BOOLEAN",
                    "USER",
                    "CHANNEL",
                    "ROLE",
                    "MENTIONABLE",
                    "NUMBER"
                ]
                let cmd: any = slashCommand;
                this.slashCommands.set(slashCommand.name, slashCommand);

                cmd.type = commandtypes.indexOf(slashCommand.type)+1;

                if (slashCommand.type === "CHAT_INPUT") {
                    cmd.description = slashCommand.description;
                }
                if (cmd.options) {
                    cmd.options.forEach((option: any) => {
                        if (option.options) {
                            option.options.forEach((option2: any) => {
                                option2.type = commandoptiontypes.indexOf(option2.type)+1
                            })
                        }
                        option.type = commandoptiontypes.indexOf(option.type)+1
                    })
                }

                if (slashCommand.testOnly) {
                    testcmds.push(cmd);
                } else if (slashCommand.testOnly == false) {
                    globalcmds.push(cmd)
                }
            }
        });
        if (testcmds.length > 0) {
            (async () => {
                try {
                    console.log('Started refreshing application (/) commands.', this.user?.id);
                    
                    if (this.user?.id) await rest.put(Routes.applicationGuildCommands(this.user?.id || '', this.config.testServer), { body: testcmds });

                    if (this.user?.id) console.log('Successfully reloaded application (/) commands.');
                } catch (error) {
                    console.error(error);
                }
            })();
        }
        
        if (globalcmds.length > 0) {
            (async () => {
                try {
                    console.log('Started refreshing global (/) commands.', this.user?.id);
            
                    await rest.put(
                        Routes.applicationCommands(this.user?.id || ''),
                        { body: globalcmds }
                    )
                    console.log('Successfully reloaded global (/) commands.');
                } catch (error) {
                    console.error(error);
                }
            })();
        }

        process.on('unhandledRejection', (reason, p) => {
            console.log('\n=== Unhandled Rejection ==='.toUpperCase(), '\nReason: ', reason);
        })
        process.on("uncaughtException", (err, origin) => {
            console.log('\n=== Uncaught Exception ==='.toUpperCase(),'\nException: ', err.stack ? err.stack : err)
        })
        process.on('uncaughtExceptionMonitor', (err, origin) => { }).on('multipleResolves', (type, promise, reason) => { });
    }
}

export default ExtendedClient;