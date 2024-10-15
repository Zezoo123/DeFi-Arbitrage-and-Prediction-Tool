import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib
import pandas as pd
from io import BytesIO
import base64

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
