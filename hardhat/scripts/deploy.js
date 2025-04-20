require("dotenv").config(); // Load environment variables from one level up
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        console.log("Starting deployment process...");
        
        await hre.run("compile");

        if (!process.env.PRIVATE_KEY || !process.env.ALCHEMY_KEY) {
            throw new Error("Missing PRIVATE_KEY or ALCHEMY_KEY in .env file");
        }

        console.log("Connecting to network...");
        const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
        
        // Check network connection
        try {
            await provider.getBlockNumber();
            console.log("Successfully connected to Sepolia");
        } catch (error) {
            console.error("Failed to connect to network:", error.message);
            return;
        }

        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        // Check wallet balance
        const balance = await provider.getBalance(wallet.address);
        console.log(`Wallet balance: ${ethers.formatEther(balance)} ETH`);
        
        if (balance === 0n) {
            throw new Error("Wallet has no ETH for deployment");
        }

        const Arbitrage = await ethers.getContractFactory("Arbitrage", wallet);

        // Sepolia addresses
        const UNISWAP_V2_ROUTER = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";
        const SUSHISWAP_V2_ROUTER = "0xeaBcE3E74EF41FB40024a21Cc2ee2F5dDc615791";
        const AAVE_V3_POOL_ADDRESSES_PROVIDER = "0x0496275d34753A48320CA58103d5220d394FF77F";

        console.log("Deploying Arbitrage contract...");
        
        // Get current gas price
        const gasPrice = await provider.getFeeData();
        console.log(`Current gas price: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} gwei`);

        const arbitrage = await Arbitrage.deploy(
            AAVE_V3_POOL_ADDRESSES_PROVIDER,
            UNISWAP_V2_ROUTER,
            SUSHISWAP_V2_ROUTER,
            {
                gasLimit: 3000000,
                maxFeePerGas: gasPrice.maxFeePerGas * 2n,
                maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas * 2n
            }
        );

        console.log("Waiting for deployment transaction...");
        const deploymentTx = await arbitrage.waitForDeployment();
        const receipt = await deploymentTx.deploymentTransaction().wait();

        console.log("Arbitrage contract deployed at:", arbitrage.target);
        
        // Save deployment information
        const deploymentsPath = path.join(__dirname, '..', 'deployments.json');
        let deployments = { deployments: [] };
        
        if (fs.existsSync(deploymentsPath)) {
            deployments = JSON.parse(fs.readFileSync(deploymentsPath));
        }

        deployments.deployments.push({
            timestamp: new Date().toISOString(),
            network: "sepolia",
            contractAddress: arbitrage.target,
            transactionHash: receipt.hash,
            router1: UNISWAP_V2_ROUTER,
            router2: SUSHISWAP_V2_ROUTER,
            aaveProvider: AAVE_V3_POOL_ADDRESSES_PROVIDER
        });

        fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 4));
        console.log("\nDeployment information saved to deployments.json");
        
        console.log("\nVerification command:");
        console.log(`npx hardhat verify --network sepolia ${arbitrage.target} ${AAVE_V3_POOL_ADDRESSES_PROVIDER} ${UNISWAP_V2_ROUTER} ${SUSHISWAP_V2_ROUTER}`);
        
    } catch (error) {
        console.error("\nDeployment failed!");
        console.error("Error details:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error in deployment script:", error);
        process.exit(1);
    });