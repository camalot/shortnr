const { MongoClient, ObjectId } = require('mongodb');
const config = require('../../config/env');

class StatsMongoClient {
  constructor() {
    this.database = config.mongo.database;

    this.tokens = 'tokens';
    this.logs = 'logs';
    this.urls = 'urls';
    this.tracking = 'tracking';

    this.url = config.mongo.url;
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = await MongoClient.connect(this.url, {});
    this.db = this.client.db(this.database);
  }

  async close() {
    await this.client.close();
  }
}

module.exports = StatsMongoClient;
