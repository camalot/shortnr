const express = require('express');
const tokenCtrl = require('../../api/controllers/TokenController');

const router = express.Router();

router.route('/api/token').post(tokenCtrl.create);
router.route('/api/token/:id').delete(tokenCtrl.destroy);

module.exports = router;
