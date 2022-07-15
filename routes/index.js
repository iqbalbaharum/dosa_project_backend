var express = require('express');
const { createMetadata, checkout, kill, fetchLatest } = require('../controller/metadata.controller');
var router = express.Router();

/* GET home page. */
router.post('/dosa/create', async (req, res, next) => {
  try {
    await createMetadata(req, res)
  } catch(e) {
    console.log(e)
  }
});

router.get('/dosa/get/:asset_id', async (req, res, next) => {
  try {
    await fetchLatest(req, res)
  } catch(e) {
    console.log(e)
  }
});

router.post('/dosa/point', async (req, res, next) => {
  try {
    await kill(req, res)
  } catch(e) {
    console.log(e)
  }
});

module.exports = router;
