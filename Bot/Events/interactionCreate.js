const {getGuild} = require("../Services/guild.service");
const { cooldown } = require("../Commands/Util/cooldown.js")
const talkedRecently = new Set();

//CONFIG
const cooldownTimer = 10000;
const buttonDuration = 30000;

//TODO configure permissions

module.exports ={
    name: "interactionCreate",
    async execute(interaction){

        if (!interaction.isCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        console.log("\n\n -------------------------------------------------" +
            "\n INTERACTION => " + interaction.commandName + "\n")

        const guildQuery = await getGuild(interaction.guildId);

        if (cooldown (interaction, interaction.commandName, talkedRecently, cooldownTimer, guildQuery.interfaceLanguage)) return;
        console.log("after cooldown")

        try {
            await command.execute(interaction, buttonDuration);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}