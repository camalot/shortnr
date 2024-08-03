const config = require('../../config/env');
const TokensMongoClient = require('../mongo/Tokens');
const TrackingMongoClient = require('../mongo/Tracking');
const LogsMongoClient = require('../mongo/Logs');
const randomizer = require('../helpers/randomizer');

const logger = new LogsMongoClient();

async function create(req, res) {
  try {
    const Track = new TrackingMongoClient();

    if (!config.tokens.create.enabled) {
      await logger.warn('TokenController.create', 'Token creation is disabled, but request was made.', { headers: req.headers, body: req.body });
      return res.status(404).end();
    }

    const token = new TokensMongoClient();
    let { name } = req.body;
    if (!name) {
      await logger.debug('TokenController.create', 'Missing required field: name. Generating random name.', { headers: req.headers, body: req.body });
      name = randomizer.generate(12,12);
    }
    const result = await token.create(name);
    if (result) {
      await Track.create(req, { action: 'token.create', token: { name: result.name, id: result.id } });
      return res.status(200).json({ id: result.id, name: result.name, token: result.token });
    }

    await logger.error('TokenController.create', 'Unable to generate token', { headers: req.headers, body: req.body });
    return res.status(500).json({ error: 'Unable to generate token' });
  } catch (err) {
    await logger.error('TokenController.create', err, { stack: err.stack, headers: req.headers, body: req.body });
    return res.status(500).json({ error: 'An error has occurred' });
  }
}

async function destroy(req, res) {
  try {
    if (!config.tokens.create.enabled) {
      return res.status(404).end();
    }
    const Track = new TrackingMongoClient();
    const Tokens = new TokensMongoClient();
    const { id } = req.params;
    const token = res.locals.token ? res.locals.token.token : null;

    const result = await Tokens.destroy(id, token);
    if (result) {
      await Track.create(req, { action: 'token.destroy', token: { id } });
      return res.status(204).end();
    }
    await logger.warn('TokenController.destroy', 'token not found');
    return res.status(404).json({ error: 'token not found' });
  } catch (err) {
    await logger.error('TokenController.destroy', err, { stack: err.stack });
    return res.status(500).json({ error: 'An error has occurred' });
  }
}

module.exports = {
  create, destroy,
};
