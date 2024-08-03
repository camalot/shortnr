const config = require('../../config/env');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function verify(req, res, next) {
  if (!config.ui.enabled) {
    await logger.debug('uiAllow.verify', 'UI is disabled.');
    return res.status(404).end();
  }

  const allowList = config.ui.allow || ['*'];
  if (allowList.includes('*')) {
    await logger.info('uiAllow.verify', 'UI is allowed for all hosts.');
    return next();
  }

  const reqestHostName = req.hostname;
  if (allowList.includes(reqestHostName)) {
    await logger.debug('uiAllow.verify', `UI is allowed for requested host: ${reqestHostName}`);
    return next();
  }

  // loop allow list and create a regex to match the host name
  const regex = new RegExp(allowList.join('|').replace(/\./g, '\\.').replace(/\*/g, '.*'));
  if (regex.test(reqestHostName)) {
    await logger.debug('uiAllow.verify', `UI is allowed for requested host: ${reqestHostName} using regex.`, { regex: regex.toString() });
    return next();
  }

  await logger.warn('uiAllow.verify', `UI not allowed for requested host: ${reqestHostName}`);
  return res.status(404).end();
}

module.exports = {
  verify,
};