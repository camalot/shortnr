
function stripQuotes(str) {
  return str.replace(/^"(.*)"$/, '$1');
}

function buildMongoUrl() {
  const mUrl = stripQuotes(process.env.NUS_MONGODB_URL || '');
  if (mUrl) {
    return mUrl;
  } else {
    const host = stripQuotes(process.env.NUS_MONGODB_HOST || 'localhost');
    const port = stripQuotes(process.env.NUS_MONGODB_PORT || '27017');
    const user = stripQuotes(process.env.NUS_MONGODB_USERNAME || '');
    const pass = stripQuotes(process.env.NUS_MONGODB_PASSWORD || '');
    const authSource = stripQuotes(process.env.NUS_MONGODB_AUTHSOURCE || 'admin');
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

let token_required = false;
if (process.env.NUS_TOKEN_REQUIRED === undefined || process.env.NUS_TOKEN_REQUIRED.toLowerCase() !== 'false') {
  token_required = true;
}

let token_create = false;
if (process.env.NUS_ENABLE_TOKEN_CREATE === undefined || process.env.NUS_ENABLE_TOKEN_CREATE.toLowerCase() !== 'false') {
  token_create = true;
}

let ui_enabled = false;
if (process.env.NUS_UI_ENABLED === undefined || process.env.NUS_UI_ENABLED.toLowerCase() !== 'false') {
  ui_enabled = true;
}

let ui_allowed_hosts = [];
if (process.env.NUS_UI_ALLOWED_HOSTS) {
  // split and trim the hosts
  ui_allowed_hosts = process.env.NUS_UI_ALLOWED_HOSTS.split(',').map(h => h.trim());
} else {
  ui_allowed_hosts = ui_enabled ? ['*'] : [];
}

module.exports = {
  log: {
    level: {
      db: (process.env.NUS_LOG_LEVEL || 'WARN').toUpperCase(),
      console: (process.env.NUS_LOG_LEVEL_CONSOLE || 'DEBUG').toUpperCase(),
    },
  },
  mongo: {
    url: buildMongoUrl(),
    database: process.env.NUS_MONGO_DATABASE || 'shortener_dev',
  },
  short: {
    length: {
      min: parseInt(process.env.NUS_SHORT_ID_MIN_LENGTH) || 6,
      max: parseInt(process.env.NUS_SHORT_ID_MAX_LENGTH) || 12
    },
    blocked: {
      hosts: process.env.NUS_BLOCKED_HOSTS ? process.env.NUS_BLOCKED_HOSTS.split(',').map(h => h.trim()) : [],
      protocols: process.env.NUS_BLOCKED_PROTOCOLS ? process.env.NUS_BLOCKED_PROTOCOLS.split(',').map(h => h.trim()) : []
    }

  },
  ui: {
    enabled: ui_enabled,
    allow: ui_allowed_hosts,
  },
  tokens: {
    prefix: process.env.NUS_TOKEN_PREFIX || 'nus_',
    length: parseInt(process.env.NUS_TOKEN_LENGTH) || 36,
    create: {
      enabled: token_create,
    },
    required: token_required
  }
};
