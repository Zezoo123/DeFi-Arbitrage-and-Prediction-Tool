import requests
import time
import pandas as pd
import os

coingecko_url_api = 'https://api.coingecko.com/api/v3'
coingecko_url_ping = coingecko_url_api + '/ping'
coingecko_url_price = coingecko_url_api + '/simple/price'
coingecko_url_coins = coingecko_url_api + '/coins'

DAYS = 30
crypto_ids = ['bitcoin', 'ethereum', 'bnb','litecoin', 'ripple', 'cardano']

# API key
headers = {'x-cg-demo-api-key': 'CG-YeENUQYCX9m5U2XNeDDbxPZh'}

"""
RESPONSE CODE MEANINGS:
- 200: The request was successful.
- 404: The requested resource was not found.
- 429: Rate limit exceeded.
"""

"""
Fetch the current prices of the crptocurrencies in the array crypto_ids
"""
def fetch_current_prices(url, crypto_ids, headers=headers):
    params = {
        'ids': ','.join(crypto_ids),
        'vs_currencies': 'usd'
    }
    response = requests.get(url, params = params)

    if response.status_code == 200:
        data = response.json()
    elif response.status_code == 429:
        print('Rate limit exceeded. Waiting for 10 seconds...')
        time.sleep(10)
        return fetch_current_prices(url, crypto_ids)
    else:
        print('Failed to retrieve data from the API')
        print(f'Error Code: {response.status_code}')
        return None

    return data


"""
Fetch the prices of a specific cryptocurrency over a specified number of days
"""
def fetch_prices_over_time(crypto_id, url=coingecko_url_coins, days=DAYS, headers=headers):
    url = url + f'/{crypto_id}/market_chart'
    params = {
        'vs_currency': 'usd',
        'days': days
    }
    response = requests.get(url, params = params)
    if response.status_code == 200:
        data = response.json()
    elif response.status_code == 429:
        print('Rate limit exceeded. Waiting for 10 seconds...')
        time.sleep(10)
        return fetch_prices_over_time(crypto_id, url)
    else:
        print('Failed to retrieve data from the API')
        print(f'Error Code: {response.status_code}')
        return None

    return data

"""
Save current prices in data/coingecko/current_prices.csv file
"""
def save_current_prices(url=coingecko_url_price, crypto_ids=crypto_ids):
    current_prices = fetch_current_prices(url, crypto_ids)
    current_prices_fh = 'data/coingecko/current_prices.csv'
    if current_prices:
        df = pd.DataFrame(current_prices).T.reset_index() # Transpose to get currencies as rows
        df.columns = ['crypto', 'price']
        df.to_csv(current_prices_fh, index=False)
        print("Prices saved succesfully to " + current_prices_fh)
    else:
        print("Failed to save prices")

"""
Save prices over time for the different crypto currencies identified in crypto_ids.
Files saved in folder prices_over_time/crypto_id_prices.csv
"""
def save_prices_over_time(crypto_ids=crypto_ids):
    for crypto_id in crypto_ids:
        prices_over_time = fetch_prices_over_time(crypto_id)
        if prices_over_time:
            df_prices_over_time = pd.DataFrame(prices_over_time['prices'], columns=['timestamp', 'price'])
            df_prices_over_time['timestamp'] = pd.to_datetime(df_prices_over_time['timestamp'], unit='ms') # Convert timestamp to datetime
            df_prices_over_time.to_csv(f'data/coingecko/{crypto_id}_prices.csv', index=False)

