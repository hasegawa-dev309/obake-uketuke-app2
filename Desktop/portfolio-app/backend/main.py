from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/price/{ticker}")
def get_price(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        price = stock.info.get("currentPrice")
        return {"price": price}
    except Exception as e:
        return {"error": str(e)}
    
@app.get("/exchange-rate")
def get_exchange_rate():
    try:
        url = "https://api.exchangerate-api.com/v4/latest/USD"
        response = requests.get(url)
        data = response.json()
        return {"rate": data["rates"]["JPY"]}
    except Exception as e:
        return {"error": str(e)}