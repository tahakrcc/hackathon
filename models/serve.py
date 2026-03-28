import os
import tensorflow as tf
import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn

app = FastAPI(title="Solar Sentinel AI", version="1.0.0", description="Sym/H prediction using LSTM")

# Setup paths (ensure we are loading relative to this script's location)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'solar_storm_model.keras')
SCALER_X_PATH = os.path.join(BASE_DIR, 'scaler_x.pkl')
SCALER_Y_PATH = os.path.join(BASE_DIR, 'scaler_y.pkl')

print("==============================================")
print("Yapay Zeka Modeli ve Scaler'lar yükleniyor...")
try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    scaler_x = joblib.load(SCALER_X_PATH)
    scaler_y = joblib.load(SCALER_Y_PATH)
    print("✅ Sistem HAZIR: Model ve Temiz Scaler'lar başarıyla yüklendi!")
except Exception as e:
    print(f"❌ Yükleme Hatası: {e}. Dosyaların models/ dizininde olduğundan emin olun.")
print("==============================================")

# Input Verification Structure (FastAPI needs to know what it'll receive)
class SolarDataWindow(BaseModel):
    bt: float
    bz: float
    speed: float
    density: float

class PredictionRequest(BaseModel):
    # Expect exactly 12 windows for the time series
    history_windows: List[SolarDataWindow]

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Solar Sentinel AI is running."}

@app.post("/api/predict")
def predict_symh(request: PredictionRequest):
    if len(request.history_windows) != 12:
        raise HTTPException(
            status_code=400, 
            detail=f"Model requires exactly 12 windows of 5-minute data (1 hour total). Received: {len(request.history_windows)}"
        )

    # Convert incoming request to DataFrame format like training
    data_dicts = [{"Bt": w.bt, "Bz": w.bz, "Speed": w.speed, "Density": w.density} for w in request.history_windows]
    df = pd.DataFrame(data_dicts)
    features = ['Bt', 'Bz', 'Speed', 'Density']

    # Scale the input
    try:
        scaled_input = scaler_x.transform(df[features])
        # Reshape to (1, 12, 4) -> (batch_size, time_steps, features)
        model_ready = np.expand_dims(scaled_input, axis=0)

        # Run Prediction
        pred_scaled = model.predict(model_ready, verbose=0)

        # Inverse transform to get actual Sym/H value
        pred_final = scaler_y.inverse_transform(pred_scaled)
        predicted_symh = float(pred_final[0][0])

        # Confidence heuristic (Logic based on data stability)
        # If Bt jumps drastically or Speed is highly volatile, we might have higher uncertainty.
        speed_volatility = df['Speed'].std()
        confidence = max(50.0, 98.4 - (speed_volatility / 100.0) if pd.notna(speed_volatility) else 90.0)

        # Level detection for SymH
        # Sym/H < -100: Severe (Superstorm)
        # Sym/H < -50: Moderate (Storm)
        # Sym/H >= -50: Quiet
        if predicted_symh < -100:
            level = "CRITICAL"
        elif predicted_symh < -50:
            level = "WARNING"
        else:
            level = "NORMAL"

        return {
            "predicted_symh": predicted_symh,
            "confidence": round(float(confidence), 2),
            "level": level
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("serve:app", host="127.0.0.1", port=8000, reload=True)
