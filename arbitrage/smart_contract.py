from web3 import Web3
import os

# Connect to the Ethereum network
w3 = Web3(Web3.HTTPProvider(infural_url))

# Check the connection:

def check_connection(web3):
    if web3.is_connected():
        print("Connected to the Ethereum network")
    else:
        print("Could not connect to the Ethereum network")
    
check_connection(w3)
