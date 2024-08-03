const express = require('express');
const statsCtrl = require('../../api/controllers/StatsController');
const UIAllow = require('../../api/middleware/uiAllow');

const router = express.Router();

router.route('/api/stats').get(statsCtrl.stats);
router.route('/api/stats/:id').get(statsCtrl.statsById);
router.route('/metrics')
  .get(UIAllow.verify)
  .get(statsCtrl.metrics);

module.exports = router;
