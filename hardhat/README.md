# Arbitrage Hardhat Project

This project uses hardhat to generate 2 mock tokens (MockWETH, MockDAI) to test arbitrage.

To compile contracts:
```shell
npx hardhat compile
```
if you want to clean the directory before compiling the contracts run:
```shell
npx hardhat clean
npx hardhat compile
```


To run all the tests:
```shell
npx hardhat test
```

To run a specfic test:
```shell
npx hardhat test test/specific_test.ts
```

The current Arbitrage.ts test file only checks if the profits made are greater than 0.
More testing should be implemented to ensure profits made are correct using the mock routers.