const UrlController = require('../../api/controllers/UrlController');
const token = require('../../api/middleware/token');
const url = require('../../api/middleware/url');
const { Router } = require('express');

const router = Router();

router.route('/api/shorten')
  .post(url.scope)
  .post(token.verify)
  .post(url.blocked)
  .post(UrlController.shorten);

module.exports = router;