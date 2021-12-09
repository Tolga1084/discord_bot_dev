module.exports = async function (playerID, playerTag, guildID) {

    let imp = require('../../app.js')
    const mongoClient = imp.mongoClient
    const players = mongoClient.db(guildID).players;

    players.findOne({_id: playerID}).then(result => {
        if (!result) {
            let playerInfo = {"_id": playerID, "name": playerTag, "score": 0, "words": 0, 'victoryCount': 0, 'wordsStat':{}};
            players.insertOne(playerInfo, function (err, res) {
                if (err) throw err;
                if (res) {
                    console.log(playerTag + " has been registered!");
                }
            });
        }
    });
}