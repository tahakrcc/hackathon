import tensorflow as tf
import numpy as np
import pandas as pd
import joblib

# 1. En güncel model ve temizlenmiş scaler'ları yükle
model = tf.keras.models.load_model('solar_storm_model.keras', compile=False)
scaler_x = joblib.load('scaler_x.pkl')
scaler_y = joblib.load('scaler_y.pkl')
print("✅ Model ve Temiz Scaler'lar yüklendi!")


def final_prediction_test(file_path):
    cols = ['Year', 'Day', 'Hr', 'Min', 'Bt', 'Bz', 'Speed', 'Density', 'Pressure', 'Ey', 'Proton10', 'SymH']
    df = pd.read_csv(file_path, sep=r'\s+', skiprows=54, names=cols)

    # Veriyi eğitimdekiyle aynı şekilde temizle ve sınırla
    df.replace([999.9, 9999.0, 99.99, 999.99, 99999], np.nan, inplace=True)
    df['SymH'] = df['SymH'].clip(lower=-400, upper=100)  # Terazi ayarı
    df = df.interpolate(method='linear').ffill().bfill()

    features = ['Bt', 'Bz', 'Speed', 'Density']

    # Son 12 satırı al
    last_window = df[features].iloc[-12:]
    scaled_input = scaler_x.transform(last_window)

    # Modele hazırla (1, 12, 4)
    model_ready = np.expand_dims(scaled_input, axis=0)

    # --- TAHMİN ---
    pred_scaled = model.predict(model_ready, verbose=0)

    # Normalize sonucu gerçek SymH birimine çevir
    pred_final = scaler_y.inverse_transform(pred_scaled)

    actual_val = df['SymH'].iloc[-1]
    return pred_final[0][0], actual_val


# --- SONUCU GÖR ---
path = r"C:\Users\temel\hackathon\models\datasets\omni_5min_Vr6D6lEveS.lst"
prediction, actual = final_prediction_test(path)

print("\n" + "=" * 40)
print(f"🌍 GERÇEK SYM/H : {actual}")
print(f"🤖 MODEL TAHMİNİ : {prediction:.4f}")
print("=" * 40)

if abs(prediction - actual) < 10:
    print("🎯 BAŞARILI: Model gerçeğe çok yakın sonuç üretiyor!")
else:
    print("📈 Trend yakalanıyor, model stabil çalışıyor.")