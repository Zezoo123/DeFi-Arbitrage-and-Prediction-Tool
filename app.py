from flask import Flask, render_template, redirect, url_for, request
import pandas as pd
import time

from data_collection import coingecko_data_collection, binance_data_collection
from plot import plot_prices_over_time, plot_klines


app = Flask(__name__)



# Route for the main page
@app.route('/')
def index():
    intervals = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d']
    crypto_ids = ['BTC', 'ETH', 'BNB', 'XRP', 'LTC', 'ADA']

    if time.time() - price_cache.get('last_refresh', 0) > 300:
        load_current_prices()
    current_prices = pd.read_csv('data/coingecko/current_prices.csv')
    return render_template('index.html', prices=current_prices, intervals=intervals, crypto_ids=crypto_ids)

@app.route('/historical/<crypto_id>')
def crypto_page(crypto_id):
    current_prices = pd.read_csv('data/coingecko/current_prices.csv')
    historical_data = pd.read_csv(f'data/coingecko/{crypto_id}_prices.csv')

    historical_data_copy = historical_data.copy()

    historical_data_copy['timestamp'] = pd.to_datetime(historical_data_copy['timestamp']) # convert to datetime
    historical_data_copy['timestamp'] = historical_data_copy['timestamp'].dt.strftime('%m-%d %H:%M')
    
    graph_url = plot_prices_over_time(historical_data_copy, crypto_id)

    current_prices = current_prices[current_prices['crypto'] == crypto_id] 

    return render_template('crypto_page.html', current_price=current_prices.iloc[0]['price'], historical_data=historical_data, crypto_id=crypto_id, graph_url=graph_url)

@app.route('/kLine/chart', methods=['GET'])
def kline_chart():
    crypto_id = request.args.get('crypto_id')
    interval = request.args.get('interval')

    kline_data = pd.read_csv(f'data/binance/{crypto_id}/{interval}.csv')
    kline_html = plot_klines(kline_data, interval, crypto_id)

    return render_template('kline_chart.html', kline_html=kline_html, interval=interval, crypto_id=crypto_id)

"""
Route for the reload prices button.
"""
@app.route('/api/reload_prices_func', methods=['POST'])
def reload_prices_func():
    refresh_prices()
    return redirect(url_for('index'))

def refresh_prices():
    coingecko_data_collection.save_current_prices()
    load_current_prices()
 

@app.route('/api/get_data', methods=['POST'])
def get_data():
    selected_crypto = request.form['crypto']
    selected_interval = request.form['interval']

    return redirect(url_for('kline_chart', crypto_id=selected_crypto, interval=selected_interval))

"""
Cache to hold prices in memory for efficiency
"""
price_cache = {}
def load_current_prices():
    global price_cache
    price_cache['current_prices'] = pd.read_csv('data/coingecko/current_prices.csv')
    price_cache['last_refresh'] = time.time()

if __name__ == '__main__':
    #refresh_prices() # Fetch prices when website starts
    app.run(debug=True, port=5001)