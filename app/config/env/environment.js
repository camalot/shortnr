require('dotenv').config();

function stripQuotes(str) {
  return str.replace(/^"(.*)"$/, '$1');
}

function buildMongoUrl() {
  const mUrl = stripQuotes(getEnvVarString('NUS_MONGODB_URL', ''));
  if (mUrl) {
    return mUrl;
  } else {
    const host = stripQuotes(getEnvVarString('NUS_MONGODB_HOST', 'localhost'));
    const port = stripQuotes(getEnvVarString('NUS_MONGODB_PORT', '27017'));
    const user = stripQuotes(getEnvVarString('NUS_MONGODB_USERNAME', ''));
    const pass = stripQuotes(getEnvVarString('NUS_MONGODB_PASSWORD', ''));
    const authSource = stripQuotes(getEnvVarString('NUS_MONGODB_AUTHSOURCE', 'admin'));
    let auth = '';

    if (host && port) {
      if (process.env.NUS_MONGODB_USERNAME && pass) {
        auth = `${user}:${pass}@`;
      } 
      const url = `mongodb://${auth}${host}:${port}/${authSource}`;
      return url;
    }
  }
  return 'mongodb://localhost:27017/admin';
}

function getEnvVarBooleanDefault(envVar, defaultValue) {
  if (process.env[envVar] === undefined) {
    return defaultValue;
  }
  return process.env[envVar].toLowerCase() === 'true';
}

function getEnvVarList(envVar, defaultValue) {
  if (process.env[envVar]) {
    return process.env[envVar].split(',').map(h => h.trim());
  }
  return defaultValue;
}

function getEnvVarString(envVar, defaultValue) {
  if (process.env[envVar]) {
    return process.env[envVar];
  }
  return defaultValue;
}

function getEnvVarInt(envVar, defaultValue) {
  if (process.env[envVar]) {
    let result = parseInt(process.env[envVar]);
    if (isNaN(result)) {
      return defaultValue;
    } 
    return result;
  }
  return defaultValue;
}

const ui_enabled = getEnvVarBooleanDefault('NUS_UI_ENABLED', true);

module.exports = {
  log: {
    level: {
      db: getEnvVarString('NUS_LOG_LEVEL', 'WARN').toUpperCase(),
      console: getEnvVarString('NUS_LOG_LEVEL_CONSOLE', 'DEBUG').toUpperCase(),
    },
  },
  mongo: {
    url: buildMongoUrl(),
    database: getEnvVarString('NUS_MONGO_DATABASE', 'shortener_dev'),
  },
  short: {
    length: {
      min: getEnvVarInt('NUS_SHORT_ID_MIN_LENGTH', 6),
      max: getEnvVarInt('NUS_SHORT_ID_MAX_LENGTH', 12)
    },
    blocked: {
      hosts: getEnvVarList('NUS_SHORT_BLOCKED_HOSTS', []),
      protocols: getEnvVarList('NUS_SHORT_BLOCKED_PROTOCOLS', []),
    },
  },
  ui: {
    enabled: ui_enabled,
    allow: getEnvVarList('NUS_UI_ALLOWED_HOSTS', ui_enabled ? ['*'] : []),
  },
  metrics: {
    requireToken: getEnvVarBooleanDefault('NUS_METRICS_REQUIRE_TOKEN', true),
  },
  tokens: {
    prefix: getEnvVarString('NUS_TOKEN_PREFIX', 'nus_'),
    length: getEnvVarInt('NUS_TOKEN_LENGTH', 36),
    create: {
      enabled: getEnvVarBooleanDefault('NUS_ENABLE_TOKEN_CREATE', true),
    },
    required: getEnvVarBooleanDefault('NUS_TOKEN_REQUIRED', true)
  }
};
