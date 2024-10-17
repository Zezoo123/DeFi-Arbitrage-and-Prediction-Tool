import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib
import plotly.graph_objects as go
import plotly.io as pio
import pandas as pd
from io import BytesIO
import base64
import mplfinance as mpf
import datetime

def plot_prices_over_time(historical_data, crypto_id):
    matplotlib.use('Agg')
    img = BytesIO()


    plt.figure(figsize=(12, 7))
    plt.plot(historical_data['timestamp'], historical_data['price'], label=f'{crypto_id.capitalize()} Price')

    plt.xticks(historical_data['timestamp'][::15], rotation=45)
    
    plt.xlabel('Date')
    plt.ylabel('Price (USD)')
    plt.title(f'{crypto_id.capitalize()} Price Over Time')
    plt.legend()
    plt.grid(True)

    # Save the plot
    plt.savefig(img, format='png')
    plt.close('all')

    # Move the pointer to the start of img
    img.seek(0)

    # Encode the plot as a base64 image
    graph_url = base64.b64encode(img.getvalue()).decode()

    return f"data:image/png;base64,{graph_url}"

def plot_klines(kline_data, interval, crypto_id):
    fig = go.Figure(data=[go.Candlestick(x=pd.to_datetime(kline_data['Open Time']),
                open=kline_data['Open'],
                high=kline_data['High'],
                low=kline_data['Low'],
                close=kline_data['Close'])])
    
    fig.update_layout(title=f'{crypto_id.capitalize()} {interval} Klines',
                      xaxis_title='Date',
                      yaxis_title='Price (USD)')

    #return pio.to_html(fig, full_html=False)
    fig.show()
# Example usage
file_path = 'data/binance/BTC/1d.csv'
crypto_id = 'BTC'
interval = '1d'
historical_data = pd.read_csv(file_path)

plot_klines(historical_data, interval, crypto_id)