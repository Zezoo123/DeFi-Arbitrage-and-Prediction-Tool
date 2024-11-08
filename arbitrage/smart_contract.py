from web3 import Web3
import os
from dotenv import load_dotenv

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
