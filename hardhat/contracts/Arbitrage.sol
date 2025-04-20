// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Arbitrage is FlashLoanSimpleReceiverBase, Ownable {
    IUniswapV2Router02 public immutable router1;
    IUniswapV2Router02 public immutable router2;
    
    uint256 public constant MINIMUM_PROFIT = 0.01 ether; // Minimum profit threshold
    uint256 public constant DEADLINE_EXTENSION = 300; // 5 minutes

    error InvalidAddress();
    error InvalidAmount();
    error InsufficientAllowance();
    error SwapFailed();

    event ArbitrageExecuted(
        address tokenA,
        address tokenB,
        uint256 amountIn,
        uint256 amountOut,
        uint256 profit
    );

    constructor(
        address _addressProvider, // Aave V3 address provider
        address _router1,
        address _router2
    ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) Ownable(msg.sender) {
        if (_router1 == address(0) || _router2 == address(0) || _addressProvider == address(0)) 
            revert InvalidAddress();
        router1 = IUniswapV2Router02(_router1);
        router2 = IUniswapV2Router02(_router2);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address /* initiator */,  // Unused parameter commented out
        bytes calldata params
    ) external override returns (bool) {
        if (asset == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        
        // Decode params
        (address tokenB, uint256 minProfitAmount) = abi.decode(params, (address, uint256));
        if (tokenB == address(0)) revert InvalidAddress();
        
        // Approve routers
        if (!IERC20(asset).approve(address(router1), amount)) revert InsufficientAllowance();
        if (!IERC20(tokenB).approve(address(router2), type(uint256).max)) revert InsufficientAllowance();

        // Execute the arbitrage
        uint256 amountOut = _executeArbitrage(asset, tokenB, amount, minProfitAmount);
        
        // Approve repayment
        uint256 amountToRepay = amount + premium;
        if (!IERC20(asset).approve(address(POOL), amountToRepay)) revert InsufficientAllowance();

        emit ArbitrageExecuted(asset, tokenB, amount, amountOut, amountOut - amountToRepay);
        return true;
    }

    function _executeArbitrage(
        address tokenA,
        address tokenB,
        uint256 amount,
        uint256 minProfitAmount
    ) internal returns (uint256) {
        // Get the expected amount out from first swap
        address[] memory path = new address[](2);
        path[0] = tokenA;
        path[1] = tokenB;
        
        uint256[] memory amountsOut = router1.getAmountsOut(amount, path);
        uint256 amountOut1 = amountsOut[1];
        
        // Execute first swap
        uint256[] memory amounts1 = router1.swapExactTokensForTokens(
            amount,
            amountOut1,
            path,
            address(this),
            block.timestamp + DEADLINE_EXTENSION
        );
        if (amounts1[1] < amountOut1) revert SwapFailed();

        // Swap back on second DEX
        address[] memory pathReverse = new address[](2);
        pathReverse[0] = tokenB;
        pathReverse[1] = tokenA;
        
        uint256[] memory amountsBack = router2.getAmountsOut(amounts1[1], pathReverse);
        uint256 expectedAmountBack = amountsBack[1];
        
        require(
            expectedAmountBack >= amount + minProfitAmount,
            "Insufficient profit"
        );

        uint256[] memory amounts2 = router2.swapExactTokensForTokens(
            amounts1[1],
            expectedAmountBack,
            pathReverse,
            address(this),
            block.timestamp + DEADLINE_EXTENSION
        );
        if (amounts2[1] < expectedAmountBack) revert SwapFailed();

        return amounts2[1];
    }

    function startArbitrage(
        address asset,
        uint256 amount,
        address tokenB,
        uint256 minProfitAmount
    ) external onlyOwner {
        if (asset == address(0) || tokenB == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        
        bytes memory params = abi.encode(tokenB, minProfitAmount);
        POOL.flashLoanSimple(
            address(this),
            asset,
            amount,
            params,
            0
        );
    }

    // Emergency withdrawal function
    function emergencyWithdraw(address token) external onlyOwner {
        if (token == address(0)) revert InvalidAddress();
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        if (!IERC20(token).transfer(owner(), balance)) revert InsufficientAllowance();
    }
}
