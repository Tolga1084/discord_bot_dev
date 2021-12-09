const wordGame = require("../Game/wordGame.service.js")

module.exports ={
    name: "messageCreate",
    async execute(message){

        console.log("messageCreate event => " + message)

        if (message.author.bot) return;

        // ignore messages that prefixed with a dot
        if (message.content.startsWith('.')) return

        // check if the channel has an active game session
        let channelQuery = await checkChannel(message);
        if (!(channelQuery.isActive === true)) {
            console.log("message controller, channelquery.isActive: "+(channelQuery.isActive === true));
            console.log("message controller, rejected message channelID: "+message.channelId)
            return;
        }

            wordGame(message);
    }
}