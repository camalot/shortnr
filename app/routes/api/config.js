const ConfigController = require('../../api/controllers/ConfigController');
const { Router } = require('express');

const router = Router();

router.route('/assets/javascript/config.js')
  .get(ConfigController.config);

module.exports = router;