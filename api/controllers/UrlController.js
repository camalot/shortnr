// const Url = require('../models/Url');
// const base58 = require('../helpers/base58');
const config = require('../../config/env');
const UrlsMongoClient = require('../mongo/Urls');
const TokensMongoClient = require('../mongo/Tokens');
const TrackingMongoClient = require('../mongo/Tracking');

async function verifyToken(token) {
  if (!config.tokens.create.enabled) {
    return true;
  }
  const tokens = new TokensMongoClient();
  const valid = tokens.valid(token);
  return valid;
}

function shorten(req, res) {
  // get the authentication token from the request
  const token = req.headers['x-access-token'];
  verifyToken(token).then(async (valid) => {
    if (!valid) {
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
        short = await Url.create(targetUrl);
        isNew = true;
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
      };
      Tracking.create(req, { action: 'shorten', ...output });
      return res.status(200).json(output);
    }

    return res.status(400).json({ error: 'Invalid shorten payload.' });
  }).catch((err) => {
    console.log(err);
    return res.status(403).json({ error: 'Invalid token provided.' });
  });
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
    return res.status(404);
  });
}

module.exports = {
  shorten, redirect,
};
