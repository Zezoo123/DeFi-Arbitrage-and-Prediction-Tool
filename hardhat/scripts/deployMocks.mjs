import pkg from 'hardhat';
const { run, ethers } = pkg;


async function main() {
    await run("compile");
    // Deploy Mock DAI
    const MockDAI = await ethers.getContractFactory("MockDAI");
    const mockDAI = MockDAI.deploy();
    await mockDAI.deployed();
    console.log("Mock DAI deployed to:", mockDAI.address);

    // Deploy Mock WETH
    const MockWETH = await ethers.getContractFactory("MockWETH");
    const mockWETH = await MockWETH.deploy();
    await mockWETH.deployed();
    console.log("Mock WETH deployed to:", mockWETH.address);

    // Deploy Mock Uniswap Router
    const MockUniswapRouter = await ethers.getContractFactory("MockUniswapRouter");
    const mockUniswapRouter = await MockUniswapRouter.deploy();
    await mockUniswapRouter.deployed();
    console.log("Mock Uniswap Router deployed to:", mockUniswapRouter.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error in deployment script:", error);
        process.exit(1);
    });
