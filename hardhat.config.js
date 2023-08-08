require("@nomicfoundation/hardhat-toolbox")
//require("@nomicfoundation/hardhat-verify")
require("dotenv").config()
//require("./tasks/bno")
require("hardhat-gas-reporter")
require("@nomicfoundation/hardhat-chai-matchers")
//require("@nomiclabs/hardhat-waffle")
//require("@nomiclabs/hardhat-etherscan")
require("solidity-coverage")
require('hardhat-deploy')

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL 
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
module.exports = {
   // solidity: "0.8.7",
    solidity:{
        compilers:
            [{version:"0.8.7"},{version:"0.6.6"},{version:"0.8.8"}],
        
    },
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockconfirmation:6,
        },
       localhost: {
       url:" http://127.0.0.1:8545/",
       chainId:31337,
        
    },
    
},

    etherscan: {
        apiKey:{ 
            sepolia:process.env.ETHERSCAN_API_KEY,
        }
    },
    gasReporter:{
        enabled:true,
        outputFile: "gas-reporter.txt",
        noColors:true,
        currency:"USD",
       coinmarketcap: COINMARKETCAP_API_KEY,
        token:"ETH",
    },
    namedAccounts :{
      deployer:{
        default:0,
      },
       user:{
        default:1,
       },
    },
  }