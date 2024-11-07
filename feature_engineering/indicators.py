import pandas as pd

def simple_moving_average(df: pd.DataFrame, column_name: str, window: int) -> pd.DataFrame:
    """
    Calculates the Simple Moving Average (SMA) for a given column in the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        column_name (str): The column on which to calculate the SMA.
        window (int): The number of periods to use for the SMA calculation.

    Returns:
        pd.DataFrame: DataFrame with an additional column for the calculated SMA.
    """
    df[f'SMA_{window}'] = df[column_name].rolling(window=window).mean()
    return df

def momentum(df: pd.DataFrame, column_name: str, window: int) -> pd.DataFrame:
    """
    Calculates the Momentum (MTM) for a given column in the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        column_name (str): The column on which to calculate momentum.
        window (int): The number of periods over which to calculate the momentum.

    Returns:
        pd.DataFrame: DataFrame with an additional column for the calculated Momentum.
    """
    df[f'MTM_{window}'] = df[column_name].diff(window)
    return df

def exponential_moving_average(df: pd.DataFrame, column_name: str, span: int) -> pd.DataFrame:
    """
    Calculates the Exponential Moving Average (EMA) for a given column in the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        column_name (str): The column on which to calculate the EMA.
        span (int): The span (smoothing factor) for the EMA calculation.

    Returns:
        pd.DataFrame: DataFrame with an additional column for the calculated EMA.
    """
    df[f'EMA_{span}'] = df[column_name].ewm(span=span, adjust=False).mean()
    return df

def bollinger_bands(df: pd.DataFrame, column_name: str, window: int) -> pd.DataFrame:
    """
    Calculates Bollinger Bands for a given column in the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        column_name (str): The column on which to calculate Bollinger Bands.
        window (int): The number of periods over which to calculate the moving average and standard deviation.

    Returns:
        pd.DataFrame: DataFrame with additional columns for the Moving Average (MA),
                      Upper Band (UB), and Lower Band (LB) of the Bollinger Bands.
    """
    df['MA'] = df[column_name].rolling(window=window).mean()
    df['STD'] = df[column_name].rolling(window=window).std()
    df['UB'] = df['MA'] + (df['STD'] * 2)
    df['LB'] = df['MA'] - (df['STD'] * 2)
    return df

def macd(df: pd.DataFrame, column_name: str, span_short: int = 12, span_long: int = 26, span_signal: int = 9) -> pd.DataFrame:
    """
    Calculates the Moving Average Convergence Divergence (MACD) and Signal Line for a given column in the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        column_name (str): The column on which to calculate MACD.
        span_short (int): The span for the short-term EMA (default is 12).
        span_long (int): The span for the long-term EMA (default is 26).
        span_signal (int): The span for the signal line EMA (default is 9).

    Returns:
        pd.DataFrame: DataFrame with additional columns for the MACD and Signal Line.
    """
    df['EMA_short'] = df[column_name].ewm(span=span_short, adjust=False).mean()
    df['EMA_long'] = df[column_name].ewm(span=span_long, adjust=False).mean()
    df['MACD'] = df['EMA_short'] - df['EMA_long']
    df['Signal_Line'] = df['MACD'].ewm(span=span_signal, adjust=False).mean()
    return df

def rsi(df: pd.DataFrame, column_name: str, window: int) -> pd.DataFrame:
    """
    Calculates the Relative Strength Index (RSI) for a given column in the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        column_name (str): The column on which to calculate the RSI.
        window (int): The number of periods to use for the RSI calculation.

    Returns:
        pd.DataFrame: DataFrame with an additional column for the calculated RSI.
    """
    delta = df[column_name].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    df[f'RSI_{window}'] = 100 - (100 / (1 + rs))
    return df

