import os
import json
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from groq import AsyncGroq

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

app = FastAPI(title="Aapli Kheti – Crop Intelligence API")
app.mount("/static", StaticFiles(directory="static"), name="static")
groq_client = AsyncGroq(api_key=GROQ_API_KEY)

GROQ_MODEL = "llama-3.3-70b-versatile"

# ─── Pydantic Models ───────────────────────────────────────────────

class CropDataInput(BaseModel):
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    water_availability: str
    lat: float
    lon: float

class MarketQuery(BaseModel):
    crops: list[str]
    region: str = "India"

class ROIQuery(BaseModel):
    crop: str
    area_acres: float
    investment_inr: float
    region: str = "India"

# ─── Helper: Fetch Weather ─────────────────────────────────────────

async def fetch_weather(lat: float, lon: float) -> dict:
    """Fetch weather from OpenWeather or return simulated data."""
    weather = {"temp": 25, "humidity": 60, "description": "clear sky", "wind_speed": 3.5, "icon": "01d", "feels_like": 26, "pressure": 1013, "simulated": False}

    if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == "your_openweather_api_key_here":
        weather["simulated"] = True
        return weather

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url)
        if res.status_code == 200:
            d = res.json()
            weather["temp"] = d.get("main", {}).get("temp", 25)
            weather["feels_like"] = d.get("main", {}).get("feels_like", 26)
            weather["humidity"] = d.get("main", {}).get("humidity", 60)
            weather["pressure"] = d.get("main", {}).get("pressure", 1013)
            weather["description"] = d.get("weather", [{}])[0].get("description", "clear sky")
            weather["icon"] = d.get("weather", [{}])[0].get("icon", "01d")
            weather["wind_speed"] = d.get("wind", {}).get("speed", 3.5)
            weather["city"] = d.get("name", "Unknown")
        else:
            weather["simulated"] = True
            print(f"Warning: OpenWeather API failed ({res.status_code}). Using simulated weather.")
    except Exception:
        weather["simulated"] = True
    return weather

# ─── Helper: Call Groq ─────────────────────────────────────────────

async def ask_groq(system_prompt: str, user_prompt: str) -> str:
    """Call Groq LLM and return the text response."""
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        raise HTTPException(status_code=500, detail="Groq API key is not configured.")
    try:
        completion = await groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            model=GROQ_MODEL,
        )
        return completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Routes ────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return FileResponse("templates/index.html")

# ── 1. Dashboard Weather ───────────────────────────────────────────

@app.get("/api/weather")
async def get_weather(lat: float = 19.076, lon: float = 72.8777):
    weather = await fetch_weather(lat, lon)
    return weather

# ── 2. Crop Recommendation ────────────────────────────────────────

@app.post("/api/recommend")
async def recommend_crop(data: CropDataInput):
    weather = await fetch_weather(data.lat, data.lon)

    prompt = f"""You are an expert agricultural AI advisor. Based on the following environmental data, recommend the top 3 most suitable crops to maximize yield and profitability.

For EACH crop provide:
- Crop Name
- Why it's suitable for these conditions
- Expected yield per acre
- Estimated profit margin
- Key growing tips

Data:
- Soil pH: {data.ph}
- Nitrogen (N): {data.nitrogen} mg/kg
- Phosphorus (P): {data.phosphorus} mg/kg
- Potassium (K): {data.potassium} mg/kg
- Water Availability: {data.water_availability}
- Location: Lat {data.lat}, Lon {data.lon}
- Current Weather: {weather['temp']}°C, Humidity: {weather['humidity']}%, {weather['description']}

Provide your response in plain text. Be concise but informative. Use numbered sections for each crop."""

    recommendation = await ask_groq(
        "You are a precise and helpful agricultural intelligence assistant specializing in crop selection for Indian and global farming conditions.",
        prompt
    )
    return {
        "recommendation": recommendation,
        "weather": weather,
    }

# ── 3. Market Analysis ────────────────────────────────────────────

@app.post("/api/market-analysis")
async def market_analysis(query: MarketQuery):
    crops_str = ", ".join(query.crops) if query.crops else "Rice, Wheat, Sugarcane"
    prompt = f"""You are an agricultural market analyst AI. Provide a detailed market analysis for the following crops in {query.region}.

Crops: {crops_str}

For EACH crop, provide:
1. Current Market Price (per quintal in INR, approximate)
2. Price Trend (Rising / Stable / Falling) over the last 6 months
3. Demand Level (High / Medium / Low)
4. Best time to sell
5. Key market insight or tip

Also provide a brief overall market outlook paragraph at the end.

Respond in plain text. Be concise and data-driven."""

    analysis = await ask_groq(
        "You are a market intelligence analyst specializing in agricultural commodity pricing in India. Provide realistic, approximate market data.",
        prompt
    )
    return {"analysis": analysis, "crops": query.crops, "region": query.region}

# ── 4. ROI Calculator ─────────────────────────────────────────────

@app.post("/api/roi")
async def calculate_roi(query: ROIQuery):
    prompt = f"""You are an agricultural financial advisor AI. Calculate a detailed ROI analysis for the following farming scenario:

Crop: {query.crop}
Farm Area: {query.area_acres} acres
Total Investment: ₹{query.investment_inr}
Region: {query.region}

Provide:
1. Estimated Total Cost Breakdown (seeds, fertilizer, labor, irrigation, pesticides, misc)
2. Expected Yield (in quintals)
3. Expected Revenue at current market price
4. Net Profit / Loss
5. ROI Percentage
6. Break-even Analysis
7. Risk Factors
8. Recommendations to improve profitability

Use approximate but realistic numbers for {query.region}. All amounts in INR (₹).
Respond in plain text. Be precise and actionable."""

    roi = await ask_groq(
        "You are a financial advisor specializing in Indian agriculture. Provide realistic cost estimates and projections.",
        prompt
    )
    return {"roi_analysis": roi, "crop": query.crop, "area_acres": query.area_acres, "investment_inr": query.investment_inr}

# ── 5. Dashboard Summary ──────────────────────────────────────────

@app.get("/api/dashboard")
async def dashboard_summary(lat: float = 19.076, lon: float = 72.8777):
    weather = await fetch_weather(lat, lon)

    prompt = f"""You are a farming dashboard assistant. Given the current weather conditions, provide a brief farming advisory in exactly this JSON format (no markdown, just raw JSON):

{{
    "greeting": "A short one-line greeting for the farmer based on time/weather",
    "advisory": "2-3 sentence advisory on what farming activities are recommended today",
    "soil_tip": "One quick tip about soil management",
    "season_crop": "Name of one crop that is ideal for the current season",
    "risk_alert": "Any weather or pest risk to watch out for, or 'None' if all clear"
}}

Current weather: {weather['temp']}°C, Humidity: {weather['humidity']}%, {weather['description']}, Wind: {weather['wind_speed']} m/s.
Location coordinates: Lat {lat}, Lon {lon} (likely India).

Return ONLY valid JSON, no extra text."""

    raw = await ask_groq("You are a concise farming advisor. Respond ONLY with valid JSON.", prompt)

    # Try to parse JSON, fallback to defaults
    try:
        # Strip any markdown code fences if present
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        cleaned = cleaned.strip()
        tips = json.loads(cleaned)
    except Exception:
        tips = {
            "greeting": "Good day, farmer!",
            "advisory": "Weather looks favorable for field work today.",
            "soil_tip": "Check soil moisture before irrigating.",
            "season_crop": "Rice",
            "risk_alert": "None"
        }

    return {"weather": weather, "tips": tips}
