require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "develop",
  networks: {
    hardhat: {},
    develop: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337
    },
    rinkeby: {
      url: "https://speedy-nodes-nyc.moralis.io/7b7b771ec8da4cf1d3ef4985/eth/rinkeby",
      accounts: [
        "0xf4e463dd5eb366263e26d9444d25d0b57ddecfacd0c1794a651febc3ea2c313e",
      ],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "2RTSC4A1N2KT8UTNGQBJPX7GD9HS6PBVUH"
  },
  solidity: {
    version: "0.6.2",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};
