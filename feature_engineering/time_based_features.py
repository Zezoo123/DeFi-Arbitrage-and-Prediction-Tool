import pandas as pd
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