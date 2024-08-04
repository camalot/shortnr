const config = require('../../config/env');
const TokensMongoClient = require('../mongo/Tokens');
const LogsMongoClient = require('../mongo/Logs');

const logger = new LogsMongoClient();

async function registerScopes(req, res, route, method, scopes) {
  if (!res.locals[route]) {
    res.locals[route] = {};
  }
  if (!res.locals[route][method.toLowerCase()]) {
    res.locals[route][method.toLowerCase()] = {};
  }

  await logger.debug('TokenMiddleware.registerScopes', `Registering scopes: ${JSON.stringify(scopes)} for ${route}}:${method.toUpperCase()}`);
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
    case '/api/token':
      scopes = [];
      method = 'post';
      await registerScopes(req, res, activeRoute, method, scopes);
      break;
    case '/api/token/:id':
      method = 'delete';
      scopes = ['token.delete'];
      
      // // get the id from the route
      // let token_id = req.params.id || req.query.id;
      // if (token_id) {
      //   scopes = [`token.delete.${token_id}`];
      // }

      await registerScopes(req, res, activeRoute, method, scopes);
      break;
    case '/api/token/scope/:id':
      // same type of granular scope as above?
      scopes = ['token.scope.grant'];
      method = 'post';
      await registerScopes(req, res, activeRoute, method, scopes);
      scopes = ['token.scope.revoke'];
      method = 'delete';
      await registerScopes(req, res, activeRoute, method, scopes);
      break;
    case '/api/token/disable/:id':
    case '/api/token/enable/:id':
      scopes = ['token.enable'];
      method = 'patch';
      await registerScopes(req, res, activeRoute, method, scopes);
      break;
    default:
      return next();
  }

  return next();
}

async function enabled(req, res, next) {
  if (!config.tokens.create.enabled) {
    await logger.warn('TokenMiddleware.enabled', 'Token creation is disabled, but request was made.');
    return res.status(404).end();
  }
  return next();
}

async function verify(req, res, next) {
  await logger.debug('TokenMiddleware.verify', 'Verifying token.');
  let accessToken = req.headers['x-access-token'];
  if (!accessToken) {
    const authorization = req.headers['authorization'];
    if (authorization) {
      const parts = authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        accessToken = parts[1];
      }
    }
  }
  if (!accessToken) {
    accessToken = req.query.token;
  }

  if (!config.tokens.required && !accessToken) {
    await logger.info('TokenMiddleware.verify', 'Token is not required. Skipping Validation.');
    res.locals.token = null;
    return next();
  }

  const activeRoute = req.route.path;
  const activeMethod = req.method.toLowerCase();

  const requiredScopes = res.locals[activeRoute][activeMethod].scopes;

  if ((!requiredScopes || requiredScopes.length === 0) && !accessToken) {
    return next();
  } else if (!accessToken && requiredScopes && requiredScopes.length > 0) {
    await logger.warn('TokenMiddleware.verify', 'Token required for route, but not provided.');
    return res.status(403).json({ error: 'Token required for route, but not provided.', missingScopes: requiredScopes });
  }

  const Tokens = new TokensMongoClient();

  const token = await Tokens.findOne({ token: accessToken });
  if (!token) {
    await logger.warn('TokenMiddleware.verify', `Token not found. Token: ${accessToken}`);
    return res.status(403).json({ error: 'Token not found.' });
  }

  res.locals.token = token;

  const valid = await Tokens.valid(token.token);
  let missingScopes = [];
  if (requiredScopes && requiredScopes.length > 0) {
    for (let i = 0; i < requiredScopes.length; i += 1) {
      let scope = requiredScopes[i];

      let hasScope = await Tokens.hasScope(token.token, scope);
      if (!hasScope) {
        await logger.debug('TokenMiddleware.verify', `Token does not have required scope: ${scope}`);
        missingScopes.push(scope);
      }
    }

    if (missingScopes.length === 0 && valid) {
      return next();
    }

    await logger.warn('TokenMiddleware.verify', 'Token does not have required scope.');
    return res.status(403).json({ error: 'Token does not have required scope.', missingScopes });
  } else {
    await logger.debug('TokenMiddleware.verify', 'No scopes required for route.');
    if (valid) {
      return next();
    }
  }

  await logger.warn('TokenMiddleware.verify', 'Invalid token provided.');
  return res.status(403).json({ error: 'Invalid token provided.' });
}

module.exports = {
  verify, enabled, scope,
};