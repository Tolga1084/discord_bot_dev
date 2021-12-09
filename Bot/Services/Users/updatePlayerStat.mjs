import {playersDB} from "../bot";

async function updatePlayerStat(playerID,points,word){
    return playersDB.updateOne(
        {_id : playerID},
        {
            "$inc":
                {['wordsStat.'+word] : 1 ,
                    'words' : 1,
                    'score' : points
                }
        }
    )
}

async function giveScore(playerID,points) {
    return playersDB.updateOne(
        {_id : playerID},
        {
            "$inc":
                {
                    'score' : points
                }
        }
    )
}