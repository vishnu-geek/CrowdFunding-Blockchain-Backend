//this is on testnet/mainnet
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentchain } = require("../../helper-hh-config")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { assert } = require("chai")
developmentchain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          //anonymous function
          let fundMe
          let deployer
          const sendValue = ethers.parseEther("1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer //connection of accounts
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it ("allows people to fund and withdraw",async function(){
            await fundMe.fund({value:sendValue})
            await fundMe.withdraw( )
            const endingBalance = await fundMe.provider.getBalance(fundMe.address)
            assert.equal(endingBalance.toString(),"0")
          })
      })
