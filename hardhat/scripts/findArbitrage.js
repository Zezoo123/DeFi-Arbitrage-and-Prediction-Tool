require("dotenv").config();
const { ethers } = require("hardhat");
const SEPOLIA_TOKENS = require('./tokens');

// Uniswap V2 Router ABI (minimal version for price checking)
const ROUTER_ABI = [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
    "function getAmountsIn(uint amountOut, address[] memory path) public view returns (uint[] memory amounts)",
    "function WETH() external pure returns (address)"
];

// Sepolia Router addresses
const ROUTERS = {
    UNISWAP: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008",
    SUSHISWAP: "0xeaBcE3E74EF41FB40024a21Cc2ee2F5dDc615791"
};

async function main() {
    try {
        console.log("Starting arbitrage opportunity finder...");
        
        // Connect to the network
        const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
        
        // Get router instances
        const uniswapRouter = new ethers.Contract(
            ROUTERS.UNISWAP,
            ROUTER_ABI,
            provider
        );
        
        const sushiswapRouter = new ethers.Contract(
            ROUTERS.SUSHISWAP,
            ROUTER_ABI,
            provider
        );

        // Function to get price from a DEX
        async function getPrice(router, tokenIn, tokenOut, amountIn) {
            try {
                // Ensure we're using the correct WETH address for each DEX
                const dexWeth = await router.WETH();
                const path = [tokenIn, tokenOut];
                
                // Log the query details for debugging
                console.log(`Querying ${router.address} for path: ${path.map(addr => getTokenSymbol(addr)).join(' -> ')}`);
                
                const amounts = await router.getAmountsOut(amountIn, path);
                return amounts[1];
            } catch (error) {
                console.error(`Error getting price from ${router.address}:`, error.message);
                if (error.data) {
                    console.error("Error data:", error.data);
                }
                return null;
            }
        }

        // Function to calculate potential profit
        function calculateProfit(amountIn, amountOut1, amountOut2, gasPrice) {
            const gasCost = gasPrice * 300000n; // Estimated gas cost for the transaction
            const profit = amountOut2 - amountIn - gasCost;
            return profit;
        }

        // Function to get token symbol from address
        function getTokenSymbol(address) {
            for (const [symbol, tokenAddress] of Object.entries(SEPOLIA_TOKENS)) {
                if (tokenAddress.toLowerCase() === address.toLowerCase()) {
                    return symbol;
                }
            }
            return address.slice(0, 6) + '...' + address.slice(-4);
        }

        // Function to check arbitrage opportunity
        async function checkArbitrage(tokenA, tokenB, amountIn) {
            const tokenASymbol = getTokenSymbol(tokenA);
            const tokenBSymbol = getTokenSymbol(tokenB);
            
            console.log(`\nChecking arbitrage for ${tokenASymbol} -> ${tokenBSymbol}`);
            console.log(`Amount: ${ethers.formatEther(amountIn)} ${tokenASymbol}`);

            // Get prices from both DEXes
            const price1 = await getPrice(uniswapRouter, tokenA, tokenB, amountIn);
            if (!price1) {
                console.log("Could not get price from Uniswap");
                return;
            }

            const price2 = await getPrice(sushiswapRouter, tokenB, tokenA, price1);
            if (!price2) {
                console.log("Could not get price from SushiSwap");
                return;
            }

            // Get current gas price
            const gasPrice = await provider.getFeeData();
            const currentGasPrice = gasPrice.gasPrice;

            // Calculate potential profit
            const profit = calculateProfit(amountIn, price1, price2, currentGasPrice);

            console.log("\nArbitrage Analysis:");
            console.log(`Uniswap Price: ${ethers.formatEther(price1)} ${tokenBSymbol}`);
            console.log(`SushiSwap Price: ${ethers.formatEther(price2)} ${tokenASymbol}`);
            console.log(`Gas Price: ${ethers.formatUnits(currentGasPrice, "gwei")} gwei`);
            console.log(`Estimated Gas Cost: ${ethers.formatEther(currentGasPrice * 300000n)} ETH`);
            console.log(`Potential Profit: ${ethers.formatEther(profit)} ETH`);

            if (profit > 0n) {
                console.log("\n✅ ARBITRAGE OPPORTUNITY FOUND!");
                console.log(`Profit: ${ethers.formatEther(profit)} ETH`);
                console.log(`Profit in USD: $${(Number(ethers.formatEther(profit)) * 2000).toFixed(2)} (assuming ETH = $2000)`);
            } else {
                console.log("\n❌ No profitable arbitrage opportunity found");
            }
        }

        // Monitor arbitrage opportunities
        console.log("\nStarting arbitrage monitoring...");
        console.log("Press Ctrl+C to stop");

        // Token pairs to monitor (starting with smaller set for testing)
        const pairs = [
            // WETH pairs
            { tokenA: SEPOLIA_TOKENS.WETH, tokenB: SEPOLIA_TOKENS.USDC },
            { tokenA: SEPOLIA_TOKENS.WETH, tokenB: SEPOLIA_TOKENS.USDT },
            
            // Stablecoin pairs
            { tokenA: SEPOLIA_TOKENS.DAI, tokenB: SEPOLIA_TOKENS.USDC }
        ];

        // Test amounts to check (in ETH)
        const testAmounts = [
            ethers.parseEther("0.1"),
            ethers.parseEther("0.5")
        ];

        // Check each pair with different amounts
        for (const pair of pairs) {
            for (const amount of testAmounts) {
                await checkArbitrage(pair.tokenA, pair.tokenB, amount);
                // Wait a bit between checks to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 5000));
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