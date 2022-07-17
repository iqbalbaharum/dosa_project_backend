const Web3 = require('web3')
const { createMetadata } = require('./metadata.controller')
const { getNftMetadata } = require('../services/covalenthq.service')
const web3StorageService = require('../services/web3-storage.service.js')
const web3 = new Web3(process.env.ETH_RPC_URL)
const nft721abi = require('../data/DOSA1NFT_abi.json')

exports.mint = async(req, res) => {
  const uri = await createMetadata()
  const contract = new web3.eth.Contract(nft721abi, process.env.ADDRESS_NFT721)
  // add private key
  web3.eth.accounts.wallet.add(process.env.ETH_PRIVATE_KEY)
  contract.setProvider(web3.currentProvider)

  await contract.methods
    .mint(req.body.to_address, uri)
    .send({
      from: process.env.ETH_PUBLIC_KEY,
      to: process.env.ADDRESS_NFT721,
      gas: parseInt(process.env.GAS_FEE) ?? 300000
    })
}

exports.consumeNft = async(req, res) => {
  if(!req.body.base_address && !req.body.base_token_id) { 
    res.status(400).json({
      message: 'NO BASE NFT'
    })
    return
  }

  if(!req.body.consumable_address && !req.body.consumable_token_id) { 
    res.status(400).json({
      message: 'NO CONSUMABALE NFT'
    })
    return
  }

  for(const item of response.data.items) {
    if(!nft_data) continue


  }



  //find the nft metadata
  const [baseNft, consumableNft] = await Promise.All([
    getNftMetadata(parseInt(process.env.CHAIN_ID), req.body.base_address, req.body.base_token_id),
    getNftMetadata(parseInt(process.env.CHAIN_ID), req.body.consumable_address, req.body.consumable_token_id)
  ])

  //get base hash

  console.log(baseNft, consumableNft)
}