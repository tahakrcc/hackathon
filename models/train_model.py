import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from tensorflow.keras.callbacks import EarlyStopping


# --- 1. VERİ HAZIRLAMA ---
features = ['Bt', 'Bz', 'Speed', 'Density']
target = 'SymH'


def load_old_data(file_path):
    """Eski OMNI LST formatı (14 sütun, boşlukla ayrılmış)"""
    cols = ['Year', 'Day', 'Hr', 'Min', 'ID', 'Bt', 'Bz', 'Speed', 'Density', 'Pressure', 'Ey', 'Proton10', 'SymH', 'AsyH']
    df = pd.read_csv(file_path, sep=r'\s+', header=None, names=cols)
    df.replace([999.9, 9999.0, 99.99, 999.99, 99999, 99999.0], np.nan, inplace=True)
    return df[features + [target]]


def load_hapi_data(file_path):
    """Yeni CDAWeb HAPI CSV formatı (Timestamp, Bt, Bz, Speed, Density, SymH)"""
    df = pd.read_csv(file_path, header=None, skiprows=1,
                     names=['Timestamp', 'Bt', 'Bz', 'Speed', 'Density', 'SymH'])
    for col in features + [target]:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    # HAPI fill values (çok büyük değerler)
    for col in features:
        df.loc[df[col].abs() > 9000, col] = np.nan
    return df[features + [target]]


# --- 2. VERİ YÜKLEME VE BİRLEŞTİRME ---
print("📂 Eski veri yükleniyor (2015)...")
df_old = load_old_data(r"datasets\omni_5min_Vr6D6lEveS.lst")
print(f"   {len(df_old)} satır, WARNING: {((df_old['SymH']<-50)&(df_old['SymH']>=-100)).sum()}, CRITICAL: {(df_old['SymH']<-100).sum()}")

print("📂 Yeni veri yükleniyor (2024-2025)...")
df_new = load_hapi_data(r"datasets\omni_5min_2024_2025_full.csv")
print(f"   {len(df_new)} satır, WARNING: {((df_new['SymH']<-50)&(df_new['SymH']>=-100)).sum()}, CRITICAL: {(df_new['SymH']<-100).sum()}")

# Birleştir
df = pd.concat([df_old, df_new], ignore_index=True)
print(f"\n🔗 Birleştirilmiş veri: {len(df)} satır")

# SymH clip
df['SymH'] = df['SymH'].clip(lower=-400, upper=100)

# Eksikleri doldur
df = df.interpolate(method='linear').ffill().bfill()

print(f"   SymH min: {df['SymH'].min():.0f}, max: {df['SymH'].max():.0f}")
print(f"   NORMAL: {(df['SymH']>=-50).sum()}, WARNING: {((df['SymH']<-50)&(df['SymH']>=-100)).sum()}, CRITICAL: {(df['SymH']<-100).sum()}")

# --- 3. ÖLÇEKLEME ---
scaler_x = MinMaxScaler(feature_range=(0, 1))
scaler_y = MinMaxScaler(feature_range=(0, 1))

x_scaled = scaler_x.fit_transform(df[features])
y_scaled = scaler_y.fit_transform(df[[target]])

joblib.dump(scaler_x, 'scaler_x.pkl')
joblib.dump(scaler_y, 'scaler_y.pkl')
print("✅ Scaler'lar kaydedildi.")
print(f"   scaler_y aralığı: [{scaler_y.data_min_[0]:.0f}, {scaler_y.data_max_[0]:.0f}]")


# --- 4. PENCERE OLUŞTURMA ---
def create_windows(data_x, data_y, window_size=12):
    X, y = [], []
    for i in range(len(data_x) - window_size):
        X.append(data_x[i: i + window_size])
        y.append(data_y[i + window_size])
    return np.array(X), np.array(y)


X_train, y_train = create_windows(x_scaled, y_scaled, window_size=12)
print(f"\n🚀 Veri hazır! Şekil: {X_train.shape}")

# --- 5. MODEL MİMARİSİ ---
model = Sequential([
    Input(shape=(12, 4)),
    LSTM(128, return_sequences=True),
    Dropout(0.2),
    LSTM(64),
    Dropout(0.1),
    Dense(32, activation='relu'),
    Dense(16, activation='relu'),
    Dense(1, activation='linear')
])

model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# --- 6. EĞİTİM ---
early_stop = EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)
model.fit(X_train, y_train, epochs=20, batch_size=256, validation_split=0.1, verbose=1, callbacks=[early_stop])

model.save('solar_storm_model.keras')
print("✅ Yeni model ve temiz scaler'lar kaydedildi!")