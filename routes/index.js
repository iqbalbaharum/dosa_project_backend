var express = require('express');
const { createMetadata, checkout, kill, fetchLatest } = require('../controller/metadata.controller');
const { mint, consumeNft } = require('../controller/nft.controller');
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

router.post('/dosa/mint', async (req, res, next) => {
  try {
    await mint(req, res)
  } catch(e) {
    console.log(e)
  }
});

router.post('/dosa/consume', async(req, res) => {
  try {
    await consumeNft(req, res)
  } catch(e) {
    console.log(e)
  }
})

module.exports = router;
