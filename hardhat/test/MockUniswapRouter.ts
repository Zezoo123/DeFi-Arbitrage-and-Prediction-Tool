import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";

let mockUniswapRouter: Contract;
let mockWETH: Contract;
let mockDAI: Contract;
let owner: Signer;
let addr1: Signer;
let addr2: Signer;
describe("MockUniswapRouter Contract", function () {

  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy MockWETH
    const MockWETHFactory = await ethers.getContractFactory("MockWETH");
    mockWETH = await MockWETHFactory.connect(owner).deploy();
    await mockWETH.waitForDeployment();

    // Deploy MockDAI
    const MockDAIFactory = await ethers.getContractFactory("MockDAI");
    mockDAI = await MockDAIFactory.connect(owner).deploy();
    await mockDAI.waitForDeployment();

    // Get contract addresses
    const mockWETHAddress = await mockWETH.getAddress();
    const mockDAIAddress = await mockDAI.getAddress();

    // Deploy MockUniswapRouter
    const MockUniswapRouterFactory = await ethers.getContractFactory("MockUniswapRouter");
    mockUniswapRouter = await MockUniswapRouterFactory.connect(owner).deploy(mockWETHAddress, mockDAIAddress, 2);
    await mockUniswapRouter.waitForDeployment();

    // Fund the router with tokens
    await mockWETH.connect(owner).transfer(await mockUniswapRouter.getAddress(), ethers.parseEther("10000"));
    await mockDAI.connect(owner).transfer(await mockUniswapRouter.getAddress(), ethers.parseEther("10000"));
  });
  
  it("should deploy correctly", async function () {
    let mockUniswapRouterAddress = await mockUniswapRouter.getAddress()
    expect(mockUniswapRouterAddress).to.be.properAddress;
  });

  it("should swap DAI for WETH correctly", async function () {
    const amount = ethers.parseEther("1000");

    // Owner transfers DAI to addr1
    await mockDAI.connect(owner).transfer(addr1.address, amount);
    
    // addr1 approves the router
    await mockDAI.connect(addr1).approve(await mockUniswapRouter.getAddress(), amount);
    
    // Perform the swap
    await mockUniswapRouter.connect(addr1).swapExactTokensForTokens(
      ethers.parseEther("100"),
      ethers.parseEther("0"),
      [await mockDAI.getAddress(), await mockWETH.getAddress()],
      addr1.address,
      BigInt(Math.floor(Date.now() / 1000)) + 60n * 10n
    );
  });

  it("should revert if allowance is insufficient for swap", async function () {
    const amount = ethers.parseEther("1000");

    // Owner transfers DAI to addr1
    await mockDAI.connect(owner).transfer(addr1.address, amount);

    // No approval given to the router

    await expect(
      mockUniswapRouter.connect(addr1).swapExactTokensForTokens(
        ethers.parseEther("100"),
        ethers.parseEther("0"),
        [await mockDAI.getAddress(), await mockWETH.getAddress()],
        addr1.address,
        BigInt(Math.floor(Date.now() / 1000)) + 60n * 10n
      )
    ).to.be.reverted;
  });

  it("should revert if output amount is below minimum specified", async function () {
    // Owner transfers WETH to addr1
    const amount = ethers.parseEther("100");

    await mockWETH.connect(owner).transfer(addr1.address, amount);

    // addr1 approves the router
    await mockWETH.connect(addr1).approve(await mockUniswapRouter.getAddress(), amount);

    // Perform the swap
    await expect(
        mockUniswapRouter.connect(addr1).swapExactTokensForTokens(
        ethers.parseEther("50"),
        ethers.parseEther("100"),
        [await mockWETH.getAddress(), await mockDAI.getAddress()],
        addr1.address,
        BigInt(Math.floor(Date.now() / 1000)) + 60n * 10n
      )
    ).to.be.revertedWith("UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT");

    const wethBalance = await mockWETH.balanceOf(addr1.address);
    const daiBalance = await mockDAI.balanceOf(addr1.address);

    expect(wethBalance).to.equal(amount);
    expect(daiBalance).to.equal(ethers.parseEther("0")); // amountOut = amountIn * 2 - fee
  });
});
