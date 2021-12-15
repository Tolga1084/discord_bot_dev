const { cooldown } = require("../Commands/Util/commandUtil.js")
const talkedRecently = new Set();

//CONFIG
const cooldownTimer = 10000;
const buttonDuration = 30000;

module.exports ={
    name: "interactionCreate",
    async execute(interaction){

        if (!interaction.isCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        if (cooldown (interaction, interaction.commandName, talkedRecently, cooldownTimer)) return;

        try {
            await command.execute(interaction, buttonDuration);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}