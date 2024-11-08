from web3 import Web3, eth
import web3
import os
from dotenv import load_dotenv
import json

load_dotenv()

# Connect to the Ethereum network
infura_api_key = os.getenv('INFURA_API_KEY')
infura_url = f"https://mainnet.infura.io/v3/{infura_api_key}"
w3 = Web3(Web3.HTTPProvider(infura_url))

# Check the connection:

def check_connection(web3):
    if web3.is_connected():
        print("Connected to the Ethereum network")
    else:
        print("Could not connect to the Ethereum network")
    
check_connection(w3)

def load_abi_json(filename):
    try:
        with open(filename) as f:
            abi = json.load(f)
        return abi
    except FileNotFoundError:
        print(f"File '{filename}' not found.")
        return None

uniswap_router_abi_json_fh = "uniswap_v2_router_abi.json"
uniswap_router_abi = load_abi_json(uniswap_router_abi_json_fh)
if uniswap_router_abi:
    uniswap_router_address = w3.to_checksum_address('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')

    # Create contract instance
    uniswap_router_contract = w3.eth.contract(address=uniswap_router_address, abi=uniswap_router_abi)   

def get_uniswap_price(token_code, token_address):
    """
    Fetches the price of a given token in ETH from Uniswap.

    Parameters:
    token_code (str): The code of the token (e.g., 'DAI', 'USDT', 'USDC').
    token_address (str): The Ethereum address of the token.

    Returns:
    float: The price of the token in ETH, or None if an error occurs.
    """
    eth_address = w3.to_checksum_address('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    weth_address = w3.to_checksum_address('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')  # WETH address
    token_address = w3.to_checksum_address(token_address)
    
    if token_code == 'DAI':
        amount_in = 10 ** 18
    elif token_code == 'USDT' or token_code == 'USDC':
        amount_in = 10 ** 6

    path = [token_address, weth_address]
    try:
        amounts_out = uniswap_router_contract.functions.getAmountsOut(amount_in, path).call()
        return w3.from_wei(amounts_out[1], 'ether')
    except ValueError as e:
        print(f"Error fetching price - likely due to contract call: {e}")
        return None
    except Exception as e:
        print(f"Error fetching price: {e}")
        return None
    
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