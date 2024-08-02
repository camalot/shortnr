const express = require('express');
const urlCtrl = require('../../api/controllers/UrlController');

const router = express.Router();

router.route('/api/shorten').post(urlCtrl.shorten);

router.route('/go/:id').get(urlCtrl.redirect);
router.route('/g/:id').get(urlCtrl.redirect);
router.route('/:id').get(urlCtrl.redirect);

module.exports = router;
