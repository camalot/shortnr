
function buildMongoUrl() {
  const mUrl = (process.env.NUS_MONGODB_URL || '').replace(/^"(.*)"$/, '$1');
  if (mUrl) {
    console.log(`Using provided MongoDB URL: ${mUrl}`);
    return mUrl;
  } else {
    const host = (process.env.NUS_MONGODB_HOST || 'localhost').replace(/^"(.*)"$/, '$1');
    const port = (process.env.NUS_MONGODB_PORT || '27017').replace(/^"(.*)"$/, '$1');
    const user = (process.env.NUS_MONGODB_USERNAME || '').replace(/^"(.*)"$/, '$1');
    const pass = (process.env.NUS_MONGODB_PASSWORD || '').replace(/^"(.*)"$/, '$1');
    const authSource = (process.env.NUS_MONGODB_AUTHSOURCE || 'admin').replace(/^"(.*)"$/, '$1');
    let auth = '';

    if (host && port) {
      if (process.env.NUS_MONGODB_USERNAME && pass) {
        auth = `${user}:${pass}@`;
        console.log(auth);
      } else {
        console.log("NO AUTH INFO FOR MONGODB");
      }
      const url = `mongodb://${auth}${host}:${port}/${authSource}`;
      console.log(`Using constructed MongoDB URL: ${url}`);
      return url;
    }
  }

  console.log('Using default MongoDB URL: mongodb://localhost:27017/admin');
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
