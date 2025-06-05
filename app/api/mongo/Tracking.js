// const { MongoClient } = require('mongodb');
const DatabaseMongoClient = require('./Database');
const config = require('../../config/env');
const LogsMongoClient = require('./Logs');
const requests = require('../helpers/requests');

const logger = new LogsMongoClient();
const MODULE = 'TrackingMongoClient';

class TrackingMongoClient extends DatabaseMongoClient {
  constructor() {
    super();
    this.collection = 'tracking';
  }

  async create(req, payload) {
    const METHOD = 'create';
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
          ip: req.ip,
          ips: req.ips,
          method: req.method,
          originalUrl: req.originalUrl,
          params: req.params,
          protocol: req.protocol,
          hostname: req.hostname,
          port: req.port,
          query: req.query,
          route: req.route,
          // get source ip address
          source: req.get('X-Forwarded-For') || req.connection.remoteAddress,
          webhost: requests.getSourceHost(req),
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
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return false;
    }
  }
}

module.exports = TrackingMongoClient;
