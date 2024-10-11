from flask import Flask, render_template, redirect, url_for, request
from data_collection import save_current_prices, save_prices_over_time
import pandas as pd

app = Flask(__name__)

# Route for the main page
@app.route('/')
def index():
    current_prices = pd.read_csv('data/current_prices.csv')
    return render_template('index.html', prices=current_prices)

@app.route('/historical/<crypto_id>')
def crypto_page(crypto_id):
    current_prices = pd.read_csv('data/current_prices.csv')
    historical_data = pd.read_csv(f'data/prices_over_time/{crypto_id}_prices.csv')
    
    return render_template('crypto_page.html', current_price=current_prices.iloc[0]['price'], historical_data=historical_data, crypto_id=crypto_id)

@app.route('/reload_prices_func', methods=['POST'])
def reload_prices_func():
    refresh_prices()
    return redirect(url_for('index'))

def refresh_prices():
    save_current_prices()
    save_prices_over_time()

if __name__ == '__main__':
    app.run(debug=True, port=5001)