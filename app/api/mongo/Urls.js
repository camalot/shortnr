// const { MongoClient } = require('mongodb');
const DatabaseMongoClient = require('./Database');
const config = require('../../config/env');
const randomizer = require('../helpers/randomizer');
const TokensMongoClient = require('./Tokens');
const LogsMongoClient = require('./Logs');

const logger = new LogsMongoClient();
const MODULE = 'UrlsMongoClient';

class UrlsMongoClient extends DatabaseMongoClient {
  constructor() {
    super();
    this.collection = 'urls';
  }

  async get(id) {
    const METHOD = 'get';
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      if (id) {
        const result = collection.findOne({ id });
        if (result) {
          return result;
        }
        return null;
      }

      return null;
    } catch (err) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }

  async create(url, tokenId) {
    const METHOD = 'create';
    try {
      await this.connect();
      // let tokenId = null;
      // if (token) {
      //   const tokenClient = new TokensMongoClient();
      //   const tokenResult = await tokenClient.findOne({ token });
      //   if (!tokenResult) {
      //     throw new Error('Unable to find token');
      //   }
      //   tokenId = tokenResult.id;
      // }

      // clean the url by removing trailing slash
      const target_url = url.replace(/\/$/, '');

      const collection = this.db.collection(this.collection);
      const min = config.short.length.min;
      const max = config.short.length.max;
      
      // get current date and time in UTC unix timestamp
      const timestamp = Math.floor(Date.now() / 1000);


      let id = randomizer.generate(min, max);
      while (await this.findOne({ id }) !== null) {
        // verify if the id is unique
        let result = await this.findOne({ id});
        if (!result) {
          break;
        }
        await logger.debug(`${MODULE}.${METHOD}`, 'id is not unique, generating new id');
        id = randomizer.generate(min, max);
      };

      const result = await collection.insertOne({
        id,
        target_url,
        created_at: timestamp,
        created_by: tokenId || 'anonymous',
      });
      if (result.acknowledged && result.insertedId) {
        return { id, target_url, created_by: tokenId || 'anonymous' };
      }
      return null;
    } catch (err) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }

  async findOne(query) {
    const METHOD = 'findOne';
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      const result = await collection.findOne(query);
      if (!result) {
        return null;
      }
      delete result._id;
      return result;
    } catch (err) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }
}

module.exports = UrlsMongoClient;
