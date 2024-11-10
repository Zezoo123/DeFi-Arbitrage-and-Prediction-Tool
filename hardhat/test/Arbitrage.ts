import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";

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
        router1 = await RouterFactory.connect(owner).deploy(
        await mockWETH.getAddress(),
        await mockDAI.getAddress(),
        2 // exchange rate
        );
        await router1.waitForDeployment();

        // Deploy Router 2 with exchange rate of 3 (price difference)
        router2 = await RouterFactory.connect(owner).deploy(
        await mockWETH.getAddress(),
        await mockDAI.getAddress(),
        3 // exchange rate
        );
        await router2.waitForDeployment();

        // Fund the routers with tokens
        const router1Address = await router1.getAddress();
        const router2Address = await router2.getAddress();

        await mockDAI.connect(owner).transfer(router1Address, ethers.parseEther("10000"));
        await mockWETH.connect(owner).transfer(router1Address, ethers.parseEther("10000"));

        await mockDAI.connect(owner).transfer(router2Address, ethers.parseEther("10000"));
        await mockWETH.connect(owner).transfer(router2Address, ethers.parseEther("10000"));

        // Fund the arbitrageur with tokens
        await mockDAI.connect(owner).transfer(arbitrageur.address, ethers.parseEther("1000"));
    });

    it("should perform arbitrage between 2 routers", async function() {
        // Arbitrage steps:
        // 1. Swap DAI for WETH on Router1 (lower rate)
        // 2. Swap WETH back to DAI on Router2 (higher rate)
        // 3. End up with more DAI than started with
        
        const daiAmountIn = ethers.parseEther("100")

        // Step 1: Approve Router1 and swap DAI for WETH
        await mockDAI.connect(arbitrageur).approve(await router1.getAddress(), daiAmountIn);
        await router1.connect(arbitrageur).swapExactTokensForTokens(
        daiAmountIn,
        ethers.parseEther("0"),
        [await mockDAI.getAddress(), await mockWETH.getAddress()],
        arbitrageur.address,
        BigInt(Math.floor(Date.now() / 1000)) + 60n * 10n
        );

        // Check WETH balance after first swap
        const wethBalanceAfterSwap1 = await mockWETH.balanceOf(arbitrageur.address);
        expect(wethBalanceAfterSwap1).to.equal(daiAmountIn * 2n); // exchange rate of 2
        
        // Step 2: Approve Router2 and swap WETH back to DAI
        await mockWETH.connect(arbitrageur).approve(await router2.getAddress(), wethBalanceAfterSwap1);

        await router2.connect(arbitrageur).swapExactTokensForTokens(
        wethBalanceAfterSwap1,
        ethers.parseEther("0"),
        [await mockWETH.getAddress(), await mockDAI.getAddress()],
        arbitrageur.address,
        BigInt(Math.floor(Date.now() / 1000)) + 60n * 10n
        );

        // Check DAI balance after second swap
        const daiBalanceAfterSwap2 = await mockDAI.balanceOf(arbitrageur.address);

        // Calculate profit
        const profit = daiBalanceAfterSwap2 - ethers.parseEther("1000");

        console.log(`Profit from arbitrage: ${ethers.formatEther(profit)} DAI`);

        expect(profit).to.be.greaterThan(0n);
    });
});