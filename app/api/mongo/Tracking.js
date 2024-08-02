const { MongoClient } = require('mongodb');
const config = require('../../config/env');
const LogsMongoClient = require('./Logs');

const logger = new LogsMongoClient();

class TrackingMongoClient {
  constructor() {
    this.database = config.mongo.database;
    this.collection = 'tracking';
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

  async create(req, payload) {
    try {
      await this.connect();
      if (req) {
        delete payload._id;

        const store = {
          path: req.path,
          ...payload || {},
          headers: req.headers,
          cookies: req.cookies,
          body: req.body,
          hostname: req.hostname,
          ip: req.ip,
          ips: req.ips,
          method: req.method,
          originalUrl: req.originalUrl,
          params: req.params,
          protocol: req.protocol,
          query: req.query,
          route: req.route,
          // get source ip address
          source: req.get('X-Forwarded-For') || req.connection.remoteAddress,
          webhost: config.webhost,
        };
        const collection = this.db.collection(this.collection);
        // get current date and time in UTC unix timestamp
        const timestamp = Math.floor(Date.now() / 1000);
        // merge the id and payload into a single object by spreading the payload
        const data = { ...store, timestamp };

        const result = await collection.insertOne({ ...data });
        if (result.acknowledged) {
          return true;
        }
      }
      return false;
    } catch (err) {
      await logger.error('TrackingMongoClient.create', err.message, err.stack);
      return false;
    }
  }
}

module.exports = TrackingMongoClient;
