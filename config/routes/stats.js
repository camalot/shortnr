const express = require('express');
const statsCtrl = require('../../api/controllers/StatsController');

const router = express.Router();

router.route('/api/stats').post(statsCtrl.stats);
router.route('/api/stats/:id').delete(statsCtrl.statsById);
router.route('/metrics').get(statsCtrl.metrics);

module.exports = router;
