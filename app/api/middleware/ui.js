const config = require('../../config/env');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function allow(req, res, next) {
  if (!config.ui.enabled) {
    return res.status(404).end();
  }

  const allowList = config.ui.allow || ['*'];
  if (allowList.includes('*')) {
    return next();
  }

  const reqestHostName = req.hostname;
  if (allowList.includes(reqestHostName)) {
    return next();
  }

  // loop allow list and create a regex to match the host name
  const regex = new RegExp(allowList.join('|').replace(/\./g, '\\.').replace(/\*/g, '.*'));
  if (regex.test(reqestHostName)) {
    return next();
  }

  return res.status(404).end();
}

module.exports = {
  allow,
};