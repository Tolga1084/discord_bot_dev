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
             if (message.deferred){
                 botReply = await message.followUp({
                     content: reply
                 })
             }else {
                 botReply = await message.reply({
                     content: reply
                 })
             }
         }

         if (deletionDelay === 30000) return

         if (deleteMessage) {
             if (!message.isCommand()) setTimeout(() => message.delete(), deletionDelay)
             else throw "interaction cannot be deleted!"
         }

         if (botReply) {
             setTimeout(() => botReply.delete(), deletionDelay)
         } else if (message.isCommand())
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