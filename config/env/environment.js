
function buildMongoUrl() {
  const mUrl = process.env.NUS_MONGODB_URL;
  if (mUrl) {
    return mUrl;
  } else {
    const host = process.env.NUS_MONGODB_HOST || 'localhost';
    const port = process.env.NUS_MONGODB_PORT || '27017';
    const user = process.env.NUS_MONGODB_USERNAME || null;
    const pass = process.env.NUS_MONGODB_PASSWORD || null;
    const authSource = process.env.NUS_MONGODB_AUTHSOURCE || 'admin';

    if (host && port) {
      if (process.env.NUS_MONGODB_USERNAME && pass) {
        const auth = `${user}:${pass}@`;
      }
      return `mongodb://${auth}${host}:${port}/${authSource}`;
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

module.exports = {
  mongo: {
    url: buildMongoUrl(),
    database: process.env.NUS_MONGO_DATABASE || 'shortener_dev',
  },
  webhost: process.env.NUS_WEBHOST_URL || 'http://localhost:3000',
  short: {
    length: {
      min: parseInt(process.env.NUS_SHORT_ID_MIN_LENGTH) || 6,
      max: parseInt(process.env.NUS_SHORT_ID_MAX_LENGTH) || 12
    }
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
