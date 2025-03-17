// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract Arbitrage {
    address owner;
    IUniswapV2Router02 public router1;
    IUniswapV2Router02 public router2;
    address[] public path;
    address[] public pathReversed;

    constructor(address _router1, address _router2) {
        owner = msg.sender;
        router1 = IUniswapV2Router02(_router1);
        router2 = IUniswapV2Router02(_router2);
    }

    function executeArbitrage(address tokenA, address tokenB, uint256 amount) external {
        require(msg.sender == owner, "Not authorized");

        // Swap on first DEX
        path = [tokenA, tokenB];

        uint256[] memory amountsOut1 = router1.getAmountsOut(amount, path);
        require(amountsOut1.length > 1, "Invalid amountsOut response");
        uint256 amountOut1 = amountsOut1[1];

        // Swap back on second DEX
        pathReversed = [tokenB, tokenA];

        uint256 amountOut2 = router2.getAmountsOut(amountOut1, pathReversed)[1];
        router2.swapExactTokensForTokens(amountOut1, amountOut2, pathReversed, address(this), block.timestamp);

        require(amountOut2 > amount, "No arbitrage opportunity"); // Ensure profit
    }
}
