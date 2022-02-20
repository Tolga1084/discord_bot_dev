const { wordGame } = require("../Games/wordGame.js")
const { getChannel, gameEnum } = require("../Services/channel.service.js");

//TODO collect user suggestions and bug reports through DM ?
//TODO set language command
module.exports ={
    name: "messageCreate",
    async execute(message){

        if (message.author.bot) return;
        if (message.isInteraction) return
        if (message.content.startsWith('.')) return



        // check if the channel has an active game session
        const channelQuery = await getChannel(message.channelId);
        if (channelQuery === null) {
            console.log("channel is not registered"+
                        "\nmessage event, rejected message channel: "+message.channel.name+": "+message.channelId)
            return;
        }
        if (channelQuery.isActive === false) {
            console.log("message event, channelQuery.isActive: "+(channelQuery.isActive)+
                        "\nmessage event, rejected message channel: "+message.channel.name+": "+message.channelId)
            return;
        }
            // TODO threaded process for each game
        if (channelQuery.activeGame === gameEnum.wordChain){
            console.log("\n\n ---------------- WORD CHAIN ----------------" +
                "\n MESSAGE => " + message.content + "\n")
            let t0 = performance.now();
            await wordGame(message);
            let t1 = performance.now();
            console.log("messageCreate wordGame perf: " + (t1-t0));
        }
    }
}