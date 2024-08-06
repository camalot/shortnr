const config = require('../config');
const { Router } = require('express');

const router = Router();

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
router.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));
router.get('/livez', (req, res) => res.status(200).json({ status: 'ok' }));
router.get('/readyz', (req, res) => res.status(200).json({ status: 'ok' }));

module.exports = router;