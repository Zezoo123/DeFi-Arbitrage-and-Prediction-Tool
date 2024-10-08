import requests
import pandas as pd

url_api = 'https://api.coingecko.com/api/v3'
url_ping = url_api + '/ping'
url_price = url_api + '/simple/price'
url_coins = url_api + '/coins'

DAYS = 30
crypto_ids = ['bitcoin', 'ethereum', 'litecoin', 'ripple', 'cardano']

# API key
headers = {'x-cg-demo-api-key': 'CG-YeENUQYCX9m5U2XNeDDbxPZh'}

"""
Fetch the current prices of the crptocurrencies in the array crypto_ids
"""
def fetch_current_prices(url, headers, crypto_ids):
    params = {
        'ids': ','.join(crypto_ids),
        'vs_currencies': 'USD'
    }
    response = requests.get(url, params = params)

    if response.status_code == 200:
        data = response.json()
    else:
        print('Failed to retrieve data from the API')
        print(f'Error Code: {response.status_code}')
        return None

    return data


"""
Fetch the prices of a specific cryptocurrency over a specified number of days
"""
def fetch_prices_over_time(url, crypto_id, days=DAYS):
    url = url + f'/{crypto_id}/market_chart'
    params = {
        'vs_currencies': 'USD',
        'days': days
    }
    response = requests.get(url, params = params)

    if response.status_code == 200:
        data = response.json()
    else:
        print('Failed to retrieve data from the API')
        print(f'Error Code: {response.status_code}')
        return None

    return data

# current_prices = fetch_current_prices(url_price, headers, crypto_ids)
# current_prices_fh = 'current_prices.csv'

# if current_prices:
#     df = pd.DataFrame(prices).T.reset_index() # Transpose to get currencies as rows
#     df.columns = ['crypto', 'price']
#     df.to_csv(current_prices_fh, index=False)
#     print("Prices saved succesfully to " + current_prices_fh)
# else:
#     print("Failed to save prices")

