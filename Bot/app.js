// ================= WORD CHAIN GAME BOT ===================

/* FEATURES TO IMPLEMENT
  - add TR option for interface language
  - explosion effect for removing messages
  - process guild registers and removes
  - styled messages for informing users. -- score tables, starting letter etc... --
  - scoring
  - option for players to play against the bot
  - custom reactions for certain players
  - suggest a word if a player asks for help -- could have limited uses per player for each day --
  - suggestions to correct typos in answers: "did you mean ... ?"
  - show dictionary meaning (button reaction below an answer for inquiry?)
  - voting in new words
  - offensive abilities ??? 
  - 1vs1 battle
  - voice Commands
  - update system
*/

// invite link:
// https://discord.com/api/oauth2/authorize?client_id=893956585817272411&permissions=517543897152&scope=bot%20applications.commands
//sd
const {Client, Collection, Intents} = require('discord.js') ;
const fs = require('fs')
const getCommands = require('./Commands/Util/getCommands.js').getCommands;
const DISCORD_TOKEN = process.env['DISCORD_TOKEN_TEST'];

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

console.time("uptime");

// get commands
const commands = getCommands();
client.commands = new Collection();

commands.forEach(command => {
  client.commands.set(command.data.name, command)
})

// get event handlers and run them
const eventFiles = fs.readdirSync('./Events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./Events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// error tracking
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

client.login(DISCORD_TOKEN)

