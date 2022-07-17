
const bigChainDataSource = require('./../datasource/bigchaindb.datasource')

exports.fetchLatest = async(req, res) => {
  const asset = await bigChainDataSource.fetchLatestTransaction(req.params.asset_id)
  if(asset) {
    res.json(asset)
  } else {
    res.json({
      message: 'No asset registered'
    })
  }
}

/***
 * Create initial asset for the rocket
 */
exports.createMetadata = async(req, res) => {

  const metadata = {
    stats: {
      attack: 1.0 + parseFloat((Math.random() * 1.0).toFixed(2)),
      defense: 1.0 + parseFloat((Math.random() * 1.0).toFixed(2)),
      growth_rate: 0.05 + parseFloat((Math.random() * 0.05).toFixed(2)),
      income_rate: 0.001 + parseFloat((Math.random() * 0.001).toFixed(2)),
    },
    token: {
      available: 0,
      spent: 0,
    },
    level: {
      current: 1,
      next_level: 500 * Math.pow((2), 2) - (500 * 2)
    }
  }

  // generate asset Id
  let asset = await bigChainDataSource.create({
    asset: {
      type: process.env.METADATA_TYPE
    },
    metadata
  })

  // res.json({
  //   asset_id:`bcdb://${asset.id}`
  // })

  return `bcdb://${asset.id}`
}

/***
 * Update ERC20 token in the nft
 * 1 kill = 1 DOSA
 */
exports.kill = async(req, res) => {
  if(req.body.kill <= 0) return
  if(!req.body.asset_id) return

  const total_point = req.body.kill * 0.01
  
  const asset = await bigChainDataSource.fetchLatestTransaction(req.body.asset_id)

  if(!asset) { return }

  // update the metadata
  asset.metadata.token.available += total_point

  await bigChainDataSource.append(asset.id, asset.metadata)
}

/***
 * Character level up
 */
exports.levelup = async(req, res) => {
}

/**
 * Character want to checkout and leave the game
 * @param {*} req 
 * @param {*} res 
 */
exports.checkout = async(req, res) => {
}