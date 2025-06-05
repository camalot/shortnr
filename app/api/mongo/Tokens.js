const { ObjectId } = require('mongodb');
const DatabaseMongoClient = require('./Database');
const config = require('../../config');
const randomizer = require('../helpers/randomizer');
const LogsMongoClient = require('./Logs');

const logger = new LogsMongoClient();
const MODULE = 'TokensMongoClient';

class TokensMongoClient extends DatabaseMongoClient {
  constructor() {
    super();
    this.collection = 'tokens';
  }

  async valid(token) {
    const METHOD = 'valid';
    try {
      if (!config.tokens.required) {
        await logger.debug(`${MODULE}.${METHOD}`, 'Token not required: returning true');
        return true;
      }
      await logger.debug(`${MODULE}.${METHOD}`, 'Token required: checking token');
      await this.connect();
      if (token) {
        const result = await this.findOne({ token });
        await logger.debug(`${MODULE}.${METHOD}`, 'FindOne result', { result });
        if (result) {
          await logger.debug(`${MODULE}.${METHOD}`, 'Token found', { token_id: result.id.toString() });
          return result.enabled;
        }
        return false;
      }

      return false;
    } catch (err) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return false;
    }
  }

  async destroy(id, token) {
    const METHOD = 'destroy';
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
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return false;
    }
  }

  async create(name) {
    const METHOD = 'create';
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
          'token.enable',
          'stats.read',
        ],
        created_at: timestamp,
      });
      if (result.acknowledged && result.insertedId) {
        // update the scopes to add token.delete.:token_id
        await collection.updateOne(
          { _id: result.insertedId }, 
          { $push: { scopes: `token.delete.${result.insertedId.toString()}` } },
        );
        return { id: result.insertedId.toString(), token, name };
      }
      return null;
    } catch (err) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }

  async hasScope(token, scope) {
    const METHOD = 'hasScope';
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
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return false;
    }
  }

  async grantScope(token, scopes) {
    const METHOD = 'grantScope';
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);

      const tokenResult = this.findOne({ token });
      if (!tokenResult) {
        await logger.warn(`${MODULE}.${METHOD}`, 'Token not found', { token });
        return false;
      }

      // remove token from result
      delete tokenResult.token;

      // if token has the scope, return true; otherwise, add the scope and return true
      let updateResult = false;
      for (const scope of scopes) {
        if (await this.hasScope(token, scope)) {
          await logger.debug(`${MODULE}.${METHOD}`, 'Token already has scopes', { token: tokenResult, scope });
          continue;
        }
        const result = await collection.updateOne({ token }, { $push: { scopes: scope } });
        await logger.debug(`${MODULE}.${METHOD}`, 'Update result', { result });
        if (result.acknowledged && result.modifiedCount > 0) {
          updateResult = true;
        } else {
          updateResult = false;
        }
      }
      
      if (updateResult) {
        return await this.findOne({ token });
      }
      return null;
    } catch (err) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }

  async revokeScope(token, scopes) {
    const METHOD = 'revokeScope';
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);

      const tokenResult = this.findOne({ token });
      if (!tokenResult) {
        await logger.warn(`${MODULE}.${METHOD}`, 'Token not found', { token });
        return false;
      }

      // remove token from result
      delete tokenResult.token;
      // if token has the scope, return true; otherwise, add the scope and return true
      let updateResult = false;
      for (const scope of scopes) {
        if (!this.hasScope(token, scope)) {
          await logger.debug(`${MODULE}.${METHOD}`, 'Token already missing scope', { token: tokenResult, scope });
          continue;
        }
        const result = await collection.updateOne({ token }, { $pull: { scopes: scope } });
        await logger.debug(`${MODULE}.${METHOD}`, 'Update result', { result });
        if (result.acknowledged && result.modifiedCount > 0) {
          updateResult = true;
        } else {
          updateResult = false;
        }
      }
      if (updateResult) {
        return await this.findOne({ token });
      } else {
        return null;
      }
    } catch (err) {
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }

  async get(id) {
    const METHOD = 'get';
    try {
      await this.connect();
      const collection = this.db.collection(this.collection);
      if (id) {
        const objectId = ObjectId.createFromHexString(id);
        const result = this.findOne({ _id: objectId });
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

  async findOne(query) {
    const METHOD = 'findOne';
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
      await logger.error(`${MODULE}.${METHOD}`, err.message, { stack: err.stack });
      return null;
    }
  }
}

module.exports = TokensMongoClient;
