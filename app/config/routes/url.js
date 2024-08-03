const UrlController = require('../../api/controllers/UrlController');
const token = require('../../api/middleware/token');
const url = require('../../api/middleware/url');
const { Router } = require('express');

const router = Router();

router.route('/api/shorten')
  .post(url.scope)
  .post(token.verify)
  .post(UrlController.shorten);

router.route('/go/:id')
  .get(url.scope)
  .post(token.verify)
  .get(UrlController.redirect);

router.route('/g/:id')
  .get(url.scope)
  .post(token.verify)
  .get(UrlController.redirect);

router.route('/:id')
  .get(url.scope)
  .post(token.verify)
  .get(UrlController.redirect);

module.exports = router;
