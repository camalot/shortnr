const { MongoClient } = require('mongodb');
const config = require('../../config/env');

class LogsMongoClient {
  constructor() {
    this.database = config.mongo.database;
    this.collection = 'logs';
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

  async debug(source, message, data) {
    return this.write('DEBUG', source, message, data);
  }

  async info(source, message, data) {
    return this.write('INFO', source, message, data);
  }

  async warn(source, message, data) {
    return this.write('WARN', source, message, data);
  }

  async error(source, message, data) {
    return this.write('ERROR', source, message, data);
  }

  async fatal(source, message, data) {
    return this.write('FATAL', source, message, data);
  }

  async write(level, source, message, data) {
    try {
      await this.connect();
      const timestamp = Math.floor(Date.now() / 1000);
      const collection = this.db.collection(this.collection);
      const result = await collection.insertOne({
        timestamp, level, message, ...data,
      });
      console.log(`[${level.toUpperCase()}] [${source}] ${message}`);
      if (data) {
        console.log(data);
      }
      if (!result.acknowledged || !result.insertedId) {
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

module.exports = LogsMongoClient;
