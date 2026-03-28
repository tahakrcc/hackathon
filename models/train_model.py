import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input


# --- 1. VERİ HAZIRLAMA (GÜVENLİ VE TEMİZ) ---
def prepare_data(file_path):
    cols = ['Year', 'Day', 'Hr', 'Min', 'Bt', 'Bz', 'Speed', 'Density', 'Pressure', 'Ey', 'Proton10', 'SymH']
    df = pd.read_csv(file_path, sep=r'\s+', skiprows=54, names=cols)

    # A. NASA'nın hata kodlarını NaN yap
    df.replace([999.9, 9999.0, 99.99, 999.99, 99999, 99999.0], np.nan, inplace=True)

    # B. KRİTİK: SymH değerini gerçekçi sınırlara hapset (Terazi bozulmasın diye)
    # SymH fiziksel olarak nadiren -400'ün altına iner, 100'ün üstüne çıkmaz.
    df['SymH'] = df['SymH'].clip(lower=-400, upper=100)

    # C. Eksikleri doldur
    df = df.interpolate(method='linear').ffill().bfill()

    # Özellik seçimi
    features = ['Bt', 'Bz', 'Speed', 'Density']
    target = 'SymH'

    # İKİ AYRI SCALER
    scaler_x = MinMaxScaler(feature_range=(0, 1))
    scaler_y = MinMaxScaler(feature_range=(0, 1))

    # Ölçeklendirme
    x_scaled = scaler_x.fit_transform(df[features])
    y_scaled = scaler_y.fit_transform(df[[target]])

    # Scaler'ları kaydet
    joblib.dump(scaler_x, 'scaler_x.pkl')
    joblib.dump(scaler_y, 'scaler_y.pkl')
    print("✅ Scaler'lar (x ve y) temizlenmiş veriyle kaydedildi.")

    return x_scaled, y_scaled


def create_windows(data_x, data_y, window_size=12):
    X, y = [], []
    for i in range(len(data_x) - window_size):
        X.append(data_x[i: i + window_size])
        y.append(data_y[i + window_size])
    return np.array(X), np.array(y)


# --- 2. VERİ YÜKLEME ---
path = r"C:\Users\temel\hackathon\models\datasets\omni_5min_Vr6D6lEveS.lst"
x_raw, y_raw = prepare_data(path)
X_train, y_train = create_windows(x_raw, y_raw, window_size=12)

print(f"🚀 Veri hazır! Şekil: {X_train.shape}")

# --- 3. MODEL MİMARİSİ ---
model = Sequential([
    Input(shape=(12, 4)),
    LSTM(64, return_sequences=True),
    Dropout(0.1),
    LSTM(32),
    Dense(16, activation='relu'),
    # Çıkış 0-1 arasına sigmoid ile hapsedildi
    Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# --- 4. EĞİTİM ---
# Epoch 3-5 arası yeterli olacaktır.
model.fit(X_train, y_train, epochs=3, batch_size=2048, validation_split=0.1, verbose=1)

model.save('solar_storm_model.keras')
print("✅ Yeni model ve temiz scaler'lar kaydedildi!")