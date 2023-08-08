//  function deployFunc(){
//     console.log("hi")
//  }
// const{getNamedAccounts,deployments}=hre(same thing)
// hre.getNamedAccounts
// hre.deployments(same thing)

require("dotenv").config()
const { getNamedAccounts, deployments } = require("hardhat")
const { networkConfig, developmentchain } = require("../helper-hh-config")
const { network } = require("hardhat")
const { isAddress } = require("ethers")
const { verify } = require("../utils/verify")
const { networks } = require("../hardhat.config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]  //this works for different chain ids mentioned in our harhdaht config.js

    let ethUsdPriceFeedAddress
    if (chainId==31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator") //getting address
        ethUsdPriceFeedAddress = ethUsdAggregator.address //storing the address
    } else {
        //means we are not on any netwrok
       ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args:[ethUsdPriceFeedAddress] , //put price feed address
        //this makes our script robust so that we can flip network wehther ir is mainnet testnet local netwrok or anything
        log: true,
        waitConfirmations: network.config.blockconfirmation || 1, // this made our deployment to wait for 6 blocks or by default 1 this is done so that etherscan can get suff time to index
    })
    log(`FundMe deployed at ${fundMe.address}`)
    if (
       !developmentchain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress] )
    }
    log("------------------------------")
}
module.exports.tags = ["all", "fundme"]
