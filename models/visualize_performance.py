import matplotlib.pyplot as plt
import joblib
import pandas as pd
import numpy as np
import tensorflow as tf

# 1. Yüklemeler
model = tf.keras.models.load_model('solar_storm_model.keras', compile=False)
scaler_x = joblib.load('scaler_x.pkl')
scaler_y = joblib.load('scaler_y.pkl')


def plot_storm_prediction(file_path, num_points=200):
    cols = ['Year', 'Day', 'Hr', 'Min', 'Bt', 'Bz', 'Speed', 'Density', 'Pressure', 'Ey', 'Proton10', 'SymH']
    df = pd.read_csv(file_path, sep=r'\s+', skiprows=54, names=cols)
    df.replace([999.9, 9999.0, 99.99, 999.99, 99999], np.nan, inplace=True)
    df['SymH'] = df['SymH'].clip(lower=-400, upper=100)
    df = df.interpolate().ffill().bfill()

    features = ['Bt', 'Bz', 'Speed', 'Density']

    # Test için son num_points kadar veriyi alalım
    test_df = df.iloc[-(num_points + 12):]

    actuals = []
    predictions = []

    print("Grafik hazırlanıyor, tahminler yapılıyor...")
    for i in range(num_points):
        window = test_df[features].iloc[i: i + 12]
        scaled_input = scaler_x.transform(window)
        model_input = np.expand_dims(scaled_input, axis=0)

        pred_scaled = model.predict(model_input, verbose=0)
        pred_final = scaler_y.inverse_transform(pred_scaled)

        predictions.append(pred_final[0][0])
        actuals.append(test_df['SymH'].iloc[i + 12])

    # --- ÇİZİM ---
    plt.figure(figsize=(14, 7))
    plt.plot(actuals, label='Gerçek SYM/H (Gözlemlenen)', color='blue', linewidth=2, alpha=0.7)
    plt.plot(predictions, label='İnönüAI Tahmini', color='red', linestyle='--', linewidth=2)

    plt.axhline(y=-50, color='orange', linestyle=':', label='G1 Fırtına Eşiği')
    plt.axhline(y=-100, color='darkred', linestyle=':', label='G3 Şiddetli Fırtına')

    plt.title('Güneş Fırtınası Erken Uyarı Sistemi - Tahmin Performansı', fontsize=16)
    plt.xlabel('Zaman (5 Dakikalık Periyotlar)', fontsize=12)
    plt.ylabel('SYM/H Endeksi (nT)', fontsize=12)
    plt.legend()
    plt.grid(True, which='both', linestyle='--', alpha=0.5)

    # Grafiği kaydet (Sunumda kullanmak için)
    plt.savefig('firtina_tahmin_basarisi.png', dpi=300)
    plt.show()


path = r"C:\Users\temel\hackathon\models\datasets\omni_5min_Vr6D6lEveS.lst"
plot_storm_prediction(path)