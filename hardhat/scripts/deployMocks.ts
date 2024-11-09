import { ethers } from "hardhat";

async function main(){
    const MockDAI = await ethers.getContractFactory("MockDAI");
    const mockDAI = await MockDAI.deploy();
    await mockDAI.deployed();
    console.log("Mock DAI deployed to:", mockDAI.address);

    const MockWETH = await ethers.getContractFactory("MockWETH");
    const mockWETH = await MockWETH.deploy();
    await mockWETH.deployed();
    console.log("Mock WETH deployed to:", mockWETH.address);
    
    const MockUniswapRouter = await ethers.getContractFactory("MockUniswapRouter");
    const mockUniswapRouter = await MockUniswapRouter.deploy();
    await mockUniswapRouter.deployed();
    console.log("Mock Uniswap Router deployed to:", mockUniswapRouter.address);
}