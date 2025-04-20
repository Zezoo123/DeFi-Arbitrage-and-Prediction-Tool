require("dotenv").config();
const { ethers } = require("hardhat");
const SEPOLIA_TOKENS = require('./tokens');

// Aave V3 Pool Address Provider on Sepolia
const AAVE_POOL_ADDRESS_PROVIDER = "0x0496275d34753A48320CA58103d5220d394FF77F";

async function main() {
    try {
        console.log("Starting flash loan arbitrage...");
        
        // Connect to the network
        const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        // Deploy the FlashLoanArbitrage contract
        const FlashLoanArbitrage = await ethers.getContractFactory("FlashLoanArbitrage");
        const flashLoanArbitrage = await FlashLoanArbitrage.deploy(AAVE_POOL_ADDRESS_PROVIDER);
        await flashLoanArbitrage.waitForDeployment();
        
        console.log("FlashLoanArbitrage deployed to:", await flashLoanArbitrage.getAddress());

        // Function to encode parameters for flash loan
        function encodeFlashLoanParams(tokenA, tokenB, path1, path2) {
            return ethers.AbiCoder.defaultAbiCoder().encode(
                ["address", "address", "address[]", "address[]"],
                [tokenA, tokenB, path1, path2]
            );
        }

        // Function to check token balance
        async function checkBalance(tokenAddress) {
            const token = new ethers.Contract(
                tokenAddress,
                ["function balanceOf(address) view returns (uint256)"],
                provider
            );
            const balance = await token.balanceOf(await flashLoanArbitrage.getAddress());
            return balance;
        }

        // Example arbitrage paths
        const arbitragePaths = [
            {
                name: "WETH -> USDC -> WETH",
                asset: SEPOLIA_TOKENS.WETH,
                amount: ethers.parseEther("1"), // 1 WETH
                path1: [SEPOLIA_TOKENS.WETH, SEPOLIA_TOKENS.USDC],
                path2: [SEPOLIA_TOKENS.USDC, SEPOLIA_TOKENS.WETH]
            },
            {
                name: "WETH -> USDT -> WETH",
                asset: SEPOLIA_TOKENS.WETH,
                amount: ethers.parseEther("1"), // 1 WETH
                path1: [SEPOLIA_TOKENS.WETH, SEPOLIA_TOKENS.USDT],
                path2: [SEPOLIA_TOKENS.USDT, SEPOLIA_TOKENS.WETH]
            }
        ];

        // Execute flash loan arbitrage for each path
        for (const path of arbitragePaths) {
            console.log(`\nExecuting arbitrage for ${path.name}`);
            console.log(`Amount: ${ethers.formatEther(path.amount)} ${path.name.split(" -> ")[0]}`);

            try {
                // Encode parameters for flash loan
                const params = encodeFlashLoanParams(
                    path.asset,
                    path.asset, // Same asset for start and end
                    path.path1,
                    path.path2
                );

                // Execute flash loan
                const tx = await flashLoanArbitrage.executeFlashLoan(
                    path.asset,
                    path.amount,
                    params
                );

                console.log("Transaction sent:", tx.hash);
                await tx.wait();
                console.log("Transaction confirmed!");

                // Check final balance
                const finalBalance = await checkBalance(path.asset);
                console.log(`Final balance: ${ethers.formatEther(finalBalance)} ${path.name.split(" -> ")[0]}`);

                // Wait between trades
                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (error) {
                console.error(`Error executing arbitrage for ${path.name}:`, error.message);
            }
        }

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