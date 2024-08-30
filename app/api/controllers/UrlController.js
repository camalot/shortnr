const requests = require('../helpers/requests');
const UrlsMongoClient = require('../mongo/Urls');
const TrackingMongoClient = require('../mongo/Tracking');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();
const MODULE = 'UrlController';

async function shorten(req, res) {
  const METHOD = 'shorten';
  try {
    const Url = new UrlsMongoClient();
    const tokenId = res.locals.token ? res.locals.token.id : null;

    if (req.body.url) {
      const targetUrl = req.body.url.replace(/\/$/, '');
      // Check if url already exists in the database
      let short = await Url.findOne({ target_url: targetUrl });
      let isNew = false;
      if (!short) {
        // Since it doesn't exist, let's go ahead and create it
        short = await Url.create(targetUrl, tokenId);
        isNew = true;
      }

      if (!short) {
        await logger.warn(`${MODULE}.${METHOD}`, 'Invalid shorten payload.');
        return res.status(500).json({ error: 'Invalid shorten payload.' });
      }

      return createShortResponse(req, res, short, isNew);
    }
    await logger.warn(`${MODULE}.${METHOD}`, 'Invalid shorten payload.');
    return res.status(400).json({ error: 'Invalid shorten payload.' });
  } catch (err) {
    await logger.error(`${MODULE}.${METHOD}`, err, { stack: err.stack });
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

async function redirect(req, res) {
  const METHOD = 'redirect';
  const Url = new UrlsMongoClient();
  const Tracking = new TrackingMongoClient();
  const { id } = req.params;

  const short = await Url.get(id);
  if (short) {
    await Tracking.create(req, { action: 'url.redirect', ...short });
    return res.redirect(short.target_url);
  }

  await logger.warn(`${MODULE}.${METHOD}`, `Short url not found: ${id}`);
  await Url.close();
  await Tracking.close();
  return res.status(404).end();
}

async function createShortResponse(req, res, short, isNew) {
  const METHOD = 'createShortResponse';
  const Tracking = new TrackingMongoClient();

  const sourceHost = requests.getSourceHost(req);
  // If the url already exists, return the existing short url
  const output = {
    id: short.id,
    target: short.target_url,
    url: `${sourceHost}/${short.id}`,
    urls: [
      `${sourceHost}/${short.id}`,
      `${sourceHost}/g/${short.id}`,
      `${sourceHost}/go/${short.id}`,
    ],
    new: isNew,
    created_by: short.created_by,
  };
  await logger.debug(`${MODULE}.${METHOD}`, JSON.stringify(output));
  await Tracking.create(req, { action: 'url.shorten', ...output });
  delete output.created_by;
  await Tracking.close();
  return res.status(200).json(output);
}

module.exports = {
  shorten, redirect,
};
