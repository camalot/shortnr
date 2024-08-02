const { MongoClient } = require('mongodb');
const config = require('../../config/env');
const clc = require('cli-color');
class LogsMongoClient {
  constructor() {
    this.database = config.mongo.database;
    this.collection = 'logs';
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

  async debug(source, message, data) {
    return this.write('DEBUG', source, message, data);
  }

  async info(source, message, data) {
    return this.write('INFO', source, message, data);
  }

  async warn(source, message, data) {
    return this.write('WARN', source, message, data);
  }

  async error(source, message, data) {
    return this.write('ERROR', source, message, data);
  }

  async fatal(source, message, data) {
    return this.write('FATAL', source, message, data);
  }

  _consoleWriter(level, source, message, data) {
    const msg = `[${level.toUpperCase()}] [${source}] ${message}`;
    let mData = null;
    if (data) {
      if (typeof data === 'object') {
        mData = JSON.stringify(data, null, 2);
      } else {
        mData = data;
      }
    }
    switch (level.toLowerCase()) {
      case 'fatal':
        console.error(clc.red(msg));
        if (mData) {
          console.error(clc.red(mData));
        } 
        break;
      case 'error':
        console.error(clc.red(msg));
        if (mData) {
          console.error(clc.red(mData));
        }
        break;
      case 'warn':
        console.warn(clc.yellow(msg));
        if (mData) {
          console.warn(clc.yellow(mData));
        }
        break;
      case 'info':
        console.info(clc.blue(msg));
        if (mData) {
          console.info(clc.blue(mData));
        }
        break;
      case 'debug':
        console.debug(clc.green(msg));
        if (mData) {
          console.debug(clc.green(mData));
        }
        break;
      default:
        console.log(msg);
        if (mData) {
          console.log(mData);
        }
        break;
    }
  }

  async write(level, source, message, data) {
    try {
      await this.connect();
      const timestamp = Math.floor(Date.now() / 1000);
      const collection = this.db.collection(this.collection);
      const dbLogLevel = this._logLevels()[config.log.level.db];
      const consoleLogLevel = this._logLevels()[config.log.level.console];
      const reqLogLevel = this._logLevels()[level];

      let result = null;
      if (reqLogLevel >= dbLogLevel) {
        result = await collection.insertOne({
          timestamp, level, message, ...data,
        });
      }

      if (reqLogLevel >= consoleLogLevel) {
        this._consoleWriter(level, source, message, data);
      }

      if (result && (!result.acknowledged || !result.insertedId)) {
        return false;
      }
      return true;
    } catch (err) {
      this._consoleWriter('FATAL', 'LogsMongoClient.write', err.message, err.stack);
      return false;
    }
  }

  _logLevels() {
    return { 'FATAL': 1000, 'ERROR': 30, 'WARN': 20, 'INFO': 10, 'DEBUG': 0 };
  }
}

module.exports = LogsMongoClient;
