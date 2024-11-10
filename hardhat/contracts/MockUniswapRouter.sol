pragma solidity ^0.8.0;

contract MockUniswapRouter {
    address public WETH;
    address public DAI;

    constructor(address weth, address dai) {
        WETH = weth;
        DAI = dai;
    }

    function getAmountsOut(uint amountIn, address[] calldata path) external pure returns (uint[] memory amounts) {
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        amounts[1] = amountIn * 2; // Dummy conversion rate
    }
}