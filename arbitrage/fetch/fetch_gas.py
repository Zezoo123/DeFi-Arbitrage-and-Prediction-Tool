import os
from dotenv import load_dotenv
import requests

load_dotenv()

etherscan_api_key = os.getenv('ETHERSCAN_API_KEY')
url = f'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey={etherscan_api_key}'

def get_gas_prices():
    try:
        response = requests.get(url).json()
        if response['status'] == '1':
            gas_prices = {
                'SafeGasPrice': response['result']['SafeGasPrice'],       # Low priority
                'ProposeGasPrice': response['result']['ProposeGasPrice'], # Medium priority
                'FastGasPrice': response['result']['FastGasPrice']      # High priority
            }
            return gas_prices
        else:
            print("Error fetching gas prices: ", response['result'])
            return None
    except Exception as e:
        print("Error fetching gas prices: ", e)
        return None