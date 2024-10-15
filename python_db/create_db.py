from sqlite3 import connect

cryptos = ['ADA', 'BNB', 'BTC', 'ETH', 'ETH', 'LTC', 'XRP']

def create_database():
    global crpytos
    conn = connect('/Users/zezo/project/DeFi-Arbitrage-and-Prediction-Tool/data/crypto_data.db')
    cursor = conn.cursor()

    # Create table for current prices
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS current_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crypto_id TEXT NOT NULL,
        price REAL NOT NULL,
        api TEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

        # Create tables for each cryptocurrency
    for crypto in cryptos:
        table_name = f'historical_prices_{crypto}'
        cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS {table_name} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timeframe TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            open REAL NOT NULL,
            high REAL NOT NULL,
            low REAL NOT NULL,
            close REAL NOT NULL,
            volume REAL NOT NULL
        )
        ''')

    conn.commit()
    conn.close()
    print("Database and tables created successfully")

if __name__ == "__main__":
    create_database()