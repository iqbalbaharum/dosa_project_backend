const axios = require('axios')

exports.getCovalentHq = () => {
  return axios.create({
    baseURL: process.env.COVALENTHQ_URL,
    timeout: 5000
  })
}

exports.getNftMetadata = (chain_id, address, token_id) => {
  const request = this.getCovalentHq()
  return request.get(`/${chain_id}/tokens/${address}/nft_metadata/${token_id}/?format=json&key=${process.env.COVALENTHQ_API_KEY}`)
}