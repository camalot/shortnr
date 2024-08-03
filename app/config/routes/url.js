const express = require('express');
const urlCtrl = require('../../api/controllers/UrlController');
const token = require('../../api/middleware/token');
const router = express.Router();

router.route('/api/shorten')
  .post(token.verify)
  .post(urlCtrl.shorten);

router.route('/go/:id').get(urlCtrl.redirect);
router.route('/g/:id').get(urlCtrl.redirect);
router.route('/:id').get(urlCtrl.redirect);

module.exports = router;
