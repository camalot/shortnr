const config = require('../config');
const { Router } = require('express');
const SettingsMongoClient = require('../api/mongo/Settings')



const router = Router();

async function getHealth(req, res) {
  try {
    let settingsClient = new SettingsMongoClient();
    await settingsClient.connect();
    await settingsClient.close();
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

router.get('/health', getHealth);
router.get('/healthz', getHealth);
router.get('/livez', getHealth);
router.get('/readyz', getHealth);


module.exports = router;