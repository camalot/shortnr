const config = require('../../config/env');
const TokensMongoClient = require('../mongo/Tokens');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function enabled(req, res, next) {
  if (!config.tokens.create.enabled) {
    await logger.warn('TokenMiddleware.enabled', 'Token creation is disabled, but request was made.');
    return res.status(404).end();
  }
  return next();
}

async function verify(req, res, next) {
  let accessToken = req.headers['x-access-token'];
  if (!accessToken) {
    const authorization = req.headers['authorization'];
    if (authorization) {
      const parts = authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        accessToken = parts[1];
      }
    }
  }
  if (!accessToken) {
    accessToken = req.query.token;
  }

  if (!config.tokens.required && !accessToken) {
    await logger.info('TokenMiddleware.verify', 'Token is not required. Skipping Validation.');
    res.locals.token = null;
    return next();
  }

  if (!accessToken) {
    await logger.warn('TokenMiddleware.verify', 'Token is required.');
    return res.status(403).json({ error: 'Token is required.' });
  }

  const Tokens = new TokensMongoClient();

  const token = await Tokens.findOne({ token: accessToken });
  if (!token) {
    await logger.warn('TokenMiddleware.verify', `Token not found. Token: ${accessToken}`);
    return res.status(403).json({ error: 'Token not found.' });
  }

  res.locals.token = token;

  const valid = await Tokens.valid(token.token);
  if (valid) {
    await logger.debug('TokenMiddleware.verify', 'Token is valid.');
    return next();
  }

  await logger.warn('TokenMiddleware.verify', 'Invalid token provided.');
  return res.status(403).json({ error: 'Invalid token provided.' });
}

module.exports = {
  verify, enabled,
};