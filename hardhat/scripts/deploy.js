require("dotenv").config(); // Load environment variables from one level up
const { ethers } = require("hardhat");

async function main() {
    await hre.run("compile");

    if (!process.env.PRIVATE_KEY || !process.env.ALCHEMY_KEY){
        throw new Error("Missing PRIVATE_KEY or ALCHEMY_KEY in .env file");
    }

    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const Arbitrage = await ethers.getContractFactory("Arbitrage", wallet);

    // Sepolia addresses
    const UNISWAP_V2_ROUTER = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";
    const SUSHISWAP_V2_ROUTER = "0xeaBcE3E74EF41FB40024a21Cc2ee2F5dDc615791";
    const AAVE_V3_POOL_ADDRESSES_PROVIDER = "0x0496275d34753A48320CA58103d5220d394FF77F";

    console.log("Deploying Arbitrage contract...");
    const arbitrage = await Arbitrage.deploy(
        AAVE_V3_POOL_ADDRESSES_PROVIDER,
        UNISWAP_V2_ROUTER,
        SUSHISWAP_V2_ROUTER
    );

    await arbitrage.waitForDeployment();

    console.log("Arbitrage contract deployed at:", arbitrage.target);
    
    console.log("\nVerification command:");
    console.log(`npx hardhat verify --network sepolia ${arbitrage.target} ${AAVE_V3_POOL_ADDRESSES_PROVIDER} ${UNISWAP_V2_ROUTER} ${SUSHISWAP_V2_ROUTER}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error in deployment script:", error);
        process.exit(1);
    });