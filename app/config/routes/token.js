const express = require('express');
const tokenCtrl = require('../../api/controllers/TokenController');
const token = require('../../api/middleware/token');

const router = express.Router();

router.route('/api/token')
  .post(token.enabled)
  .post(tokenCtrl.create);
router.route('/api/token/:id')
  .delete(token.enabled)
  .delete(token.verify)
  .delete(tokenCtrl.destroy);

module.exports = router;
