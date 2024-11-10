import { expect } from "chai";
import { ethers } from "hardhat";
import { MyToken, MyToken__factory } from "../typechain";

describe("MyToken contract", function () {
  let myToken: MyToken;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any[];

  // Deploy the contract before each test
  beforeEach(async function () {
    const TokenFactory: MyToken__factory = (await ethers.getContractFactory("MyToken")) as MyToken__factory;
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    myToken = await TokenFactory.deploy();
    await myToken.deployed();
  });

  describe("Deployment", function () {
    it("Should assign the initial balance to the owner", async function () {
      const ownerBalance = await myToken.balances(owner.address);
      expect(ownerBalance).to.equal(1000);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await myToken.transfer(addr1.address, 50);
      const addr1Balance = await myToken.balances(addr1.address);
      expect(addr1Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      // Attempt to transfer from addr1 (who has 0 tokens)
      await expect(myToken.connect(addr1).transfer(addr2.address, 1)).to.be.revertedWith("Not enough tokens");
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await myToken.balances(owner.address);

      // Transfer tokens from owner to addr1 and addr2
      await myToken.transfer(addr1.address, 100);
      await myToken.transfer(addr2.address, 50);

      // Check balances
      const finalOwnerBalance = await myToken.balances(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

      const addr1Balance = await myToken.balances(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await myToken.balances(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});
