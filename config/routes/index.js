const express = require('express');
const urlRoutes = require('./url');
const tokenRoutes = require('./token');
const config = require('../env/environment');
const { use } = require('chai');

const router = express.Router();

router.get('/api-status', (req, res) => res.json({ status: 'ok' }));

router.use('/', urlRoutes);

if (config.tokens.create.enabled) {
  router.use('/', tokenRoutes);
}

module.exports = router;
