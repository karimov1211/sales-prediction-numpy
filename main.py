from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import numpy as np
import uvicorn

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.post("/predict")
async def predict_sales(data: dict):
    try:
        sotuvlar_list = data.get("sales", [])
        if len(sotuvlar_list) != 12:
            return {"error": "12 oylik ma'lumot kiritilishi shart!"}
            
        oylar = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        sotuvlar = np.array(sotuvlar_list, dtype=float)
        
        koeffitsiyentlar = np.polyfit(oylar, sotuvlar, 1)
        m = koeffitsiyentlar[0]
        c = koeffitsiyentlar[1]
        
        keyingi_oy = 13
        prognoz_qiymat = np.polyval(koeffitsiyentlar, keyingi_oy)
        trend_chizigi = np.polyval(koeffitsiyentlar, oylar).tolist()
        
        return {
            "success": True,
            "equation": f"y = {m:.2f}x + {c:.2f}",
            "prediction": round(prognoz_qiymat, 2),
            "trend": trend_chizigi,
            "labels": oylar.tolist(),
            "actuals": sotuvlar.tolist(),
            "next_month": keyingi_oy
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
