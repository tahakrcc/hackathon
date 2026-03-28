import pandas as pd
import numpy as np

df = pd.read_csv('datasets/omni_5min_2024_2025_full.csv')
print(f"Satir: {len(df)}")
print(f"Sutunlar: {list(df.columns)}")

# Rename
df.columns = ['Timestamp', 'Bt', 'Bz', 'Speed', 'Density', 'SymH']

# Fill values (HAPI uses 1e31 or 9999.99)
for col in ['Bt','Bz','Speed','Density','SymH']:
    df[col] = pd.to_numeric(df[col], errors='coerce')
    df.loc[df[col].abs() > 9000, col] = np.nan

print(f"\n--- Bz ---")
print(df['Bz'].describe().to_string())
print(f"NaN: {df['Bz'].isna().sum()}")

print(f"\n--- SymH ---")
print(df['SymH'].describe().to_string())
print(f"NaN: {df['SymH'].isna().sum()}")
print(f"NORMAL(>=-50): {(df['SymH']>=-50).sum()}")
print(f"WARNING(-100~-50): {((df['SymH']<-50)&(df['SymH']>=-100)).sum()}")
print(f"CRITICAL(<-100): {(df['SymH']<-100).sum()}")
