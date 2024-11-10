import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";

let mockUniswapRouter: Contract;
let mockWETH: Contract;
let mockDAI: Contract;
let owner: Signer;
let addr1: Signer;
let addr2: Signer;

beforeEach(async function () {
  [owner, addr1, addr2] = await ethers.getSigners();

  const MockWETHFactory = await ethers.getContractFactory("MockWETH");
  let mockWETH = await MockWETHFactory.deploy();
  await mockWETH.waitForDeployment();

  const MockDAIFactory = await ethers.getContractFactory("MockDAI");
  let mockDAI = await MockDAIFactory.deploy();
  await mockDAI.waitForDeployment();

  const MockUniswapRouterFactory = await ethers.getContractFactory("MockUniswapRouter");
  let mockUniswapRouter = await MockUniswapRouterFactory.deploy(mockWETH.target, mockDAI.target);
  await mockUniswapRouter.waitForDeployment();
});

describe("MockUniswapRouter Contract", function () {
  it("should deploy correctly", async function () {
    expect(mockUniswapRouter.address).to.be.properAddress;
  });

  it("should swap DAI for WETH correctly", async function () {
    await mockDAI.connect(owner).mint(await addr1.getAddress(), ethers.utils.parseEther("1000"));
    await mockDAI.connect(addr1).approve(mockUniswapRouter.address, ethers.utils.parseEther("1000"));

    await mockUniswapRouter.connect(addr1).swapExactTokensForTokens(
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("0"),
      [mockDAI.address, mockWETH.address],
      await addr1.getAddress(),
      Math.floor(Date.now() / 1000) + 60 * 10
    );

    const daiBalance = await mockDAI.balanceOf(await addr1.getAddress());
    const wethBalance = await mockWETH.balanceOf(await addr1.getAddress());

    expect(daiBalance).to.equal(ethers.utils.parseEther("900"));
    expect(wethBalance).to.be.above(ethers.utils.parseEther("0"));
  });

  it("should revert if allowance is insufficient for swap", async function () {
    await mockDAI.connect(owner).mint(await addr1.getAddress(), ethers.utils.parseEther("1000"));

    await expect(
      mockUniswapRouter.connect(addr1).swapExactTokensForTokens(
        ethers.utils.parseEther("100"),
        ethers.utils.parseEther("0"),
        [mockDAI.address, mockWETH.address],
        await addr1.getAddress(),
        Math.floor(Date.now() / 1000) + 60 * 10
      )
    ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
  });

  it("should revert if output amount is below minimum specified", async function () {
    await mockDAI.connect(owner).mint(await addr1.getAddress(), ethers.utils.parseEther("1000"));
    await mockDAI.connect(addr1).approve(mockUniswapRouter.address, ethers.utils.parseEther("1000"));

    await expect(
      mockUniswapRouter.connect(addr1).swapExactTokensForTokens(
        ethers.utils.parseEther("100"),
        ethers.utils.parseEther("200"),
        [mockDAI.address, mockWETH.address],
        await addr1.getAddress(),
        Math.floor(Date.now() / 1000) + 60 * 10
      )
    ).to.be.revertedWith("UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT");
  });

  it("should swap WETH for DAI correctly", async function () {
    await mockWETH.connect(owner).mint(await addr1.getAddress(), ethers.utils.parseEther("100"));
    await mockWETH.connect(addr1).approve(mockUniswapRouter.address, ethers.utils.parseEther("100"));

    await mockUniswapRouter.connect(addr1).swapExactTokensForTokens(
      ethers.utils.parseEther("50"),
      ethers.utils.parseEther("0"),
      [mockWETH.address, mockDAI.address],
      await addr1.getAddress(),
      Math.floor(Date.now() / 1000) + 60 * 10
    );

    const wethBalance = await mockWETH.balanceOf(await addr1.getAddress());
    const daiBalance = await mockDAI.balanceOf(await addr1.getAddress());

    expect(wethBalance).to.equal(ethers.utils.parseEther("50"));
    expect(daiBalance).to.be.above(ethers.utils.parseEther("0"));
  });
});
