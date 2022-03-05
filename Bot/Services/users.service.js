const { MongoServerError } = require('mongodb');
const db = process.env['AppDatabase']
const getMongoClient = require("../_helpers/getMongoClient.js")

async function userModel (id, name) {
   return {
       _id: id,
       name,
       games: {},
       info: {}
   }
}

async function registerUser (userId, name) {

    const mongoClient = await getMongoClient();

    const user =  await userModel(userId, name)

    try {
        return await mongoClient.db(db).collection("users").findOne({ _id: userId }).then(result => {
            if (!result) {
                mongoClient.db(db).collection("users").insertOne( user , function (err, res) {
                    if (err) throw err;
                    if (res) {
                        console.log(name + " has been registered!" + userId + "\n" + JSON.stringify(res));
                    }
                });
            }
        });
    }catch (error) {
        if (error instanceof MongoServerError) {
            console.log(`ERROR registerUser: ${error}`); // special case for some reason
        }
        throw error
    }
}




module.exports = { registerUser }