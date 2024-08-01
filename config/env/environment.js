
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

module.exports = {
  mongo: {
    url: process.env.NUS_MONGODB_URL || 'mongodb://localhost:27017/admin',
    database: process.env.NUS_MONGO_DATABASE || 'shortener_dev',
  },
  webhost: process.env.NUS_WEBHOST_URL || 'http://localhost:3000',
  tokens: {
    create: {
      enabled: process.env.NUS_ENABLE_TOKEN_CREATE || false,
    }
,    required: process.env.NUS_TOKEN_REQUIRED || true
  }

};
