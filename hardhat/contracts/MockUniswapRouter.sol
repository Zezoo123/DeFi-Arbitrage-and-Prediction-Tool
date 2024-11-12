// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockUniswapRouter {
    address public WETH;
    address public DAI;
    uint public exchangeRate;
    uint public feeRate = 30; // 0.3% fee

    constructor(address weth, address dai, uint initalExchagneRate) {
        WETH = weth;
        DAI = dai;
        exchangeRate = initalExchagneRate;
    }
    
    function setFee(uint newFeeRate) external{
        feeRate = newFeeRate;
    }

    function getAmountAfterFee(uint amount) public returns (uint256){
        return (amount * (10000 - feeRate)) / 10000;
    }

    function setExchangeRate(uint initalExchagneRate) external {
        exchangeRate = initalExchagneRate;
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(deadline >= block.timestamp, "Transaction expired");
        require(path.length == 2, "Only two-token swaps are supported");

        address tokenIn = path[0];
        address tokenOut = path[1];

        // Transfer tokenIn from msg.sender to this contract
        bool success = IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        require(success, "Transfer of tokenIn failed");

        // Simulate swapping
        uint256 amountInWithFee = getAmountAfterFee(amountIn);
        uint256 amountOut = amountInWithFee * exchangeRate;

        require(amountOut >= amountOutMin, "UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT");

        // Transfer tokenOut from this contract to the recipient
        success = IERC20(tokenOut).transfer(to, amountOut);
        require(success, "Transfer of tokenOut failed");

        // Return the amounts array
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        amounts[1] = amountOut;
    }
}
