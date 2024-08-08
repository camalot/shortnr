const settings = require('../../config');
const fs = require('fs');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function config(req, res) {
  try {
    delete settings.mongo;
    delete settings.short.blocked;
    delete settings.ui.allow;
    res.setHeader('Content-Type', 'application/javascript');
    return res.status(200).send(`window.NUS_CONFIG = ${JSON.stringify(settings)};`).end();
  } catch (err) {
    await logger.error(
      'ScriptsController.config',
      err.message,
      { stack: err.stack, headers: req.headers, body: req.body, query: req.query, params: req.params },
    );
    return res.status(500).end();
  }
}

async function scripts(req, res) {
  try {
    // combine scripts to one file and send
    let scripts = [
      'shorten-without-auth.js',
    ];

    if (settings.tokens.required) {
      scripts = [
        'shorten-with-auth.js',
      ];
    }

    res.setHeader('Content-Type', 'application/javascript');

    // read all scripts and combine them
    let script = '';
    scripts.forEach((s) => {
      script += fs.readFileSync(`assets/javascript/${s}`);
    });

    return res.status(200).send(script).end();
  } catch (err) {
    await logger.error(
      'ScriptsController.config',
      err.message,
      { stack: err.stack, headers: req.headers, body: req.body, query: req.query, params: req.params },
    );
    return res.status(500).end();
  }
}

module.exports = {
  config, scripts,
};