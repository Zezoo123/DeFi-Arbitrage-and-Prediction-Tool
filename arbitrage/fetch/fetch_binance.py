from binance.client import Client
from dotenv import load_dotenv
import os

load_dotenv()

binance_api_key = os.getenv('BINANCE_API_KEY')
binance_secret_key = os.getenv('BINANCE_SECRET_KEY')

binance_client= Client(binance_api_key, binance_secret_key)

def get_binance_price(symbol):
    ticker = binance_client.get_symbol_ticker(symbol=symbol)
    return float(ticker['price'])

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
