const { MongoClient } = require('mongodb');
const config = require('../../config');

let mongoClientInstance = null;
let mongoDbInstance = null;
class DatabaseMongoClient {
  constructor() {
    this.database = config.mongo.database;
    this.url = config.mongo.url;
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (mongoClientInstance && mongoDbInstance) {
      this.client = mongoClientInstance;
      this.db = mongoDbInstance;
      return;
    }
    this.client = await MongoClient.connect(this.url, {});
    this.db = this.client.db(this.database);
    mongoClientInstance = this.client;
    mongoDbInstance = this.db;
  }

  async close() {
    if (!mongoClientInstance) {
      return;
    }
    await mongoClientInstance.close();
    mongoClientInstance = null;
    mongoDbInstance = null;
    this.client = null;
    this.db = null;
  }
}

module.exports = DatabaseMongoClient;