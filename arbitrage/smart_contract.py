import sys
import os

sys.path.append(os.path.abspath(os.path.join('fetch/')))

from fetch_gas import get_gas_prices
from fetch_binance import get_binance_price
from fetch_uniswap import get_uniswap_price, w3, get_uniswap_router_contract

gas_prices = get_gas_prices()
if gas_prices:
    print("Current Gas Prices (in Gwei):")
    print(f"Safe Gas Price: {gas_prices['SafeGasPrice']} Gwei")
    print(f"Propose Gas Price: {gas_prices['ProposeGasPrice']} Gwei")
    print(f"Fast Gas Price: {gas_prices['FastGasPrice']} Gwei")

print("\n----------------------------------------------------------------\n")
# PRINT BINANCE PRICES
try:
    # Fetching prices for DAI/USDT and WETH/USDT pairs
    dai_usdt_price = get_binance_price('DAIUSDT')
    print(f"Binance price for DAI/USDT: {dai_usdt_price:.20f} USDT")

    # Calculating the inferred DAI/WETH price
    eth_usdt_price = get_binance_price('ETHUSDT')
    print(f"Binance price for ETH/USDT: {eth_usdt_price:.20f} USDT")

    dai_eth_price = dai_usdt_price / eth_usdt_price
    print(f"Inferred DAI/ETH price: {dai_eth_price:.20f} ETH")
except Exception as e:
    print(f"An error occurred: {e}")


print("\n----------------------------------------------------------------\n")
# PRINT UNISWAP PRICES
# Example usage with DAI
dai_token_address = '0x6B175474E89094C44Da98b954EedeAC495271d0F'     # DAI token address
dai_price = get_uniswap_price('DAI', dai_token_address)
if dai_price is not None:
    print(f"Uniswap price for DAI: {dai_price} WETH")
else:
    print("Failed to fetch the price for DAI.")

# Example usage with USDC
usdc_token_address = '0xA0b86991c6218B36c1d19D4a2e9Eb0cE3606EB48'  # USDC token address
usdc_price = get_uniswap_price('USDC', usdc_token_address)
if usdc_price is not None:
    print(f"Uniswap price for USDC: {usdc_price} WETH")
else:
    print("Failed to fetch the price for USDC.")

# Example usage with USDT
usdt_token_address = '0xdAC17F958D2ee523a2206206994597C13D831ec7'  # USDT token address
usdt_price = get_uniswap_price('USDT', usdt_token_address)
if usdt_price is not None:
    print(f"Uniswap price for USDT: {usdt_price} WETH")
else:
    print("Failed to fetch the price for USDT.")
