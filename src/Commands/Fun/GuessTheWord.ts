import { Command } from '../../Interfaces';
import { Settings } from '../../Functions/settings';
import * as gradient from 'gradient-string';
import language from '../../Functions/language';
import { addCoins, setCoins, getCoins, getColor } from '../../Functions/economy';
import Discord, { Client, Constants, Collection, ActionRowBuilder, ButtonBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import temporaryMessage from '../../Functions/temporary-message';
import moment from 'moment';
import icon from '../../Functions/icon';
import profileSchema from '../../schemas/profileSchema';
import axios from 'axios';

let lastWord: any;
export const command: Command = {
    name: "guesstheword",
    description: "guess the word and get a reward",
    details: "gueess the word and get a reward",
    aliases: ["gtw"],
    group: "Fun",
    hidden: false,
    UserPermissions: ["SendMessages"],
    ClientPermissions: ["SendMessages", "AddReactions"],
    ownerOnly: false,
    examples: ["guesstheword {category}"],
    
    run: async(client, message, args) => {
        const { guild, channel, author, member, mentions, attachments, content } = message;
        if (!guild) return
        
        let computer = [
            'computer',
            'mouse',
            'keyboard',
            'monitor',
            'speaker',
            'printer',
            'scanner',
            'projector',
            'harddrive',
            'ram',
            'cpu',
            'gpu',
            'motherboard',
            'case',
            'cable',
            'power supply',
            'server',
            'radiator'
        ]
        let network = [
            'network',
            'router',
            'switch',
            'modem',
            'wifi',
            'subnet mask',
        ]
        let os = [
            'distro',
            'operating system',
            'kernel',
            'bios',
            'shell',
            'terminal',
            'command',
        ]
        let protocol = [
            'http',
            'https',
            'ftp',
            'ssh',
            'tcp',
            'udp',
            'dns',
            'dhcp',
            'telnet',
        ]

        // list all ark: survival evolved dinosaurs
        let dinosaurs = [
            'brontosaurus',
            'carcharodon',
            'carnotaurus',
            'dilophosaurus',
            'giganotosaurus',
            'iguanodon',
            'mammoth',
            'parasaur',
            'paracer',
            'argentavis',
            'doedicurus',
            'griffin',
            'wyvern',
            'desmodus',
            'astrocetus',
            'onyc',
            'gasbags',
            'featherlight',
            'voidwyrm',
            'vulture',
            'sinomacrops',
            'pteranodon',
            'quetzal',
            'raptor',
            'megalodon',
            'stegosaurus',
            'triceratops',
            'tyrannosaurus',
            'velociraptor',
            'maewing',
            'oviraptor',
            'ankylosaurus',
            'ichthyornis',
            'lymantria',
            'meganeura',
            'tropeognathus',
            'angler',
            'mosasaurus',
            'otter',
            'sarco',
            'trilobite',
            'megachelon',
            'dodo',
            'achatina',
            'bulbdog',
            'araneo',
            'basilisk',
            'direwolf',
            'diplodocus',
            'equus',
            'direbear',
            'deathworm',
            'lystrosaurus',
            'seeker',
            'thylacoleo',
            'shadowmane',
            'reaper',
            'spinosaurus',
            'velonasaur',
            'titanoboa',
            'shinehorn',
            'troodon'
        ]
        let categories = [
            {
                name: 'computer',
                words: computer
            },
            {
                name: 'network',
                words: network
            },
            {
                name: 'os',
                words: os
            },
            {
                name: 'protocol',
                words: protocol
            },
            {
                name: "dinosaurs",
                words: dinosaurs
            }
        ]

        function getEmoji(name: string) {
            return client.emojis.cache.find(emoji => emoji.name === name)
        }

        function scramble(a: any) {
            let words = a.split(" "); 
            for (let i = 0; i < words.length; i++) {
                function scrambleWord(word: string) {
                    let v = word.split("");
                    for(let b = v.length-1; 0 < b; b--) {
                        let c = Math.floor(Math.random()*(b+1));
                        let d = v[b]; 
                        v[b] = v[c];
                        v[c] = d
                    } 
                    return v.join("")
                }
                let word = scrambleWord(words[i])
                if (words[i] == word) word = scrambleWord(words[i]) // if the word is the same as the scrambled word, scramble again
                words[i] = word;
            }
            return words.join(' ')
        }
        let category: any = categories[Math.floor(Math.random() * categories.length)];

        // If category is mentioned
        if (args[1]) {
            if (!categories.find(c => c.name.toLowerCase() == args[1].toLowerCase())) {
                return channel.send(`No category with that name found. Try one of these: \`${categories.map(c => c.name).join(', ')}\``)
            }
            category = categories.find(c => c.name.toLowerCase() == args[1].toLowerCase());
        }

        let word = category.words[Math.floor(Math.random() * category.words.length)];
        let scrambledWord = scramble(word).toUpperCase();

        // Make sure that the word is not the same as the last word
        if (lastWord == word) word = category.words[Math.floor(Math.random() * category.words.length)];
        lastWord = word;


        
        let embed = new EmbedBuilder()
            .setColor(client.config.botEmbedHex)
            .setAuthor({ name: `Guess the Word!` })
            .setTitle(`Word: \`${scrambledWord}\``)
            .setDescription(`**Hint**: Starts with ${word.charAt(0).toUpperCase()}\nCategory: **${category.name}**`)
            .setFooter({ text: `Requested by ${author.tag} | Answer with -word {the word}`, iconURL: author.displayAvatarURL() })
            .setTimestamp()
        
        let dm = channel.send({ embeds: [embed] })
        
        var now = moment(new Date()); // date when the game starts. Is used to calculate the time used to solve the word



        let guessedUser: any;
        const filter = (m: any) => m.channel.id === channel.id && !m.author.bot;
        const collector = channel.createMessageCollector({filter, time: 5*60*1000});
        collector.on('collect', async (reaction) => {
            if (!reaction.content.startsWith('-word')) return
            if (!reaction) return;

            embed.setTitle(`${reaction.author.username} failed to guess the word! 😭`);
            embed.setDescription(`You can try again`);
            if (reaction.content.replace('-word ', '').toLowerCase() === word) {
                guessedUser = reaction.author; 
                collector.stop('correct')
            } else {
                channel.send({ embeds: [embed] })
            }
        })

        // TODO - Gradually add letters to the hint over time.
        // setTimeout(() => {
            
        // }, 60*1000);

        collector.on('end', async (collected, reason) => {
            switch(reason) {
                case 'correct':
                    var end = moment(new Date()); // another date
                    var duration = moment.duration(end.diff(now));
    
                    let guessedWord: any = {
                        word: word,
                        scrambledWord: scrambledWord,
                        time: duration.asSeconds()
                    }
                    await profileSchema.findOneAndUpdate({
                        userId: guessedUser.id,
                        guildId: guild.id
                    }, {
                        $push: {
                            guessedWords: guessedWord
                        }
                    })
    
                    // Reward the user with some erlingcoins
                    addCoins(guild.id, guessedUser.id, 25)
    
                    embed.setTitle(`${icon(client, guild, 'checkmark')} ${guessedUser.username} guessed the word in ${duration.asSeconds()} seconds! 🎉`);
                    embed.setDescription(`**You got 25 ${getEmoji('ErlingCoinSpin')} in reward!**\nThe correct word was: **${word}**`);
                case 'incorrect':
                    embed.setTitle(`${author.username} failed to guess the word! 😭`);
                    embed.setDescription(`The correct word was: **${word}**`);
                default:
                    embed.setTitle(`No one managed to put the letters in the right order! 😥`);
                    embed.setDescription(`Letters were: **${scrambledWord}**\nRight order: **${word}**`);
            }
            channel.send({ embeds: [embed] })
            word = "";
        })
        return
    }
}


