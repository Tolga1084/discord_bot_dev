 function isLetter(str) {
    return /^[a-zA-Z' 'âwığüşöçÂĞÜŞÖÇİ]+$/.test(str);
}

 function isOneWord(str) {
    return (str.toString().trim().indexOf(' ') === -1);
}

 function isOneLine(str) {
    return (str.toString().trim().indexOf('\n') === -1);
}

 function checkStartingLetter(str, startingLetter) {
    return str.startsWith(startingLetter.toLocaleLowerCase("tr-TR"));
}

 function isNumeric(val) {
    return /^-?\d+$/.test(val);
}

 async function playerWon(playerID,rewardPoints,message) {

    console.log("oyun bitti!");
    await message.reply({
        content: 'Oyunu bitirdin!' // ADD END OF GAME GIF (TERMINATOR ?!!!)
    })
    await message.channel.send(`${CS_dance}
        `);
    await message.channel.send(`-------\n\n-------`)

    return playersDB.updateOne(
        {_id : playerID},
        {
            "$inc":
                {
                    'victoryCount' : 1,
                    'score' : rewardPoints
                }
        }
    )
}
// TODO keep word statistics
 async function updateWordStat(wordID,playerTag){
    let t0 = await performance.now();
    let result = await dictionaryDB.updateOne(
        {_id : wordID},
        {
            "$inc":
                {['playersStat.'+playerTag] : 1 ,
                    'isUsed' : 1,
                    'usedStat' : 1
                }
        }
    )
    let t1 = await performance.now();
    console.log('uws is completed in ' + (t1-t0));
    return result;
}

/* async function getScoreboard(playerID,channel) {
 await scoreBoard = playerDB.find({})
      .sort({ "score": "desc" })
      .limit(10);

 channel.send()
}*/

 function randomStartingLetterTR () {
    let turkceKarakterler = 'ABCÇDEFGHIİJKLMNOÖPRSŞTUÜVYZ' // Ğ is excluded
    return turkceKarakterler[(Math.floor(Math.random() * turkceKarakterler.length))];
}

function ms () {
    const d = new Date();
    return d.getTime();
}

// returns (Arr1 - Arr2)
function arrDiff (Arr1, Arr2)
{
    const set2 = new Set(Arr2);
    return Arr1.filter(x => !set2.has(x));
}

function getKeyByValue(object, value) {
     return Object.keys(object).find(key => object[key] === value);
 }

 async function replyThenDelete (message, reply, deleteMessage= false, deletionDelay = 5000){
     try {
         let botReply = false
         if (deletionDelay !== 0) {
             botReply = await message.reply({
                 content: reply
             })
         }

         if (deletionDelay === 30000) return

         if (deleteMessage) {
             if (!message.isInteraction) setTimeout(() => message.delete(), deletionDelay)
             else throw "interaction cannot be deleted!"
         }

         if (botReply) {
             setTimeout(() => botReply.delete(), deletionDelay)
         } else if (message.isInteraction)
             setTimeout(() => message.deleteReply(), deletionDelay)
     } catch (err) {
         console.log("replyThenDelete " + err + "\ndeletionDelay: " + deletionDelay)
     }
 }

 async function sendThenDelete (message, reply, deletionDelay = 5000){
     await message.channel.send({
         content: reply
     })
     setTimeout(() => message.delete(), duration)

 }
 function sleep(millis) {
     return new Promise(resolve => setTimeout(resolve, millis));
 }
async function loadAnimation (channel, char, count, delay, message = "\n" + char) {

    const loadingIndicator = await channel.send(message)

    for (let i = 0; i < count; i++) {
            await sleep(delay)
            char += "."
            loadingIndicator.edit(message + char)
    }
    console.log(delay*count)
    return loadingIndicator

}




module.exports = {isLetter, isOneWord, isOneLine, checkStartingLetter, isNumeric, randomStartingLetterTR, ms, arrDiff, getKeyByValue, replyThenDelete, loadAnimation}