from web3 import Web3, eth
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
    except FileNotFoundError:
        print(f"File '{filename}' not found.")
        return None

uniswap_router_abi_json_fh = "uniswap_v2_router_abi.json"
uniswap_router_abi = load_abi_json(uniswap_router_abi_json_fh)
uniswap_router_address = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
