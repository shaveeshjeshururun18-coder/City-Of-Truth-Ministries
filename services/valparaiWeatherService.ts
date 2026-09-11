/**
 * Valparai Hill Station Live Weather Service
 * Integrates with Open-Meteo REST API (CORS-enabled, free, no API key required)
 * Coordinates: 10.3264° N, 76.9554° E (Elevation ~1,094m)
 * Caches in localStorage for 30 minutes with instant offline fallback.
 */

export interface ValparaiWeather {
    temperature: number; // in °C
    condition: string;
    conditionTamil: string;
    windspeed: number; // in km/h
    elevation: number; // in meters
    isDay: boolean;
    weatherCode: number;
    iconType: 'sun' | 'cloud' | 'rain' | 'cloud-rain' | 'mist' | 'storm';
    updatedAt: string;
    source: 'api' | 'cached' | 'fallback';
}

const CACHE_KEY = 'cot_valparai_weather_cache_v1';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// WMO Weather interpretation codes (WW)
function interpretWeatherCode(code: number): { condition: string; conditionTamil: string; icon: ValparaiWeather['iconType'] } {
    if (code === 0) return { condition: 'Clear Sky', conditionTamil: 'தெளிவான வானம்', icon: 'sun' };
    if (code === 1 || code === 2) return { condition: 'Partly Cloudy', conditionTamil: 'பகுதி மேகமூட்டம்', icon: 'cloud' };
    if (code === 3) return { condition: 'Overcast & Misty', conditionTamil: 'பனிமூட்டம் மற்றும் மேகமூட்டம்', icon: 'mist' };
    if (code >= 45 && code <= 48) return { condition: 'Dense Hill Fog', conditionTamil: 'அடர்ந்த மலைப் பனி', icon: 'mist' };
    if (code >= 51 && code <= 55) return { condition: 'Gentle Drizzle', conditionTamil: 'மெல்லிய தூறல்', icon: 'rain' };
    if (code >= 61 && code <= 65) return { condition: 'Mountain Rain', conditionTamil: 'மலைச்சாரல் மழை', icon: 'cloud-rain' };
    if (code >= 80 && code <= 82) return { condition: 'Heavy Hill Shower', conditionTamil: 'கனமழை பொழிவு', icon: 'cloud-rain' };
    if (code >= 95) return { condition: 'Mountain Thunderstorm', conditionTamil: 'இடியுடன் கூடிய மழை', icon: 'storm' };
    return { condition: 'Misty Hill Climate', conditionTamil: 'குளிர்ந்த மலைக் காற்று', icon: 'mist' };
}

export async function fetchValparaiWeather(): Promise<ValparaiWeather> {
    // 1. Check local cache
    try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
                return { ...cached.data, source: 'cached' };
            }
        }
    } catch {
        // Fall through on cache read error
    }

    // 2. Fetch from Open-Meteo
    try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=10.3264&longitude=76.9554&current_weather=true';
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

        if (response.ok) {
            const json = await response.json();
            const cw = json.current_weather;
            const code = cw.weathercode ?? 3;
            const meta = interpretWeatherCode(code);

            const result: ValparaiWeather = {
                temperature: Math.round((cw.temperature ?? 19.2) * 10) / 10,
                condition: meta.condition,
                conditionTamil: meta.conditionTamil,
                windspeed: Math.round(cw.windspeed ?? 7),
                elevation: Math.round(json.elevation ?? 1094),
                isDay: cw.is_day === 1,
                weatherCode: code,
                iconType: meta.icon,
                updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                source: 'api'
            };

            // Save to cache
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    data: result
                }));
            } catch {}

            return result;
        }
    } catch (err) {
        console.warn('Valparai Open-Meteo API unreachable, using safe hill station fallback.', err);
    }

    // 3. Safe fallback for Valparai hill station (famous for 18-20°C year-round mist)
    return {
        temperature: 19.4,
        condition: 'Misty & Breezy',
        conditionTamil: 'பனிமூட்டம் மற்றும் தென்றல்',
        windspeed: 8,
        elevation: 1094,
        isDay: true,
        weatherCode: 3,
        iconType: 'mist',
        updatedAt: 'Live',
        source: 'fallback'
    };
}
