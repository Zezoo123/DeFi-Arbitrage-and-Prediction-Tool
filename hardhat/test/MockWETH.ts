import { ethers } from "hardhat";
import { expect } from "chai";
import { MockWETH } from "../typechain-types";
import { Signer } from "ethers";

describe("MockWETH Contract", function () {
  let mockWETH: MockWETH;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy MockWETH
    const MockWETHFactory = await ethers.getContractFactory("MockWETH");
    mockWETH = await MockWETHFactory.connect(owner).deploy();
    await mockWETH.waitForDeployment();
  });

  it("should have correct name and symbol", async function () {
    const name = await mockWETH.name();
    const symbol = await mockWETH.symbol();
    expect(name).to.equal("Mock WETH");
    expect(symbol).to.equal("WETH");
  });

  it("should mint tokens correctly", async function () {
    const amount = ethers.parseEther("1000");

    // Owner mints tokens to addr1
    await mockWETH.connect(owner).transfer(addr1.address, amount);

    const balance = await mockWETH.balanceOf(addr1.address);
    expect(balance).to.equal(amount);
  });

  it("should transfer tokens correctly", async function () {
    const amount = ethers.parseEther("500");

    // Transfer from owner to addr1
    await mockWETH.connect(owner).transfer(addr1.address, amount);

    const addr1Balance = await mockWETH.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(amount);
  });

  it("should fail transfer when balance is insufficient", async function () {
    const amount = ethers.parseEther("100");
  
    // addr1 has no tokens initially
    await expect(
      mockWETH.connect(addr1).transfer(addr2.address, amount)
    ).to.be.reverted;
  });
});
