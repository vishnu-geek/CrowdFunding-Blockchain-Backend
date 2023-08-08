const{netwrok, network}= require("hardhat")
const{developmentchains,DECIMALS,INITIAL_ANSWER}=require("../helper-hh-config")
const {  networks} = require("../hardhat.config")

module.exports =async ({getNamedAccounts,deployments}) => {
    const{deploy ,log }=deployments
    const{deployer} =await getNamedAccounts()
    const chainId = network.config.chainId
    
if(chainId==31337){
    log("local net detected")
    await deploy("MockV3Aggregator",{
        contract:"MockV3Aggregator",
        from:deployer,
        log: true,
        args:[DECIMALS,INITIAL_ANSWER],

    })
    log("mocks deployed")
    log("mocks ended-----------------")
}

}
module.exports.tags=["all","vishnu"]