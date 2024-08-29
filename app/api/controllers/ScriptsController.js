const configs = require('../../config');
const fs = require('fs');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();
const MODULE = 'ScriptsController';

async function config(req, res) {
  const METHOD = 'config';
  try {
    // copy to another object and remove sensitive data
    let settings = JSON.parse(JSON.stringify(configs));
    delete settings.mongo;
    delete settings.short.blocked;
    delete settings.ui.allow;
    res.setHeader('Content-Type', 'application/javascript');
    return res.status(200).send(`window.NUS_CONFIG = ${JSON.stringify(settings)};`).end();
  } catch (err) {
    await logger.error(
      `${MODULE}.${METHOD}`,
      err.message,
      { stack: err.stack, headers: req.headers, body: req.body, query: req.query, params: req.params },
    );
    return res.status(500).end();
  }
}

async function scripts(req, res) {
  const METHOD = 'scripts';
  try {
    // combine scripts to one file and send
    let scripts = [
      'shorten-without-auth.js',
    ];

    if (configs.tokens.required) {
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
      `${MODULE}.${METHOD}`,
      err.message,
      { stack: err.stack, headers: req.headers, body: req.body, query: req.query, params: req.params },
    );
    return res.status(500).end();
  }
}

module.exports = {
  config, scripts,
};