const DatabaseMongoClient = require('./Database');
const LogsMongoClient = require('./Logs');

const logger = new LogsMongoClient();
const MODULE = 'StatsMongoClient';

class StatsMongoClient extends DatabaseMongoClient {
  constructor() {
    super();
    this.tokens = 'tokens';
    this.logs = 'logs';
    this.urls = 'urls';
    this.tracking = 'tracking';
  }

  async getRedirectCountsForShort(id) {
    const METHOD = 'getRedirectCountsForShort';
    try {
      return this.getTrackingCountsByMatch([
        { $match: { id, action: 'url.redirect' } },
        { $group: { _id: '$id', total: { $sum: 1 } } },
      ]);
    } catch (err) {
      logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }

  async getRedirectCounts() {
    const METHOD = 'getRedirectCounts';
    try {
      return this.getTrackingCountsByMatch([
        { $match: { action: 'url.redirect' } },
        { $group: { _id: { id: '$id', token_id: { $ifNull: [ '$created_by', 'anonymous' ] } }, total: { $sum: 1 } } },
      ]);
    } catch (err) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }

  async getShortenCounts() {
    const METHOD = 'getShortenCounts';
    try {
      return this.getTrackingCountsByMatch([
        { $match: { action: 'url.shorten', new: true } },
        { $group: { _id: { token_id: { $ifNull: [ '$created_by', 'anonymous' ] } }, total: { $sum: 1 } } },
      ]);
    } catch (err) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }

  async getLogCounts() {
    const METHOD = 'getLogCounts';
    try {
      await this.connect();
      const collection = this.db.collection(this.logs);
      const logLevels = [ 'FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', ];
      const results = [];
      for (const level of logLevels) {
        const result = await collection.countDocuments({ level });
        results.push({ level, total: result });
      }
      return results;
    } catch (err) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }

  async getTokenCounts() {
    const METHOD = 'getTokenCounts';
    try {
      await this.connect();
      const collection = this.db.collection(this.tokens);
      const results = await collection.aggregate([
        { $group: { _id: { $ifNull: [ '$enabled', false ] }, total: { $sum: 1 } } },
      ]).toArray();
      return results;
    } catch (err) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }

  async getTrackingCounts() {
    const METHOD = 'getTrackingCounts';
    try {
      await this.connect();
      const collection = this.db.collection(this.tracking);
      const results = await collection.aggregate([
        { $sort: { action: 1 } },
        { $group: { _id: '$action', total: { $sum: 1 } } }
      ]).toArray();
      return results;
    } catch (err) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }

  async getTrackingCountsByMatch(pipeline, options) {
    try {
      await this.connect();
      const collection = this.db.collection(this.tracking);
      const result = await collection.aggregate(pipeline, options).toArray();
      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = StatsMongoClient;
