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
        f.close()    
        return abi
    except FileNotFoundError:
        print(f"File '{filename}' not found.")
        return None

uniswap_router_abi_json_fh = "uniswap_v2_router_abi.json"
uniswap_router_abi = load_abi_json(uniswap_router_abi_json_fh)
uniswap_router_address = '0x7a250d5630b4cf539739df2c5dacf5c1a4e7e3a1'

# Create contract instance
uniswap_router_contract = w3.eth.contract(address=uniswap_router_address, abi=uniswap_router_abi)   

def get_uniswap_price(token_address):
    global w3
    eth_address = w3.to_checksum_address('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    token_address = w3.to_checksum_address(token_address)
    amount_in = w3.to_wei(1, 'ether')
    amounts_out = uniswap_router_contract.functions.getAmountsOut(amount_in, [eth_address, token_address]).call()
    return w3.from_wei(amounts_out[1], 'ether')

token_address = '0x6B175474E89094C44Da98b954EedeAC495271d0F'  # DAI token address
price = get_uniswap_price(token_address)
if price is not None:
    print(f"Uniswap price for DAI: {price} ETH")
else:
    print("Failed to fetch the price.")