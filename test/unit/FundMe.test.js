const { deployments, ethers, getNamedAccounts,network } = require("hardhat")
const { assert, expect } = require("chai")
const { Contract } = require("ethers")
const { developmentchain } = require("../../helper-hh-config")
//const { deployer } = getNamedAccounts()
!developmentchain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          //anonymous function
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.parseEther("1")

          beforeEach(async function () {
              //this is created to first deploy our contract
              //using hardhat funme deploy
              deployer = (await getNamedAccounts()).deployer //connection of accounts
              await deployments.fixture(["all"]) // it helps to deploy all contract and scripts in one go on local host
              fundMe = await ethers.getContract("FundMe", deployer) //get most recent deployed contract wrapped with hardhar ethers
              mockV3Aggregator = await ethers.getContract(
                  //deployer gets connected by this method
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.target)
              })
          })
          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("updates the amount funded data structures", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  ) //get address from contract each funder mapping
                  assert.equal(response.toString(), sendValue.toString()) //amount funded by that account
              })
              it("adds getFunder to array", async function () {
                  await fundMe.fund({ value: sendValue }) //check from contract
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })
          describe("withdraw", async function () {
              beforeEach(async function () {
                  //this is declared so that our transaction get some fund before we run test in withdraw
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraw ETH from single funder", async function () {
                  //sequence
                  //arrange
                  const startingfundbal = await ethers.provider.getBalance(
                      fundMe.target
                  ) //to get the starting balance of the funder
                  const startingdeployerbal = await ethers.provider.getBalance(
                      deployer
                  ) // starting balance of deployer
                  //Act
                  const transactionresponse = await fundMe.withdraw()
                  const transactionRecipt = await transactionresponse.wait(1) // from here we will find out the gas cost
                  const { gasUsed, gasPrice } = transactionRecipt //can pull out objecct with the help of other object
                  const gasCost = gasUsed * gasPrice
                  const endingfunmebal = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingdeployerbal = await ethers.provider.getBalance(
                      deployer
                  )

                  //assert
                  assert.equal(endingfunmebal, 0) //because we withdrew all balance
                  assert.equal(
                      (startingfundbal + startingdeployerbal).toString(),
                      (endingdeployerbal + gasCost).toString()
                  ) //logic adding gas cost too

                  //now we will find the gas cost we are using by transaction response
              })

              it("withdraw ETH from single funder", async function () {
                  //sequence
                  //arrange
                  const startingfundbal = await ethers.provider.getBalance(
                      fundMe.target
                  ) //to get the starting balance of the funder
                  const startingdeployerbal = await ethers.provider.getBalance(
                      deployer
                  ) // starting balance of deployer
                  //Act
                  const transactionresponse = await fundMe.cheaperwith()
                  const transactionRecipt = await transactionresponse.wait(1) // from here we will find out the gas cost
                  const { gasUsed, gasPrice } = transactionRecipt //can pull out objecct with the help of other object
                  const gasCost = gasUsed * gasPrice
                  const endingfunmebal = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingdeployerbal = await ethers.provider.getBalance(
                      deployer
                  )

                  //assert
                  assert.equal(endingfunmebal, 0) //because we withdrew all balance
                  assert.equal(
                      (startingfundbal + startingdeployerbal).toString(),
                      (endingdeployerbal + gasCost).toString()
                  ) //logic adding gas cost too

                  //now we will find the gas cost we are using by transaction response
              })

              it("allows us to withdraw with multiple getFunder", async function () {
                  //arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeconnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeconnectedContract.fund({ value: sendValue })
                  }
                  const startingfundbal = await ethers.provider.getBalance(
                      fundMe.target
                  ) //to get the starting balance of the funder
                  const startingdeployerbal = await ethers.provider.getBalance(
                      deployer
                  ) // starting balance of deployer

                  //ACT
                  const transactionresponse = await fundMe.withdraw()
                  const transactionRecipt = await transactionresponse.wait(1) // from here we will find out the gas cost
                  const { gasUsed, gasPrice } = transactionRecipt //can pull out objecct with the help of other object
                  const gasCost = gasUsed * gasPrice

                  //assert

                  const endingfunmebal = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingdeployerbal = await ethers.provider.getBalance(
                      deployer
                  )

                  //assert
                  assert.equal(endingfunmebal, 0) //because we withdrew all balance
                  assert.equal(
                      (startingfundbal + startingdeployerbal).toString(),
                      (endingdeployerbal + gasCost).toString()
                  ) //logic adding gas cost too

                  //MAKE SURE THAT THE getFunder ARE RESET PROPERLY
                  await expect(fundMe.getFunder(0)).to.be.reverted //
                  //lopp to make sure all are zero
                  for (i = 0; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  const vishnu = fundMe.fundMeConnectedContract
                  try {
                      await expect(
                          fundMeConnectedContract.withdraw()
                      ).to.be.revertedWithCustomError(
                          fundMe,
                          "FundMe__NotOwner()"
                      )
                  } catch (e) {}
              })
              it("cheaper withdraw testing....", async function () {
                  //arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeconnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeconnectedContract.fund({ value: sendValue })
                  }
                  const startingfundbal = await ethers.provider.getBalance(
                      fundMe.target
                  ) //to get the starting balance of the funder
                  const startingdeployerbal = await ethers.provider.getBalance(
                      deployer
                  ) // starting balance of deployer

                  //ACT
                  const transactionresponse = await fundMe.cheaperwith()
                  const transactionRecipt = await transactionresponse.wait(1) // from here we will find out the gas cost
                  const { gasUsed, gasPrice } = transactionRecipt //can pull out objecct with the help of other object
                  const gasCost = gasUsed * gasPrice

                  //assert

                  const endingfunmebal = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingdeployerbal = await ethers.provider.getBalance(
                      deployer
                  )

                  //assert
                  assert.equal(endingfunmebal, 0) //because we withdrew all balance
                  assert.equal(
                      (startingfundbal + startingdeployerbal).toString(),
                      (endingdeployerbal + gasCost).toString()
                  ) //logic adding gas cost too

                  //MAKE SURE THAT THE getFunder ARE RESET PROPERLY
                  await expect(fundMe.getFunder(0)).to.be.reverted //
                  //lopp to make sure all are zero
                  for (i = 0; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
