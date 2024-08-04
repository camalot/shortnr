const config = require('../../config/env');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function registerScopes(req, res, route, method, scopes) {
  if (!res.locals[route]) {
    res.locals[route] = {};
  }
  if (!res.locals[route][method.toLowerCase()]) {
    res.locals[route][method.toLowerCase()] = {};
  }

  await logger.debug('StatsMiddleware.registerScopes', `Registering scopes: ${JSON.stringify(scopes)} for ${route}}:${method.toUpperCase()}`);
  res.locals[route][method].scopes = scopes;
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
    case '/api/stats':
    case '/api/stats/:id':
    case '/metrics':
      scopes = config.tokens.required ? ['stats.read'] : [];
      method = 'get';
      await registerScopes(req, res, activeRoute, method, scopes);
      break;
    default:
      return next();
  }

  return next();
}

module.exports = {
  scope
};