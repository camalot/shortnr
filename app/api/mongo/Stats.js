const { MongoClient, ObjectId } = require('mongodb');
const config = require('../../config/env');
const LogsMongoClient = require('./Logs');

const logger = new LogsMongoClient();

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

  async getRedirectCountsForShort(id) {
    try {
      return this.getTrackingCountsByMatch(
        { id, action: 'redirect' }, { _id: '$id', total: { $sum: 1 } }
      );
    } catch (err) {
      logger.error('StatsMongoClient.getRedirectCountsForShort', err.message, err.stack);
      return null;
    }
  }

  async getRedirectCounts() {
    try {
      return this.getTrackingCountsByMatch(
        { action: 'redirect' }, { _id: { id: '$id', token_id: { '$ifNull': ['$created_by', 'anonymous'] } }, total: { $sum: 1 } }
      );
    } catch (err) {
      await logger.error('StatsMongoClient.getRedirectCounts', err.message, err.stack);
      return null;
    }
  }

  async getShortenCounts() {
    try {
      return this.getTrackingCountsByMatch(
        { action: 'shorten', "new": true }, { _id: { token_id: { '$ifNull': [ '$created_by', 'anonymous' ] } }, total: { $sum: 1 } }
      );
    } catch (err) {
      await logger.error('StatsMongoClient.getRedirectCounts', err.message, err.stack);
      return null;
    }
  }

  async getLogCounts() {
    try {
      await this.connect();
      const collection = this.db.collection(this.logs);
      const logLevels = ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG'];
      const results = [];
      for (const level of logLevels) {
        const result = await collection.countDocuments({ level });
        results.push({ level, total: result });
      }
      return results;
    } catch (err) {
      await logger.error('StatsMongoClient.getRedirectCounts', err.message, err.stack);
      return null;
    }
  }

  async getTokenCounts() {
    try {
      await this.connect();
      const collection = this.db.collection(this.tokens);
      const results = await collection.aggregate([
        { $group: { _id: { '$ifNull': [ '$enabled', false ] }, total: { $sum: 1 } } }
      ]).toArray();
      return results;
    } catch (err) {
      await logger.error('StatsMongoClient.getRedirectCounts', err.message, err.stack);
      return null;
    }
  }

  async getTrackingCounts() {
    try {
      await this.connect();
      const collection = this.db.collection(this.tracking);
      const results = await collection.aggregate([
        { $group: { _id: '$action', total: { $sum: 1 } } }
      ]).toArray();
      return results;
    } catch (err) {
      await logger.error('StatsMongoClient.getRedirectCounts', err.message, err.stack);
      return null;
    }
  }

  async getTrackingCountsByMatch(match, group) {
    try {
      await this.connect();
      const collection = this.db.collection(this.tracking);
      const result = await collection.aggregate([
        { $match: match },
        { $group: group }
      ]).toArray();
      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = StatsMongoClient;
