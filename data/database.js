const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
let database ;

async function connect(){
  const client = await mongoClient.connect("mongodb://localhost:27017");
  database = client.db("blogs");
}

function getDb() {
  if(!database){
    throw {Message: "database connection is not established"};
  }
  return database;
}

module.exports = {
  connectToDatabase : connect,
  getDb : getDb
};