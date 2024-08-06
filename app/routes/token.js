const TokenController = require('../api/controllers/TokenController');
const token = require('../api/middleware/token');
const { Router } = require('express');

const router = Router();

router.route('/api/token')
  .post(token.scope)
  .post(token.enabled)
  .post(TokenController.create);

router.route('/api/token/:id')
  .delete(token.scope)
  .delete(token.enabled)
  .delete(token.verify)
  .delete(TokenController.destroy);

router.route('/api/token/scope/:id')
  .post(token.scope)
  .post(token.verify)
  .post(TokenController.grantScope);

router.route('/api/token/scope/:id')
  .delete(token.scope)
  .delete(token.verify)
  .delete(TokenController.revokeScope);

router.route('/api/token/enable/:id')
  .patch(token.scope)
  .patch(token.verify)
  .patch(TokenController.enable);

router.route('/api/token/disable/:id')
  .patch(token.scope)
  .patch(token.verify)
  .patch(TokenController.disable);

module.exports = router;
