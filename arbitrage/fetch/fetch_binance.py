from binance.client import Client
from dotenv import load_dotenv
import os

load_dotenv()

binance_api_key = os.getenv('BINANCE_API_KEY')
binance_secret_key = os.getenv('BINANCE_SECRET_KEY')

binance_client= Client(binance_api_key, binance_secret_key)

def get_binance_price(symbol):
    ticker = binance_client.get_symbol_ticker(symbol=symbol)
    return float(ticker['price']) if ticker['price'] else None