def stochastic_oscillator(df: pd.DataFrame, window: int) -> pd.DataFrame:
    """
    Calculates the Stochastic Oscillator for the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        window (int): The number of periods to use for the Stochastic Oscillator calculation.

    Returns:
        pd.DataFrame: DataFrame with an additional column for the calculated Stochastic Oscillator.
    """
    lowest_low = df['Low'].rolling(window=window).min()
    highest_high = df['High'].rolling(window=window).max()
    df[f'Stoch_Osc_{window}'] = (df['Close'] - lowest_low) / (highest_high - lowest_low) * 100
    return df

def atr(df: pd.DataFrame, window: int) -> pd.DataFrame:
    """
    Calculates the Average True Range (ATR) for the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        window (int): The number of periods to use for the ATR calculation.

    Returns:
        pd.DataFrame: DataFrame with an additional column for the calculated ATR.
    """
    high_low = df['High'] - df['Low']
    high_close = np.abs(df['High'] - df['Close'].shift())
    low_close = np.abs(df['Low'] - df['Close'].shift())
    true_range = high_low.combine(high_close, max).combine(low_close, max)
    df[f'ATR_{window}'] = true_range.rolling(window=window).mean()
    return df

def obv(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculates the On-Balance Volume (OBV) for the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.

    Returns:
        pd.DataFrame: DataFrame with an additional column for the calculated OBV.
    """
    df['OBV'] = (np.sign(df['Close'].diff()) * df['Volume']).fillna(0).cumsum()
    return df

import pandas as pd
import numpy as np

def simple_moving_average(df: pd.DataFrame, column_name: str, window: int) -> pd.DataFrame:
    """
    Calculates the Simple Moving Average (SMA) for a given column in the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        column_name (str): The column on which to calculate the SMA.
        window (int): The number of periods to use for the SMA calculation.

    Returns:
        pd.DataFrame: DataFrame with an additional column for the calculated SMA.
    """
    df[f'SMA_{window}'] = df[column_name].rolling(window=window).mean()
    return df

def momentum(df: pd.DataFrame, column_name: str, window: int) -> pd.DataFrame:
    """
    Calculates the Momentum (MTM) for a given column in the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        column_name (str): The column on which to calculate the MTM.
        window (int): The number of periods to use for the MTM calculation.

    Returns:
        pd.DataFrame: DataFrame with an additional column for the calculated MTM.
    """
    df[f'MTM_{window}'] = df[column_name].diff(window)
    return df

def add_time_based_features(df: pd.DataFrame, datetime_column: str) -> pd.DataFrame:
    """
    Adds time-based features (day of the week, hour of the day, month of the year) to the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        datetime_column (str): The column containing datetime information.

    Returns:
        pd.DataFrame: DataFrame with additional columns for the time-based features.
    """
    df[datetime_column] = pd.to_datetime(df[datetime_column])
    df['Day_of_Week'] = df[datetime_column].dt.dayofweek
    df['Hour_of_Day'] = df[datetime_column].dt.hour
    df['Month_of_Year'] = df[datetime_column].dt.month
    return df

def cci(df: pd.DataFrame, window: int) -> pd.DataFrame:
    """
    Calculates the Commodity Channel Index (CCI) for the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        window (int): The number of periods to use for the CCI calculation.

    Returns:
        pd.DataFrame: DataFrame with an additional column for the calculated CCI.
    """
    typical_price = (df['High'] + df['Low'] + df['Close']) / 3
    sma = typical_price.rolling(window=window).mean()
    mean_deviation = typical_price.rolling(window=window).apply(lambda x: np.mean(np.abs(x - np.mean(x))))
    df[f'CCI_{window}'] = (typical_price - sma) / (0.015 * mean_deviation)
    return df

def williams_r(df: pd.DataFrame, window: int) -> pd.DataFrame:
    """
    Calculates the Williams %R for the DataFrame.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the data.
        window (int): The number of periods to use for the Williams %R calculation.

    Returns:
        pd.DataFrame: DataFrame with an additional column for the calculated Williams %R.
    """
    highest_high = df['High'].rolling(window=window).max()
    lowest_low = df['Low'].rolling(window=window).min()
    df[f'Williams_%R_{window}'] = (highest_high - df['Close']) / (highest_high - lowest_low) * -100
    return df