const config = require('../../config/env');
const UrlsMongoClient = require('../mongo/Urls');
const TokensMongoClient = require('../mongo/Tokens');
const TrackingMongoClient = require('../mongo/Tracking');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function verifyToken(token) {
  if (!config.tokens.create.enabled) {
    return true;
  }
  const tokens = new TokensMongoClient();
  const valid = tokens.valid(token);
  return valid;
}

async function shorten(req, res) {
  try {
    // get the authentication token from the request
    const token = req.headers['x-access-token'];
    const valid = await verifyToken(token);
    if (!valid) {
      await logger.warn('UrlController.shorten', 'Invalid token provided.');
      return res.status(403).json({ error: 'Invalid token provided.' });
    }
    const Url = new UrlsMongoClient();
    const Tracking = new TrackingMongoClient();

    if (req.body.url) {
      const targetUrl = req.body.url.replace(/\/$/, '');
      // Check if url already exists in the database
      let short = await Url.findOne({ target_url: targetUrl });
      let isNew = false;
      if (!short) {
        // Since it doesn't exist, let's go ahead and create it
        short = await Url.create(targetUrl, token);
        isNew = true;
      }

      if (!short) {
        await logger.warn('UrlController.shorten', 'Invalid shorten payload.');
        return res.status(500).json({ error: 'Invalid shorten payload.' });
      }

      // If the url already exists, return the existing short url
      const output = {
        id: short.id,
        target: short.target_url,
        url: `${config.webhost}/${short.id}`,
        urls: [
          `${config.webhost}/${short.id}`,
          `${config.webhost}/g/${short.id}`,
          `${config.webhost}/go/${short.id}`,
        ],
        new: isNew,
        created_by: short.created_by,
      };
      await logger.debug(JSON.stringify(output));
      await Tracking.create(req, { action: 'shorten', ...output });
      delete output.created_by;
      return res.status(200).json(output);
    }
    await logger.warn('UrlController.shorten', 'Invalid shorten payload.');
    return res.status(400).json({ error: 'Invalid shorten payload.' });
  } catch (err) {
    await logger.error('UrlController.shorten', err, err.stack);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

function redirect(req, res) {
  const Url = new UrlsMongoClient();
  const Tracking = new TrackingMongoClient();
  const { id } = req.params;
  // Check if url already exists in the database
  return Url.get(id).then((short) => {
    if (short) {
      Tracking.create(req, { action: 'redirect', ...short });
      return res.redirect(short.target_url);
    }

    logger.warn('UrlController.redirect', `Short url not found: ${id}`);
    return res.status(404).end();
  });
}

module.exports = {
  shorten, redirect,
};
