const { wordGame } = require("../Games/wordGame.js")
const { getChannel } = require("../Services/channel.service.js");

module.exports ={
    name: "messageCreate",
    async execute(message){

        if (message.author.bot) return;
        if (message.isInteraction) return
        if (message.content.startsWith('.')) return

        console.log("\n\n -------------------------------------------------" +
            "\n MESSAGE => " + message.content + "\n")

        // check if the channel has an active game session
        let channelQuery = await getChannel(message.channelId);
        if (!(channelQuery.isActive === true)) {
            console.log("message controller, channelquery.isActive: "+(channelQuery.isActive === true));
            console.log("message controller, rejected message channelID: "+message.channelId)
            return;
        }
            // TODO threaded process for each game
            let t0 = performance.now();
            await wordGame(message);
            let t1 = performance.now();
            console.log("messageCreate wordGame perf: " + (t1-t0));
    }
}