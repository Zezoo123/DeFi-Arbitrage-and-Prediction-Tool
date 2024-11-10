import { ethers } from "hardhat";
import { expect } from "chai";
import { MockDAI } from "../typechain-types";
import { Signer } from "ethers";

describe("MockDAI Contract", function () {
  let mockDAI: MockDAI;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy MockDAI
    const MockDAIFactory = await ethers.getContractFactory("MockDAI");
    mockDAI = await MockDAIFactory.deploy();
    await mockDAI.waitForDeployment();
  });

  it("should have correct name and symbol", async function () {
    const name = await mockDAI.name();
    const symbol = await mockDAI.symbol();
    expect(name).to.equal("Mock DAI");
    expect(symbol).to.equal("DAI");
  });

  it("should mint tokens correctly", async function () {
    const amount = ethers.parseEther("2000");

    // Owner mints tokens to addr1
    await mockDAI.connect(owner).mint(addr1.address, amount);

    const balance = await mockDAI.balanceOf(addr1.address);
    expect(balance).to.equal(amount);
  });

  it("should approve and transferFrom correctly", async function () {
    const amount = ethers.parseEther("1000");

    // Owner mints tokens to addr1
    await mockDAI.connect(owner).mint(addr1.address, amount);

    // addr1 approves addr2 to spend on their behalf
    await mockDAI.connect(addr1).approve(addr2.address, amount);

    // addr2 transfers tokens from addr1 to themselves
    await mockDAI.connect(addr2).transferFrom(addr1.address, addr2.address, amount);

    const addr1Balance = await mockDAI.balanceOf(addr1.address);
    const addr2Balance = await mockDAI.balanceOf(addr2.address);

    expect(addr1Balance).to.equal(0n);
    expect(addr2Balance).to.equal(amount);
  });

  it("should fail transferFrom without approval", async function () {
    const amount = ethers.parseEther("500");

    // Owner mints tokens to addr1
    await mockDAI.connect(owner).mint(addr1.address, amount);

    // addr2 tries to transfer tokens from addr1 without approval
    await expect(
      mockDAI.connect(addr2).transferFrom(addr1.address, addr2.address, amount)
    ).to.be.revertedWith("ERC20: insufficient allowance");
  });
});
