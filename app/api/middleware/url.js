const config = require('../../config');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();
const MODULE = 'UrlMiddleware';

async function registerScopes(req, res, route, method, scopes) {
  const METHOD = 'registerScopes';
  if (!res.locals[route]) {
    res.locals[route] = {};
  }
  if (!res.locals[route][method.toLowerCase()]) {
    res.locals[route][method.toLowerCase()] = {};
  }

  await logger.debug(`${MODULE}.${METHOD}`, `Registering scopes: ${JSON.stringify(scopes)} for ${route}}:${method.toUpperCase()}`);
  res.locals[route][method].scopes = scopes;
}

async function blocked(req, res, next) {
  const METHOD = 'blocked';
  try {
    const targetUrl = req.body.url.replace(/\/$/, '');
    const blockedHosts = config.short.blocked.hosts;
    const blockedProtocols = config.short.blocked.protocols.map(p => p.replace(':', ''));

    // Check if the targetUrl is in the blockedHosts list
    // get the protocol and host from the targetUrl
    url = targetUrl;
    // get protocol from url
    if (!url || url.length === 0) {
      await logger.warn(`${MODULE}.${METHOD}`, 'URL is required.');
      return res.status(400).json({ error: 'URL is required.' });
    }
    const splits = url.split(':');
    if (!splits || splits.length < 2) {
      await logger.warn(`${MODULE}.${METHOD}`, `Invalid URL: ${targetUrl}`);
      return res.status(400).json({ error: 'Invalid URL.' });
    }
    const protocol = splits[0].replace(':', '');
    // get host parts from url
    const domainPort = splits[1].replace(/^\/\//gi, '').split('/')[0];
    const hostParts = domainPort.split(':');
    const host = hostParts[0];
    let port = null;
    if (hostParts.length > 1) {
      port = hostParts[1];
    }

    if (blockedProtocols.includes(protocol) || blockedHosts.includes(host)) {
      await logger.warn(`${MODULE}.${METHOD}`, `Blocked request to ${targetUrl}`);
      return res.status(403).json({ error: 'This URL is not allowed.' });
    }
    return next();
  } catch (error) {
    await logger.error(`${MODULE}.${METHOD}`, error, error.stack);
    return next();
  }
}

async function scope(req, res, next) {
  let activeRoute = req.route.path;

  if (!res.locals[activeRoute]) {
    res.locals[activeRoute] = {};
  }

  // loop all methods for the route
  for (const m in req.route.methods) {
    if (req.route.methods[m]) {
      if (!res.locals[activeRoute][m.toLowerCase()]) {
        res.locals[activeRoute][m.toLowerCase()] = {};
      }
    }
  }

  let scopes = [];
  let method = 'get';

  switch (req.route.path) {
    case '/go/:id':
    case '/g/:id':
    case '/:id':
      scopes = [];
      method = 'get';
      await registerScopes(req, res, activeRoute, method, scopes);
      break;
    case '/api/shorten':
      scopes = ['url.create'];
      method = 'post';
      await registerScopes(req, res, activeRoute, method, scopes);
      break;
    default:
      return next();
  }

  return next();
}

module.exports = { 
  scope, blocked,
};