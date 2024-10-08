import requests
import pandas as pd

url_ping = 'https://api.coingecko.com/api/v3/ping'
url_price = 'https://api.coingecko.com/api/v3/simple/price'

params = {  
    'ids': ','.join(['bitcoin', 'ethereum', 'litecoin', 'ripple', 'cardano']),
    'vs_currencies': 'USD'
}
# API key
headers = {'x-cg-demo-api-key': 'CG-YeENUQYCX9m5U2XNeDDbxPZh'}

def fetch_prices(url, params, headers):
    response = requests.get(url, params = params)

    if response.status_code == 200:
            data = response.json()
    else:
            print('Failed to retrieve data from the API')
            print(f'Error Code: {response.status_code}')

    return data

prices = fetch_prices(url_price, params, headers)
df = pd.DataFrame(prices)
df.to_csv("prices.csv", index=False)
