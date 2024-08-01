const { MongoClient, ObjectId } = require('mongodb');
const config = require('../../config/env');
const randomizer = require('../helpers/rand_id');

class TokensMongoClient {
  constructor() {
    this.database = config.mongo.database;
    this.collection = 'tokens';
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

  async valid(token) {
    try {
      if (!config.tokens.required) {
        console.log('Token not required: returning true');
        return true;
      }

      await this.connect();
      const collection = this.db.collection(this.collection);
      if (token) {
        const result = await collection.findOne({ token });
        if (result) {
          return result.enabled;
        }
        return false;
      }

      return false;
    } catch (err) {
      return false;
    }
  }

  async destroy(id, token) {
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      if (id) {
        const objectId = ObjectId.createFromHexString(id);
        const result = await collection.deleteOne({ _id: objectId, token });
        if (result.acknowledged) {
          return true;
        }
        return false;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  async create(name) {
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      const token = randomizer.generate(36, 36);
      const result = await collection.insertOne({
        token,
        name,
        enabled: true,
      });
      if (result.acknowledged) {
        return { token, name };
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  async get(id) {
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      if (id) {
        const objectId = ObjectId.createFromHexString(id);
        const result = collection.findOne({ _id: objectId });
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

module.exports = TokensMongoClient;
