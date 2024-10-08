from flask import Flask, render_template
from data_collection import save_current_prices, save_prices_over_time
import pandas as pd

app = Flask(__name__)

# Route for the main page
@app.route('/')
def index():
    save_current_prices()
    current_prices = pd.read_csv('data/current_prices.csv')
    return render_template('index.html', prices=current_prices)

@app.route('/<crypto_id>')
def crypto_page(crypto_id):
    # save_current_prices(crypto_ids = [crypto_id])
    # save_prices_over_time(crypto_ids = [crypto_id])
    current_prices = pd.read_csv('data/current_prices.csv')
    historical_data = pd.read_csv(f'data/prices_over_time/{crypto_id}_prices.csv')
    
    return render_template('crypto_page.html', current_prices=current_prices, historical_data=historical_data, crypto_id=crypto_id)

if __name__ == '__main__':
    app.run(debug=True, port=5001)