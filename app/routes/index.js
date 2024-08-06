const UrlRouter = require('./url');
const TokenRouter = require('./token');
const MetricsRouter = require('./metrics');
const HealthRouter = require('./health');
const ApiStatsRouter = require('./api/stats');
const ApiShortenRouter = require('./api/shorten');
const ApiConfigRouter = require('./api/config');

const config = require('../config');
const { Router } = require('express');

const router = Router();

router.use('/', HealthRouter);

router.use('/', ApiConfigRouter);
router.use('/', MetricsRouter);
router.use('/', ApiStatsRouter);
router.use('/', ApiShortenRouter);
router.use('/', UrlRouter);

if (config.tokens.create.enabled) {
  router.use('/', TokenRouter);
}

module.exports = router;
