const ScriptsController = require('../../api/controllers/ScriptsController');
const { Router } = require('express');

const router = Router();

router.route('/assets/javascript/config.js')
  .get(ScriptsController.config);

router.route('/assets/javascript/scripts.js')
  .get(ScriptsController.scripts);

module.exports = router;