const axios = require('axios').default
const BigChainDB = require('bigchaindb-driver')
const conn = new BigChainDB.Connection(process.env.BCDB_API_PATH)

/**
 * Get the latest transaction of an asset
 */
exports.fetchLatestTransaction = async(assetId) => {
    try {
        var transaction_data = await conn.listTransactions(assetId)
        transaction_data = transaction_data[transaction_data.length - 1]

        return transaction_data
    } catch (error) {
        return
    }
},

/**
 * Create an asset
 */
exports.create = async ({ asset, metadata }) => {

    const txCreate = BigChainDB.Transaction.makeCreateTransaction(
        asset,
        metadata,
        [
            BigChainDB.Transaction.makeOutput(
                BigChainDB.Transaction.makeEd25519Condition(process.env.BCDB_PUBLIC_KEY),
            ),
        ],
        process.env.BCDB_PUBLIC_KEY,
    )

    const txSigned = BigChainDB.Transaction.signTransaction(txCreate, process.env.BCDB_PRIVATE_KEY)

    let assetCreated = await conn.postTransactionCommit(txSigned)
    
    return assetCreated ?? {}
},

/**
 * Append asset data
 * @param {*} param0 
 * @returns 
 */
exports.append = async (txCreatedID, metadata) => {
    try {
        let txCreated = await conn.getTransaction(txCreatedID)
        const updatedBuilding = BigChainDB.Transaction.makeTransferTransaction(
            [
                {
                    tx: txCreated,
                    output_index: 0,
                },
            ],
            [
                BigChainDB.Transaction.makeOutput(
                    BigChainDB.Transaction.makeEd25519Condition(process.env.BCDB_PUBLIC_KEY),
                ),
            ],
            metadata,
        )

        const signedTransfer = BigChainDB.Transaction.signTransaction(
            updatedBuilding,
            process.env.BCDB_PRIVATE_KEY,
        )

        let assetTransfered = await conn.postTransactionCommit(signedTransfer)


        if (!assetTransfered) return {}
        return assetTransfered
    } catch (error) {
        console.log(error)
    }
},

exports.fetchTransaction = async (assetId) => {
    try {

        const assetsModel = await Assets()

        var list = {}
        list = await axios.get(`${API_PATH}transactions/${assetId}`).catch(function (error) {
            if (error) {
                console.log("Error in axios")
            }
        })
        if (!list) {
            list = {}
        }

        if (Object.keys(list).length === 0) return

        return await list
    } catch (error) {
        res.status(400).json(error);
    }
},

exports.searchAssetsBdb = async (string_data) => {
    return await conn.searchAssets(string_data)
},

exports.listOutputsBdb = async (publicKey) => {
    return await conn.listOutputs(publicKey)
}