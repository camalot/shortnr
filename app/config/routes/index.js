const UrlRouter = require('./url');
const TokenRouter = require('./token');
const StatsRouter = require('./stats');
const config = require('../env/environment');
const { Router } = require('express');

const router = Router();

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

router.use('/', StatsRouter);

router.use('/', UrlRouter);

if (config.tokens.create.enabled) {
  router.use('/', TokenRouter);
}

module.exports = router;
