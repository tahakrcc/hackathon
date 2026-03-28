import pandas as pd
import numpy as np
import joblib
import tensorflow as tf
import sys

# Yeni HAPI CSV verisini yukle
df = pd.read_csv(r'datasets\omni_5min_2024_2025_full.csv', header=None, skiprows=1, names=['Timestamp', 'Bt', 'Bz', 'Speed', 'Density', 'SymH'])

features = ['Bt', 'Bz', 'Speed', 'Density']
target = 'SymH'

# Temizleme
for col in features + [target]:
    df[col] = pd.to_numeric(df[col], errors='coerce')
for col in features:
    df.loc[df[col].abs() > 9000, col] = np.nan
    
df['SymH'] = df['SymH'].clip(lower=-400, upper=100)
df = df.interpolate(method='linear').ffill().bfill()

# Model ve Scalerlar
model = tf.keras.models.load_model('solar_storm_model.keras', compile=False)
scaler_x = joblib.load('scaler_x.pkl')
scaler_y = joblib.load('scaler_y.pkl')

print("Veri test ediliyor...", len(df))

# Tüm veriyi test et (ya da son %20'yi)
split = int(len(df) * 0.8)
test_df = df[split:].reset_index(drop=True)

x_test_raw = scaler_x.transform(test_df[features])
x_test_raw = np.clip(x_test_raw, 0, 1)

X_test, y_real = [], []
for i in range(len(x_test_raw) - 12):
    X_test.append(x_test_raw[i:i+12])
    y_real.append(test_df['SymH'].iloc[i+12])

X_test = np.array(X_test)
y_real = np.array(y_real)

preds_scaled = model.predict(X_test, verbose=0)
preds_scaled = np.clip(preds_scaled, 0, 1)
preds = scaler_y.inverse_transform(preds_scaled).flatten()

mae = np.mean(np.abs(y_real - preds))
rmse = np.sqrt(np.mean((y_real - preds)**2))
corr = np.corrcoef(y_real, preds)[0, 1]

def get_level(v):
    if v < -100: return 'CRITICAL'
    elif v < -50: return 'WARNING'
    else: return 'NORMAL'

correct = sum(1 for r, p in zip(y_real, preds) if get_level(r) == get_level(p))
acc = correct / len(y_real) * 100

lines = []
lines.append('=' * 50)
lines.append(f'TEST SONUCLARI ({len(y_real)} ornek)')
lines.append('=' * 50)
lines.append(f'MAE  (Ort. Mutlak Hata) : {mae:.2f} nT')
lines.append(f'RMSE (Kok Ort. Kare Hata): {rmse:.2f} nT')
lines.append(f'Korelasyon (r)           : {corr:.4f}')
lines.append('')
lines.append(f'Seviye Dogrulugu: {acc:.1f}% ({correct}/{len(y_real)})')

for lv in ['NORMAL', 'WARNING', 'CRITICAL']:
    total = sum(1 for r in y_real if get_level(r) == lv)
    hit = sum(1 for r, p in zip(y_real, preds) if get_level(r) == lv and get_level(p) == lv)
    if total > 0:
        lines.append(f'  {lv:10}: {hit}/{total} dogru ({hit/total*100:.1f}%)')
    else:
        lines.append(f'  {lv:10}: veri yok')

# Kritik olaylari goster
cr_idx = [i for i, r in enumerate(y_real) if get_level(r) == 'CRITICAL'][:5]
wa_idx = [i for i, r in enumerate(y_real) if get_level(r) == 'WARNING'][:5]
no_idx = [i for i, r in enumerate(y_real) if get_level(r) == 'NORMAL'][:5]

lines.append('')
lines.append('Ornek Tahminler:')
header = f'{"Gercek":>10} {"Tahmin":>10} {"Fark":>8} {"G.Seviye":>12} {"T.Seviye":>12}'
lines.append(header)
for i in cr_idx + wa_idx + no_idx:
    r, p = y_real[i], preds[i]
    lines.append(f'{r:10.1f} {p:10.1f} {abs(r-p):8.1f} {get_level(r):>12} {get_level(p):>12}')

import json
json.dump(lines, open('test_new_lines.json','w'), ensure_ascii=False)
print("Test bitti, Sonuclar 'test_new_lines.json' altinda.")
