const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("funding contract....")
    const transactionresponse = await fundMe.fund({
        value: ethers.parseEther("1"),
    })
    await transactionresponse.wait(1)
    console.log("funded........")
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
