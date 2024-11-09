require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env" });


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}",
      accounts: ['${process.env.METAMASK_API_KEY}']
    }
  }
};
