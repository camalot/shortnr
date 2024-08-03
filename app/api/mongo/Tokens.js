const { MongoClient, ObjectId } = require('mongodb');
const config = require('../../config/env');
const randomizer = require('../helpers/randomizer');
const LogsMongoClient = require('./Logs');

const logger = new LogsMongoClient();

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
        await logger.debug('TokensMongoClient.valid', 'Token not required: returning true');
        return true;
      }
      await logger.debug('TokensMongoClient.valid', 'Token required: checking token');
      await this.connect();
      const collection = this.db.collection(this.collection);
      if (token) {
        const result = await collection.findOne({ token });
        await logger.debug('TokensMongoClient.valid', 'FindOne result', { result });
        if (result) {
          await logger.debug('TokensMongoClient.valid', 'Token found', { token_id: result.id.toString() });
          return result.enabled;
        }
        return false;
      }

      return false;
    } catch (err) {
      await logger.error('TokensMongoClient.valid', err.message, { stack: err.stack });
      return false;
    }
  }

  async destroy(id, token) {
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      if (id) {
        const oid = ObjectId.createFromHexString(id);
        const filter = { _id: oid, token };
        const result = await collection.deleteOne(filter);
        if (result.acknowledged && result.deletedCount > 0) {
          return true;
        }
        return false;
      }
      return false;
    } catch (err) {
      await logger.error('TokensMongoClient.destroy', err.message, { stack: err.stack });
      return false;
    }
  }

  async create(name) {
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      const timestamp = Math.floor(Date.now() / 1000);
      if (!name) {
        name = `token-${timestamp}-${randomizer.generate(4, 4)}`;
      }
      const genToken = randomizer.generate(config.tokens.length, config.tokens.length);
      const token = `${config.tokens.prefix}${genToken}`;
      const result = await collection.insertOne({
        token,
        name,
        enabled: true,
        scopes: [
          'url.create',
          'token.delete',
        ],
        created_at: timestamp,
      });
      if (result.acknowledged && result.insertedId) {
        return { id: result.insertedId.toString(), token, name };
      }
      return null;
    } catch (err) {
      await logger.error('TokensMongoClient.create', err.message, { stack: err.stack });
      return null;
    }
  }

  async hasScope(token, scope) {
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      const result = await collection.findOne({ token });
      if (result) {
        if (!result.scopes) {
          return false;
        }
        return result.scopes.includes(scope);
      }
    } catch (err) {
      await logger.error('TokensMongoClient.hasScope', err.message, { stack: err.stack });
      return false;
    }
  }

  async grantScope(token, scope) {
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);

      const tokenResult = this.findOne({ token });
      if (!tokenResult) {
        await logger.warn('TokensMongoClient.grant', 'Token not found', { token });
        return false;
      }

      // remove token from result
      delete tokenResult.token;

      // if token has the scope, return true; otherwise, add the scope and return true
      if (await this.hasScope(token, scope)) {
        await logger.debug('TokensMongoClient.grant', 'Token already has scope', { token: tokenResult, scope });
        return true;
      }
      const result = await collection.updateOne({ token }, { $push: { scopes: scope } });
      await logger.debug('TokensMongoClient.grant', 'Update result', { result });
      if (result.acknowledged && result.modifiedCount > 0) {
        return true;
      }
      return false;
    } catch (err) {
      await logger.error('TokensMongoClient.grant', err.message, { stack: err.stack });
      return false;
    }
  }

  async revokeScope(token, scope) {
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);

      const tokenResult = this.findOne({ token });
      if (!tokenResult) {
        await logger.warn('TokensMongoClient.grant', 'Token not found', { token });
        return false;
      }

      // remove token from result
      delete tokenResult.token;

      // if token does nto have the scope, return true; otherwise, delete the scope and return true
      if (await !this.hasScope(token, scope)) {
        await logger.debug('TokensMongoClient.grant', 'Token already missing scope', { token: tokenResult, scope });
        return true;
      }

      const result = await collection.updateOne({ token }, { $pull: { scopes: scope } });
      await logger.debug('TokensMongoClient.grant', 'Update result', { result });
      if (result.acknowledged && result.modifiedCount > 0) {
        return true;
      }
      return false;
    } catch (err) {
      await logger.error('TokensMongoClient.revoke', err.message, { stack: err.stack });
      return false;
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
      await logger.error('TokensMongoClient.get', err.message, { stack: err.stack });
      return null;
    }
  }

  async findOne(query) {
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      const result = await collection.findOne(query);
      if (result) {
        result.id = result._id.toString();
        delete result._id;
        return result;
      }
      return null;
    } catch (err) {
      await logger.error('TokensMongoClient.findOne', err.message, { stack: err.stack });
      return null;
    }
  }
}

module.exports = TokensMongoClient;
