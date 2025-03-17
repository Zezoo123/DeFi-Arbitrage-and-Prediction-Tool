const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    const contractAddress = "0x772710E1bFF45C779a57FEf10cD26aC567C09296";
    const arbitrage = await ethers.getContractAt("Arbitrage", contractAddress);
    
    const tokenA = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
    const tokenB = "0x68194a729C2450ad26072b3D33ADaCbcef39D574";
    const amount = ethers.parseUnits("1", 18);

    console.log(`Executing arbitrage with ${amount} of Token A...`);

    const tokenAContract = await ethers.getContractAt("IERC20", tokenA);
    await tokenAContract.approve(contractAddress, amount);
    console.log("Token A approved for spending by the contract.");

    const tx = await arbitrage.executeArbitrage(tokenA, tokenB, amount);
    await tx.wait();

    console.log("Arbitrage executed successfully!");

}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});