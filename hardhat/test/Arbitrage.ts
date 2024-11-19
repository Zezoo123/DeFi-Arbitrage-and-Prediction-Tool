import { Contract, Signer } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";

let router1: Contract;
let router2: Contract;
let mockWETH: Contract;
let mockDAI: Contract;
let owner: Signer;
let arbitrageur: Signer;

describe("Arbitrage Testing", function() {
    beforeEach(async function() {
        [owner, arbitrageur] = await ethers.getSigners();

        // Deploy Mock Tokens
        const MockWETHFactory = await ethers.getContractFactory("MockWETH");
        mockWETH = await MockWETHFactory.connect(owner).deploy();
        await mockWETH.waitForDeployment();

        const MockDAIFactory = await ethers.getContractFactory("MockDAI");
        mockDAI = await MockDAIFactory.connect(owner).deploy();
        await mockDAI.waitForDeployment();

        // Deploy Router 1 with exchange rate of 2
        const RouterFactory = await ethers.getContractFactory("MockUniswapRouter");
        router1 = await RouterFactory.connect(owner).deploy(mockWETH.address, mockDAI.address, 2);
        await router1.waitForDeployment();

        // Deploy Router 2 with exchange rate of 1
        router2 = await RouterFactory.connect(owner).deploy(mockWETH.address, mockDAI.address, 1);
        await router2.waitForDeployment();

        // Ensure addresses are not null
        expect(mockWETH.address).to.not.be.null;
        expect(mockDAI.address).to.not.be.null;
        expect(await router1.getAddress()).to.not.be.null;
        expect(await router2.getAddress()).to.not.be.null;
      
        // Fund the routers with tokens
        const router1Address = await router1.getAddress();
        const router2Address = await router2.getAddress();
      
        await mockDAI.connect(owner).transfer(router1Address, ethers.parseEther("10000"));
        await mockWETH.connect(owner).transfer(router1Address, ethers.parseEther("10000"));
      
        await mockDAI.connect(owner).transfer(router2Address, ethers.parseEther("10000"));
        await mockWETH.connect(owner).transfer(router2Address, ethers.parseEther("10000"));
    });

    it("should perform arbitrage between 2 routers", async function() {
        // Transfer WETH to arbitrageur
        await mockWETH.connect(owner).transfer(arbitrageur.address, ethers.parseEther("100"));

        // Approve routers to spend arbitrageur's WETH
        await mockWETH.connect(arbitrageur).approve(router1.address, ethers.parseEther("100"));
        await mockWETH.connect(arbitrageur).approve(router2.address, ethers.parseEther("100"));

        // Perform the first swap on router1 (WETH -> DAI)
        await router1.connect(arbitrageur).swapExactTokensForTokens(
            ethers.parseEther("50"), // amountIn
            ethers.parseEther("50"), // amountOutMin (set low to ensure swap)
            [mockWETH.address, mockDAI.address],
            arbitrageur.address,
            BigInt(Math.floor(Date.now() / 1000)) + 60n * 10n // deadline
        );

        // Check DAI balance after first swap
        const daiBalanceAfterSwap1 = await mockDAI.balanceOf(arbitrageur.address);
        expect(daiBalanceAfterSwap1).to.be.greaterThan(ethers.parseEther("0"));

        // Approve router2 to spend arbitrageur's DAI
        await mockDAI.connect(arbitrageur).approve(router2.address, daiBalanceAfterSwap1);

        // Perform the second swap on router2 (DAI -> WETH)
        await router2.connect(arbitrageur).swapExactTokensForTokens(
            daiBalanceAfterSwap1,
            ethers.parseEther("25"), // amountOutMin (set low to ensure swap)
            [mockDAI.address, mockWETH.address],
            arbitrageur.address,
            BigInt(Math.floor(Date.now() / 1000)) + 60n * 10n // deadline
        );

        const wethBalanceAfterSwap2 = (await mockWETH.balanceOf(arbitrageur.address)).toBigInt();
        const initialWethBalance = ethers.parseEther("50");
        const profit = wethBalanceAfterSwap2 - initialWethBalance;
        
        console.log(`Profit from arbitrage: ${ethers.formatEther(profit)} WETH`);

        expect(profit).to.be.greaterThan(ethers.parseEther("0"));
    });
});