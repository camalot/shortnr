const config = require('../../config');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function blocked(req, res, next) {
  const targetUrl = req.body.url.replace(/\/$/, '');
  const blockedHosts = config.short.blocked.hosts;
  const blockedProtocols = config.short.blocked.protocols.map(p => p.replace(':', ''));

  // Check if the targetUrl is in the blockedHosts list
  // get the protocol and host from the targetUrl
  const url = new URL(targetUrl);
  const protocol = url.protocol.replace(':', '');
  // remove port from host
  const hostParts = url.host.split(':');
  const host = hostParts[0];
  let port = null;
  if (hostParts.length > 1) {
    port = hostParts[1];
  }

  if (blockedProtocols.includes(protocol) || blockedHosts.includes(host)) {
    await logger.warn('UrlMiddleware.blocked', `Blocked request to ${targetUrl}`);
    return res.status(403).json({ error: 'This URL is not allowed.' });
  }
  return next();
}

async function scope(req, res, next) {
  let activeRoute = req.route.path;

  if (!res.locals[activeRoute]) {
    res.locals[activeRoute] = {};
  }

  // loop all methods for the route
  for (const method in req.route.methods) {
    if (req.route.methods[method]) {
      if (!res.locals[activeRoute][method.toLowerCase()]) {
        res.locals[activeRoute][method.toLowerCase()] = {};
      }
    }
  }

  switch (req.route.path) {
    case '/go/:id':
    case '/g/:id':
    case '/:id':
      await logger.debug('UrlMiddleware.scope', `Registering scopes: [] for ${req.route.path}:GET`);
      res.locals[activeRoute]['get'].scopes = [];
      break;
    case '/api/shorten':
      await logger.debug('UrlMiddleware.scope', `Registering scopes: [url.create] for ${req.route.path}:POST`);
      res.locals[activeRoute]['post'].scopes = ['url.create']
      break;
    default:
      return next();
  }

  return next();
}

module.exports = { 
  scope, blocked,
};