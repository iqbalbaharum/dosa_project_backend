const Web3 = require('web3')
const { createMetadata } = require('./metadata.controller')
const bigchaindb = require('../datasource/bigchaindb.datasource.js')
const { getNftMetadata } = require('../services/covalenthq.service')
const web3StorageService = require('../services/web3-storage.service.js')
const web3 = new Web3(process.env.ETH_RPC_URL_HTTP)
// abi
const nft721abi = require('../data/DOSA1NFT_abi.json')
const nftslotabi = require('../data/DosaSlotNFT-abi.json')

exports.mint = async(req, res) => {
  res.json(await createMetadata())
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


  //find the nft metadata
  const responses = await Promise.all([
    getNftMetadata(parseInt(process.env.CHAIN_ID), req.body.base_address, req.body.base_token_id),
    getNftMetadata(parseInt(process.env.CHAIN_ID), req.body.consumable_address, req.body.consumable_token_id)
  ])

  if(!responses[0].data.data.items[0]) {
    res.status(400).json({
      message: 'INVALID BASE NFT'
    })
    return
  }

  if(!responses[1].data.data.items[0]) {
    res.status(400).json({
      message: 'INVALID CONSUMABLES NFT'
    })
    return
  }

  const baseNft = responses[0].data.data.items[0].nft_data[0]
  const consumableNft = responses[1].data.data.items[0].nft_data[0]

  // read data
  baseProtocol = baseNft.token_url.split('://')
  consumableProtocol = consumableNft.token_url.split('://')

  if(baseProtocol[0] !== 'bcdb') {
    res.status(400).json({
      message: 'INVALID BASE PROTOCOL'
    })
    return
  }

  if(consumableProtocol[0] !== 'ipfs') {
    res.status(400).json({
      message: 'INVALID CONSUMABLES PROTOCOL'
    })
    return
  }

  const baseAsset = await bigchaindb.fetchLatestTransaction(baseProtocol[1])

  if(!baseAsset.metadata.parts) {
    res.status(400).json({
      message: 'BASE NFT IS NOT SLOTABLE'
    })
  }

  // Check if the slot valid
  // TODO: Upgrade this weakling
  // 1. Check base
  const typeAttr = consumableNft.external_data.attributes.find(e => e.trait_type === 'base')
  if(!typeAttr || typeAttr.value !== baseAsset.metadata.base.type) {
    res.status(400).json({
      message: 'CONSUMABLE NFT DOESNT MATCH THE BASE NFT'
    })

    return
  }

  // 2. Check if the slot type match
  const slotAttr = consumableNft.external_data.attributes.find(e => e.trait_type === 'slot')
  if(baseAsset.metadata.parts[slotAttr.value].type !== 'slot') {
    res.status(400).json({
      message: 'CONSUMABLE NFT DOESNT MATCH THE BASE NFT'
    })

    return
  }

  // 3. all good - then merge
  baseAsset.metadata.parts[slotAttr.value]['src'] = consumableNft.external_data.attributes.find(e => e.trait_type === 'resource').value
  baseAsset.metadata.parts[slotAttr.value]['nft'] = {
    mechanic: "burned",
    type: "erc721",
    address: req.body.consumable_address,
    tokenId: req.body.consumable_token_id
  }

  try {
    await bigchaindb.append(baseProtocol[1], baseAsset.metadata)
    // burn consumable
    await this.burnConsumableNFT(nftslotabi, req.body.consumable_address, req.body.consumable_token_id)
  } catch(e) {
    res.status(400).json({
      message: e
    })

    return
  }
}

exports.burnConsumableNFT = async (abi, address, token_id) => {
  const contract = new web3.eth.Contract(abi, address)
  // add private key
  web3.eth.accounts.wallet.add(process.env.ETH_PRIVATE_KEY_2)
  contract.setProvider(web3.currentProvider)

  await contract.methods
    .burn(token_id)
    .send({
      from: process.env.ETH_PUBLIC_KEY_2,
      to: address,
      gas: parseInt(process.env.GAS_FEE) ?? 300000
    })
}