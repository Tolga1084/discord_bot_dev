const { wordGame } = require("../Services/wordGame.service.js")
const { getChannel } = require("../Services/channel.service.js");

module.exports ={
    name: "messageCreate",
    async execute(message){

        console.log("messageCreate event => " + message)

        if (message.author.bot) return;
        if (message.isInteraction) return

        // ignore messages that prefixed with a dot
        if (message.content.startsWith('.')) return

        // check if the channel has an active game session
        let channelQuery = await getChannel(message.channelId);
        if (!(channelQuery.isActive === true)) {
            console.log("message controller, channelquery.isActive: "+(channelQuery.isActive === true));
            console.log("message controller, rejected message channelID: "+message.channelId)
            return;
        }
            // TODO threaded process for each game
        let t0 = await performance.now();
            await wordGame(message);
        let t1 = await performance.now();
        console.log("messageCreate wordGame perf: " + t1-t0);
    }
}