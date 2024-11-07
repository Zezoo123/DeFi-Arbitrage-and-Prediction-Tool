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
