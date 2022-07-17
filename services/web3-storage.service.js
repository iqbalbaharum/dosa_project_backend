
const { Web3Storage } = require('web3.storage')

exports.fetch = async(cid) => {
  const client = new Web3Storage({ token: process.env.WEB3_STORAGE_ACCESS_TOKEN })
  const res = await client.get(cid)
  return res
}