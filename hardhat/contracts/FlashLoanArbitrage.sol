// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/protocol/libraries/types/DataTypes.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/ISushiSwapRouter.sol";

contract FlashLoanArbitrage is FlashLoanSimpleReceiverBase, Ownable {
    address private immutable owner;
    address private constant UNISWAP_ROUTER = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;
    address private constant SUSHISWAP_ROUTER = 0xeaBcE3E74EF41FB40024a21Cc2ee2F5dDc615791;
    address private constant WETH = 0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534;
    address private constant USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7237;
    address private constant USDT = 0x7169D38820dfd117C3FA1f22a697dBA58d90BA06;
    address private constant DAI = 0x68194a729C2450ad26072b3D6AD2CD9882c97125;

    constructor(address _addressProvider) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {
        owner = msg.sender;
    }

    /**
     * @notice Executes the operation after receiving the flash loaned amount
     * @param asset The address of the flash-borrowed asset
     * @param amount The amount of the flash-borrowed asset
     * @param premium The fee of the flash-borrowed asset
     * @param initiator The address of the flashloan initiator
     * @param params The byte-encoded params passed when initiating the flashloan
     * @return True if the operation is successful
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Decode the parameters
        (address tokenA, address tokenB, address[] memory path1, address[] memory path2) = 
            abi.decode(params, (address, address, address[], address[]));

        // Approve router to spend the borrowed asset
        IERC20(asset).approve(UNISWAP_ROUTER, amount);

        // Execute the first swap
        uint256[] memory amounts1 = IUniswapV2Router02(UNISWAP_ROUTER).swapExactTokensForTokens(
            amount,
            0, // Accept any amount of tokens
            path1,
            address(this),
            block.timestamp
        );

        // Approve second router to spend the received tokens
        IERC20(path1[path1.length - 1]).approve(SUSHISWAP_ROUTER, amounts1[amounts1.length - 1]);

        // Execute the second swap
        uint256[] memory amounts2 = ISushiSwapRouter(SUSHISWAP_ROUTER).swapExactTokensForTokens(
            amounts1[amounts1.length - 1],
            0, // Accept any amount of tokens
            path2,
            address(this),
            block.timestamp
        );

        // Calculate the amount to be repaid
        uint256 amountToRepay = amount + premium;

        // Approve the repayment of the flash loan
        IERC20(asset).approve(address(POOL), amountToRepay);

        return true;
    }

    /**
     * @notice Initiates a flash loan
     * @param asset The address of the asset to flash borrow
     * @param amount The amount to flash borrow
     * @param params The parameters for the flash loan
     */
    function executeFlashLoan(
        address asset,
        uint256 amount,
        bytes calldata params
    ) external onlyOwner {
        address receiverAddress = address(this);
        bytes memory params = params;
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            asset,
            amount,
            params,
            referralCode
        );
    }

    /**
     * @notice Withdraws tokens from the contract
     * @param token The address of the token to withdraw
     * @param amount The amount to withdraw
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }

    /**
     * @notice Returns the owner of the contract
     */
    function getOwner() external view returns (address) {
        return owner;
    }
} 