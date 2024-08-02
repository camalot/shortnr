const config = require('../../config/env');
const StatsMongoClient = require('../mongo/Stats');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function stats(req, res) {
  return res.status(200).json({ });
}

async function statsById(req, res) {
  return res.status(200).json({ });
}

async function metrics(req, res) {
  return res.status(200).end();
}

module.exports = {
  stats, statsById, metrics,
};
