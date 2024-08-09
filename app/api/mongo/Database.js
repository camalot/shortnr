const { MongoClient } = require('mongodb');
const config = require('../../config');
class DatabaseMongoClient {
  constructor() {
    this.database = config.mongo.database;
    this.url = config.mongo.url;
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (this.client && this.db) {
      return;
    }
    this.client = await MongoClient.connect(this.url, {});
    this.db = this.client.db(this.database);
  }

  async close() {
    if (!this.client) {
      return;
    }
    await this.client.close();
    this.client = null;
    this.db = null;
  }
}

module.exports = DatabaseMongoClient;