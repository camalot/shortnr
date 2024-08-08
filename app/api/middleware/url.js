const config = require('../../config');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function registerScopes(req, res, route, method, scopes) {
  if (!res.locals[route]) {
    res.locals[route] = {};
  }
  if (!res.locals[route][method.toLowerCase()]) {
    res.locals[route][method.toLowerCase()] = {};
  }

  await logger.debug('UrlMiddleware.registerScopes', `Registering scopes: ${JSON.stringify(scopes)} for ${route}}:${method.toUpperCase()}`);
  res.locals[route][method].scopes = scopes;
}

async function blocked(req, res, next) {
  try {
    const targetUrl = req.body.url.replace(/\/$/, '');
    const blockedHosts = config.short.blocked.hosts;
    const blockedProtocols = config.short.blocked.protocols.map(p => p.replace(':', ''));

    // Check if the targetUrl is in the blockedHosts list
    // get the protocol and host from the targetUrl
    url = targetUrl;
    // get protocol from url
    const protocol = url.split(':')[0].replace(':', '');
    // get host parts from url
    const domainPort = url.split(':')[1].replace(/^\/\//gi, '').split('/')[0];
    const hostParts = domainPort.split(':');
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
  } catch (error) {
    await logger.error('UrlMiddleware.blocked', error, error.stack);
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