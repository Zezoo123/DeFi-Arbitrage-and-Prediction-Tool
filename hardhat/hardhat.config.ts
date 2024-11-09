import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "@typechain/hardhat"; // Add this import


// Load environment variables from .env file in the parent directory
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || "";
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  typechain: {
    outDir: "typechain-types", // Output directory for TypeChain files
    target: "ethers-v6", // Target version
  },
  networks: {
    // sepolia: {
    //   url: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
    //   accounts: [`0x${METAMASK_PRIVATE_KEY}`]
    // },
    localhost: {
      url: `http://127.0.0.1:8545/`,
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
      ]
    }
  }
};

export default config;
