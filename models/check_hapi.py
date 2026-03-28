import urllib.request
import json

base = 'https://cdaweb.gsfc.nasa.gov/hapi'
url = base + '/info?id=OMNI_HRO2_5MIN'
resp = urllib.request.urlopen(url, timeout=30)
info = json.loads(resp.read().decode())

print("ALL parameters:")
for p in info['parameters']:
    print(f"  {p['name']}")
