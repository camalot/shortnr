const { MongoClient } = require('mongodb');
const config = require('../../config/env');
const randomizer = require('../helpers/rand_id');

class UrlsMongoClient {
  constructor() {
    this.database = config.mongo.database;
    this.collection = 'urls';
    this.url = config.mongo.url;
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = await MongoClient.connect(this.url, { });
    this.db = this.client.db(this.database);
  }

  async close() {
    await this.client.close();
  }

  async get(id) {
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
      return null;
    }
  }

  async create(url) {
    try {
      await this.connect();

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
          console.log('id is unique');
          break;
        }
        console.log('id is not unique, generating new id');
        id = randomizer.generate(min, max);
      };

      const result = await collection.insertOne({
        id,
        target_url,
        created_at: timestamp,
      });
      if (result.acknowledged && result.insertedId) {
        return { id, target_url };
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  async findOne(query) {
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      const result = await collection.findOne(query);
      delete result._id;
      return result;
    } catch (err) {
      return null;
    }
  }
}

module.exports = UrlsMongoClient;
