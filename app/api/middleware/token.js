const config = require('../../config/env');
const TokensMongoClient = require('../mongo/Tokens');
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
    case '/api/token':
      await logger.debug('TokenMiddleware.scope', 'Registering scopes: [] for /api/token:POST');
      res.locals[activeRoute]['post'].scopes = [];
      break;
    case '/api/token/:id':
      await logger.debug('TokenMiddleware.scope', 'Registering scopes: [token.delete] for /api/token/:id:DELETE');
      // todo: set delete scope to ONLY the token id
      // 'token.delete.123467890' or 'token.delete.*' for all tokens
      res.locals[activeRoute]['delete'].scopes = ['token.delete'];
      break;
    case '/api/token/scope/:id':
      await logger.debug('TokenMiddleware.scope', 'Registering scopes: [token.scope] for /api/token/scope/:id:POST');
      res.locals[activeRoute]['post'].scopes = ['token.scope.grant'];
      res.locals[activeRoute]['delete'].scopes = ['token.scope.revoke'];
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