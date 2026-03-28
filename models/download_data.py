import urllib.request

base = 'https://cdaweb.gsfc.nasa.gov/hapi'

# Only the 5 params we actually need - skip problematic ones
params = 'F,BZ_GSM,flow_speed,proton_density,SYM_H'

url = f"{base}/data?id=OMNI_HRO2_5MIN&time.min=2024-01-01T00:00:00Z&time.max=2025-12-31T23:59:59Z&parameters={params}&format=csv"

print("Downloading 2024-2025 OMNI data (Bt, Bz, Speed, Density, SymH)...")

req = urllib.request.Request(url)
resp = urllib.request.urlopen(req, timeout=300)
data = resp.read().decode('utf-8', errors='replace')

print(f"Downloaded {len(data)} bytes")

lines = data.strip().split('\n')
print(f"Total lines: {len(lines)}")

# Show first 5 lines
for l in lines[:5]:
    print(l)

# Save
outpath = 'datasets/omni_5min_2024_2025_full.csv'
with open(outpath, 'w', encoding='utf-8') as f:
    f.write(data)
print(f"\nSaved to {outpath}")
