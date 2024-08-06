const settings = require('../../config');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function config(req, res) {
  try {
    delete settings.mongo;
    delete settings.short.blocked;
    delete settings.ui.allow;

    return res.status(200).send(`window.NUS_CONFIG = ${JSON.stringify(settings)};`).end();
  } catch (err) {
    await logger.error(
      'ConfigController.config',
      err.message,
      { stack: err.stack, headers: req.headers, body: req.body, query: req.query, params: req.params },
    );
    return res.status(500).end();
  }
}

module.exports = {
  config,
};