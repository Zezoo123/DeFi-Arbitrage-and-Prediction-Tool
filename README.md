# DeFi-Arbitrage-and-Prediction-Tool


## Running the project

Run the flask application using:
```bash
python3 app.py
```

## Exploring my machine learning and data science work

In the neural_networks folder you will see a simple Long-Short-Term-Memory (LSTM) implemented in lstm.py which produces a model which predicts prices using the price of crypto suprisingly well with a low error score

In my_model.py you will find a model which I create using a hybrid approach to predict prices.
my_model.py is much more advanced than the lstm and uses a combination of <i>ISOMAP</i> and <i>UMAP</i> features which are then gridsearched using the Random Forest Regressor (RF) and the Gradient Boosting Regressor (GBR).

## Arbitrage

In the arbitrage directory you can find a script smart_contract.py which uses functions from different files under the fetch folder, to generate the current prices on different exchanges. 