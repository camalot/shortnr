const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

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

module.exports = { scope };