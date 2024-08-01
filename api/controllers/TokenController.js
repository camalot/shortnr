const config = require('../../config/env');
const TokensMongoClient = require('../mongo/Tokens');
const TrackingMongoClient = require('../mongo/Tracking');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function verifyToken(token) {
  const tokens = new TokensMongoClient();
  const valid = tokens.valid(token);
  return valid;
}

async function create(req, res) {
  try {
    const track = new TrackingMongoClient();

    if (!config.tokens.create.enabled) {
      await logger.warn('TokenController.create', 'Token creation is disabled, but request was made.');
      return res.status(404).end();
    }

    const token = new TokensMongoClient();
    const { name } = req.body;
    if (!name) {
      await logger.warn('TokenController.create', 'Missing required field: name');
      return res.status(400).json({ error: 'Name is required' });
    }
    const result = await token.create(name);
    if (result) {
      await track.create(req, { action: 'create', token: { name: result.name, id: result.id } });
      return res.status(200).json({ id: result.id, name: result.name, token: result.token });
    }

    await logger.warn('TokenController.create', 'Unable to generate token');
    return res.status(500).json({ error: 'Unable to generate token' });
  } catch (err) {
    await logger.error('TokenController.create', err);
    return res.status(500).json({ error: 'An error has occurred' });
  }
}

async function destroy(req, res) {
  try {
    if (!config.tokens.create.enabled) {
      return res.status(404).end();
    }

    const tokens = new TokensMongoClient();
    const { id } = req.params;
    const token = req.headers['x-access-token'];
    const valid = await verifyToken(token);
    if (!valid) {
      await logger.warn('TokenController.destroy', 'Invalid token provided.');
      return res.status(403).json({ error: 'Invalid token provided.' });
    }
    const result = await tokens.destroy(id, token);
    if (result) {
      return res.status(204).end();
    }
    await logger.warn('TokenController.destroy', 'token not found');
    return res.status(404).json({ error: 'token not found' });
  } catch (err) {
    await logger.error('TokenController.destroy', err);
    return res.status(500).json({ error: 'An error has occurred' });
  }
}

module.exports = {
  create, destroy,
};
