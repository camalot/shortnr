const express = require('express');
const urlRoutes = require('./url');
const tokenRoutes = require('./token');
const statsRoutes = require('./stats');
const config = require('../env/environment');
const { use } = require('chai');

const router = express.Router();

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

router.use('/', statsRoutes);

router.use('/', urlRoutes);

if (config.tokens.create.enabled) {
  router.use('/', tokenRoutes);
}

module.exports = router;
