// const { MongoClient, ObjectId } = require('mongodb');
const DatabaseMongoClient = require('./Database');
const config = require('../../config');
const LogsMongoClient = require('./Logs');

const logger = new LogsMongoClient();

class SettingsMongoClient extends DatabaseMongoClient {
  constructor() {
    super();
    this.collection = 'settings';
  }

  async get(key, defaultValue) {
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      const result = await collection.findOne({name: key});
      return result ? result.value : defaultValue;
    } catch (err) {
      await logger.error('SettingsMongoClient.get', err.message, { stack: err.stack });
      return defaultValue;
    }
  }

  async set(key, value) {
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      const result = await collection.updateOne({name: key}, { $set: {value} }, {upsert: true});
      return result;
    } catch (err) {
      await logger.error('SettingsMongoClient.set', err.message, { stack: err.stack });
      return null;
    }
  }

  async save() {

  }

}