import os
import csv
from datetime import datetime
from binance import Client

#init
api_key = os.environ.get('binance_api')
api_secret = os.environ.get('binance_api_private_key')

client = Client(api_key=api_key, api_secret=api_secret)

# get market depth
depth = client.get_order_book(symbol='BNBBTC')

info = client.get_all_tickers()

def fetch_current_prices(symbols):
    prices =[]

    for symbol in symbols:
        ticker = client.get_symbol_ticker(symbol=symbol)
        prices.append([ticker['symbol'], float(ticker['price']), datetime.now().strftime("%Y-%m-%d %H:%M:%S")])

    return prices

def save_current_prices():
    prices = fetch_current_prices(symbols=['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'LTCUSDT', 'XRPUSDT'])
    for index, price in enumerate(prices):
        prices[index] = [price[0], price[1]]

    filename = "binance.csv"    
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Write the header if the file is empty
        if file.tell() == 0:
            writer.writerow(['crypto', 'price'])
        # Write the price data
        writer.writerows(prices)

save_current_prices()