require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');
const SEPOLIA_TOKENS = require('./tokens');

// Sepolia token addresses
const TOKENS = {
    WETH: "0x097D90c9d3E2B5Ca5D5c5c5c5c5c5c5c5c5c5c5c5", // Replace with actual WETH address
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    USDC: "0xA0b86991c6218B36c1d19D4a2e9Eb0cE3606EB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
};

// Sepolia testnet addresses
const SEPOLIA_TOKENS = {
    WETH: "0x097D90c9d3E2B5Ca5D5c5c5c5c5c5c5c5c5c5c5c5", // Replace with actual WETH address
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    USDC: "0xA0b86991c6218B36c1d19D4a2e9Eb0cE3606EB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
};

async function getLatestDeployment() {
    const deploymentsPath = path.join(__dirname, '..', 'deployments.json');
    if (!fs.existsSync(deploymentsPath)) {
        throw new Error("No deployments found");
    }
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath));
    return deployments.deployments[deployments.deployments.length - 1];
}

async function main() {
    try {
        console.log("Starting interaction script...");
        
        // Get the latest deployment
        const deployment = await getLatestDeployment();
        console.log(`Using contract at: ${deployment.contractAddress}`);

        // Connect to the network
        const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        // Get contract instance
        const Arbitrage = await ethers.getContractFactory("Arbitrage", wallet);
        const arbitrage = Arbitrage.attach(deployment.contractAddress);

        // Check contract owner
        const owner = await arbitrage.owner();
        console.log(`Contract owner: ${owner}`);
        console.log(`Current wallet: ${wallet.address}`);

        // Function to check token balance
        async function checkBalance(tokenAddress) {
            try {
                const token = await ethers.getContractAt("IERC20", tokenAddress, wallet);
                const balance = await token.balanceOf(deployment.contractAddress);
                return ethers.formatEther(balance);
            } catch (error) {
                console.error(`Error checking balance for token ${tokenAddress}:`, error.message);
                return "Error";
            }
        }

        // Function to execute arbitrage
        async function executeArbitrage(tokenA, tokenB, amount) {
            console.log(`\nExecuting arbitrage...`);
            console.log(`Token A: ${tokenA}`);
            console.log(`Token B: ${tokenB}`);
            console.log(`Amount: ${ethers.formatEther(amount)} ETH`);

            try {
                const tx = await arbitrage.startArbitrage(
                    tokenA,
                    amount,
                    tokenB,
                    ethers.parseEther("0.01") // Minimum profit threshold
                );
                console.log("Transaction sent:", tx.hash);
                
                const receipt = await tx.wait();
                console.log("Transaction confirmed!");
                console.log("Gas used:", receipt.gasUsed.toString());
                
                // Get the ArbitrageExecuted event
                const event = receipt.logs.find(log => 
                    log.topics[0] === ethers.id("ArbitrageExecuted(address,address,uint256,uint256,uint256)")
                );
                
                if (event) {
                    const [tokenA, tokenB, amountIn, amountOut, profit] = ethers.AbiCoder.defaultAbiCoder().decode(
                        ["address", "address", "uint256", "uint256", "uint256"],
                        event.data
                    );
                    console.log("\nArbitrage Results:");
                    console.log(`Amount In: ${ethers.formatEther(amountIn)} ETH`);
                    console.log(`Amount Out: ${ethers.formatEther(amountOut)} ETH`);
                    console.log(`Profit: ${ethers.formatEther(profit)} ETH`);
                }
            } catch (error) {
                console.error("Arbitrage execution failed:", error.message);
            }
        }

        // Example usage
        console.log("\nChecking contract balances...");
        for (const [symbol, address] of Object.entries(SEPOLIA_TOKENS)) {
            const balance = await checkBalance(address);
            console.log(`${symbol} Balance: ${balance}`);
        }

        // Example arbitrage execution
        // Uncomment and modify these lines to execute arbitrage
        /*
        await executeArbitrage(
            SEPOLIA_TOKENS.WETH,
            SEPOLIA_TOKENS.DAI,
            ethers.parseEther("0.1") // 0.1 ETH
        );
        */

    } catch (error) {
        console.error("Error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    }); 