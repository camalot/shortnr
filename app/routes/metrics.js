const StatsController = require('../api/controllers/StatsController');
const ui = require('../api/middleware/ui');
const stats = require('../api/middleware/stats');
const token = require('../api/middleware/token');
const { Router } = require('express');

const router = Router();

router.route('/metrics')
  .get(ui.allow)
  .get(stats.scope)
  .get(token.verify)
  .get(StatsController.metrics);

module.exports = router;
