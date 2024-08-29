const config = require('../../config/env');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();
const MODULE = 'StatsMiddleware';

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

async function scope(req, res, next) {
  const METHOD = 'scope';
  const activeRoute = req.route.path;

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
      if (config.metrics.tokenRequired && config.tokens.required) {
        await logger.debug(`${MODULE}.${METHOD}`, 'Token and stats required');
        scopes = ['stats.read'];
      } 

      scopes = scopes;
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