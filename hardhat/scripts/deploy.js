require("dotenv").config({ path: "../.env" }); // Load environment variables from one level up
const hre = require("hardhat");

async function main() {
    await hre.run("compile");

    const Arbitrage = await hre.ethers.getContractFactory("GasEfficientArbitrage");

    const uniswapRouterAddress = process.env.UNISWAP_ROUTER_ADDRESS;
    const daiAddress = process.env.DAI_ADDRESS;
    const wethAddress = process.env.WETH_ADDRESS;

    const arbitrage = await Arbitrage.deploy(uniswapRouterAddress, daiAddress, wethAddress);

    if (arbitrage && arbitrage.deployTransaction) {
        console.log("Deploying contract...");
        await arbitrage.deployTransaction.wait();
        console.log("Arbitrage contract deployed to:", arbitrage.address);
    } else {
        console.error("Contract deployment failed.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error in deployment script:", error);
        process.exit(1);
    });