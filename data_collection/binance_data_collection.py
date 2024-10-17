import os
import csv
from datetime import datetime, timedelta
from binance import Client
import pandas as pd

#init
api_key = os.environ.get('binance_api')
api_secret = os.environ.get('binance_api_private_key')
BASE_DIR = '/Users/zezo/project/DeFi-Arbitrage-and-Prediction-Tool'

client = Client(api_key=api_key, api_secret=api_secret)

def fetch_current_prices(symbols):
    prices =[]

    for symbol in symbols:
        ticker = client.get_symbol_ticker(symbol=symbol)
        prices.append([ticker['symbol'], float(ticker['price']), datetime.now().strftime("%Y-%m-%d %H:%M:%S")])

    return prices

def fetch_historical_data(symbol, interval, days=30):
    # Calculate start time
    end_time = datetime.now()
    start_time = end_time - timedelta(days=days)

    # Convert to readable timestamp for api
    start_time_api =  start_time.strftime('%Y-%m-%d %H:%M:%S')
    end_time_api = end_time.strftime('%Y-%m-%d %H:%M:%S')

    # Fetch data
    klines = client.get_historical_klines(
        symbol=symbol,
        interval=interval,
        start_str=start_time_api,
        end_str=end_time_api
    )
    df = pd.DataFrame(klines, columns=[
    'Open Time', 'Open', 'High', 'Low', 'Close', 'Volume', 'Close Time',
    'Quote Asset Volume', 'Number of Trades', 'Taker Buy Base Asset Volume',
    'Taker Buy Quote Asset Volume', 'Ignore'
    ])

    df['Open Time'] = pd.to_datetime(df['Open Time'], unit='ms')
    df['Close Time'] = pd.to_datetime(df['Close Time'], unit='ms')

    df[['Open', 'High', 'Low', 'Close', 'Volume', 'Quote Asset Volume']] = df[['Open', 'High', 'Low', 'Close', 'Volume', 'Quote Asset Volume']].apply(pd.to_numeric)


    return df

def save_current_prices():
    prices = fetch_current_prices(symbols=['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'LTCUSDT', 'XRPUSDT'])
    for index, price in enumerate(prices):
        prices[index] = [price[0], price[1]]

    filename = BASE_DIR + "/data/binance/current_prices.csv"    
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Write the header if the file is empty
        if file.tell() == 0:
            writer.writerow(['crypto', 'price'])
        # Write the price data
        writer.writerows(prices)

def save_prices_over_time():
    #'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'LTCUSDT', 'XRPUSDT
    for symbol in ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'LTCUSDT', 'XRPUSDT']:
        # '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d'
        for interval in ['1m', '3m', '5m', '15m', '30m']:
            klines = fetch_historical_data(symbol, interval)
            filename = BASE_DIR + f"/data/binance/{symbol[:3]}/{interval}.csv"
            klines.to_csv(filename, index=False)