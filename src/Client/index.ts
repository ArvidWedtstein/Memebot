import Discord, { Routes, Client, GatewayIntentBits, Constants, SlashCommandBuilder, Collection, Partials, ActivityType } from 'discord.js';
import mongoose, { connect, mongo } from 'mongoose';
import path from 'path';
import { readdirSync } from 'fs';
import { Command, SlashCommand, Event, Config } from '../Interfaces';
import * as dotenv from 'dotenv';
import * as gradient from 'gradient-string';
import { REST } from '@discordjs/rest';
import { Registry } from '../Interfaces/Registry';
import { generateDependencyReport } from '@discordjs/voice'
// import { Player } from 'discord-player';
import { GetToken } from '../Functions/TwitchTokenManager';


dotenv.config();

class ExtendedClient extends Client {
    public slashCommands: Collection<string, SlashCommand> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public registry = new Registry(this);
    // public player = new Player(this, {
    //     ytdlOptions: {
    //         quality: 'highestaudio',
    //         highWaterMark: 1 << 25
    //     },
    //     connectionTimeout: 10000
    // });

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
                GatewayIntentBits.Guilds, 
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent
            ],
            //messageCacheLifetime: 60,
            // messageSweepInterval: 180,
            // restGlobalRateLimit: 180,
            shards: 'auto',
            // restTimeOffset: 0, // Enabled speed reacting
            // restWsBridgeTimeout: 100,
            failIfNotExists: true,
            
            allowedMentions: { parse: ['users', 'roles', 'everyone'], repliedUser: true},
            partials: [
                Partials.Message, 
                Partials.Channel, 
                Partials.Reaction, 
                Partials.GuildMember, 
                Partials.User
            ],
            presence: {
                status: "online",
                activities: [
                    {
                        type: ActivityType.Playing,
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

                if (slashCommand.name == 'profile') {
                    this.slashCommands.set(slashCommand.name, slashCommand);
                    const cmd = Object.assign({}, slashCommand);
                    delete cmd.run
                    delete cmd.type
                    delete cmd.testOnly
                    delete cmd.options
                    
                    if (slashCommand.testOnly) {
                        testcmds.push(cmd);
                    } else if (slashCommand.testOnly == false) {
                        globalcmds.push(cmd)
                    }
                }
            }
        });

        if (testcmds.length > 0) {
            try {
                console.log('Started refreshing application (/) commands.', this.user?.id);
                
                rest.put(Routes.applicationGuildCommands(this.user?.id || '', this.config.testServer), { body: testcmds });

                if (this.user?.id) console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.error(error);
            }
        }
        
        if (globalcmds.length > 0) {
            try {
                console.log('Started refreshing global (/) commands.', this.user?.id);
        
                rest.put(
                    Routes.applicationCommands(this.user?.id || ''),
                    { body: globalcmds }
                )
                console.log('Successfully reloaded global (/) commands.');
            } catch (error) {
                console.error(error);
            }
        }
        
        // ----------------------------
        // Generate Dependency Report
        // ----------------------------
        console.log(generateDependencyReport());

        process.on('unhandledRejection', (reason, p) => {
            console.log('\n=== Unhandled Rejection ==='.toUpperCase(), '\nReason: ', reason);
        })
        process.on("uncaughtException", (err, origin) => {
            console.log('\n=== Uncaught Exception ==='.toUpperCase(),'\nException: ', err.stack ? err.stack : err)
        })
        process.on('uncaughtExceptionMonitor', (err, origin) => { }).on('multipleResolves', (type, promise, reason) => { });

        this.on('shardError', error => {
            console.error('A websocket connection encountered an error:', error);
        });
    }
}

export default ExtendedClient;
