from web3 import Web3

# Connect to the Ethereum network
infural_url = "https://mainnet.infura.io/v3/e7f73227604947909042727b8c0e842e"
w3 = Web3(Web3.HTTPProvider(infural_url))

# Check the connection:

def check_connection(web3):
    if web3.is_connected():
        print("Connected to the Ethereum network")
    else:
        print("Could not connect to the Ethereum network")
    
check_connection(w3)
