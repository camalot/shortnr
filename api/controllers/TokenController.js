const config = require('../../config/env');
const TokensMongoClient = require('../mongo/Tokens');

function create(req, res) {
  if (!config.tokens.create.enabled) {
    return res.status(404);
  }

  const token = new TokensMongoClient();
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  return token.create(name).then((r) => {
    if (r) {
      return res.status(200).json({ token: r.token });
    }
    return res.status(500).json({ error: 'Unable to generate token' });
  }).catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'An error has occurred' });
  });
}

function destroy(req, res) {
  if (!config.tokens.create.enabled) {
    return res.status(404);
  }

  tokens = new TokensMongoClient();
  const { id } = req.params;
  const { token } = req.body;
  return tokens.destroy(id, token).then((r) => {
    if (r) {
      return res.status(204).json({ message: 'Token deleted' });
    }
    return res.status(404).json({ error: 'token not found' });
  }).catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'An error has occurred' });
  });
}

module.exports = {
  create, destroy,
};
