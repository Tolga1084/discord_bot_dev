const { MongoClient } = require('mongodb');
const serverURL = process.env['mongoServerURL']

module.exports = async function (){

    const mongoClient = await new MongoClient(serverURL);
    await mongoClient.connect();
    return mongoClient;
}


