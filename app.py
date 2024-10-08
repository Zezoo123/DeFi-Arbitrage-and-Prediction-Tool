from flask import Flask, render_template
from data_collection import save_current_prices
import pandas as pd

app = Flask(__name__)

# Route for the main page
@app.route('/')
def index():
    save_current_prices()
    current_prices = pd.read_csv('data/current_prices.csv')
    return render_template('index.html', prices=current_prices)

if __name__ == '__main__':
    app.run(debug=True, port=5001)