import requests
from skyfield.api import Topos, load, EarthSatellite
from datetime import datetime, timezone
import numpy as np

def track_starlinks():
    print("\n--- STARLINK GÜNEŞ/DÜNYA KONUM ANALİZİ ---\n")
    
    # 1. TLE verilerini çek
    url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle"
    try:
        response = requests.get(url)
        response.raise_for_status()
        tle_data = response.text.splitlines()
    except Exception as e:
        print(f"Veri çekme hatası: {e}")
        return

    # 2. Skyfield yüklemeleri (Ephemeris)
    ts = load.timescale()
    planets = load('de421.bsp')
    earth = planets['earth']
    sun = planets['sun']
    
    now = ts.now()

    # 3. Güneş'in Dünya merkezli konumu (ECI)
    sun_pos = earth.at(now).observe(sun).position.km

    # 4. İlk 10 uyduyu işle
    count = 0
    i = 0
    while count < 10 and i + 2 < len(tle_data):
        name = tle_data[i].strip()
        line1 = tle_data[i+1].strip()
        line2 = tle_data[i+2].strip()
        i += 3
        
        try:
            satellite = EarthSatellite(line1, line2, name, ts)
            
            # Uydunun Dünya merkezli konumu (ECI)
            sat_pos = satellite.at(now).position.km
            
            # Dot product (Noktasal çarpım)
            # Eğer sat_pos · sun_pos > 0 ise uydu Güneş tarafındadır.
            dot_product = np.dot(sat_pos, sun_pos)
            
            status = "GUNES_TARAFI" if dot_product > 0 else "DUNYA_ARKASI"
            
            print(f"Uydu: {name.ljust(25)} | ID: {str(satellite.model.satnum).ljust(6)} | Durum: {status}")
            count += 1
            
        except Exception:
            continue

if __name__ == "__main__":
    track_starlinks()
