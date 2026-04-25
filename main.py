import os
import json
import base64
import httpx
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

app = FastAPI(title="Aapli Kheti – Crop Intelligence API")
app.mount("/static", StaticFiles(directory="static"), name="static")
groq_client = AsyncGroq(api_key=GROQ_API_KEY)
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_VISION_MODEL = "llama-3.2-90b-vision-preview"

# ─── Pydantic Models ───────────────────────────────────────────────

class CropDataInput(BaseModel):
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    water_availability: str
    farming_type: str = "Mixed"
    lat: float
    lon: float
    language: str = "English"

class SmartRecommendInput(BaseModel):
    soil_color: str
    water_drainage: str
    previous_crop: str
    fertilizer_used: str
    farming_type: str = "Mixed"
    water_availability: str
    lat: float
    lon: float
    language: str = "English"

class MarketQuery(BaseModel):
    crops: list[str]
    region: str = "India"
    language: str = "English"

class ROIQuery(BaseModel):
    crop: str
    area_acres: float
    investment_inr: float
    region: str = "India"
    language: str = "English"

# ─── Helper: Language instruction ──────────────────────────────────

def lang_instruction(lang: str) -> str:
    if lang == "Hindi":
        return "CRITICAL: You MUST respond ENTIRELY in Hindi (Devanagari script हिंदी). DO NOT use any English words. Every single word must be in Hindi."
    elif lang == "Marathi":
        return "CRITICAL: You MUST respond ENTIRELY in Marathi (Devanagari script मराठी). DO NOT use any English words. Every single word must be in Marathi."
    return ""

# ─── Helper: Fetch Weather ─────────────────────────────────────────

async def fetch_weather(lat: float, lon: float) -> dict:
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
    except Exception:
        weather["simulated"] = True
    return weather

# ─── Helper: Fetch 5-day Forecast ──────────────────────────────────

async def fetch_forecast(lat: float, lon: float) -> list:
    if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == "your_openweather_api_key_here":
        return []
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric&cnt=40"
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url)
        if res.status_code == 200:
            data = res.json()
            daily = {}
            for item in data.get("list", []):
                date = item["dt_txt"].split(" ")[0]
                if date not in daily:
                    daily[date] = {"temp_min": 999, "temp_max": -999, "desc": "", "icon": "", "humidity": 0}
                t = item["main"]["temp"]
                if t < daily[date]["temp_min"]: daily[date]["temp_min"] = t
                if t > daily[date]["temp_max"]: daily[date]["temp_max"] = t
                daily[date]["desc"] = item["weather"][0]["description"]
                daily[date]["icon"] = item["weather"][0]["icon"]
                daily[date]["humidity"] = item["main"]["humidity"]
            result = []
            for date, info in list(daily.items())[:5]:
                result.append({"date": date, "temp_min": round(info["temp_min"], 1), "temp_max": round(info["temp_max"], 1), "description": info["desc"], "icon": info["icon"], "humidity": info["humidity"]})
            return result
    except Exception:
        pass
    return []

# ─── Helper: Call Groq (text) ──────────────────────────────────────

async def ask_groq(system_prompt: str, user_prompt: str, language: str = "English") -> str:
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        raise HTTPException(status_code=500, detail="Groq API key is not configured.")
    lang_rule = lang_instruction(language)
    if lang_rule:
        system_prompt = f"{system_prompt} {lang_rule}"
        user_prompt = f"{user_prompt}\n\n{lang_rule}"
    try:
        completion = await groq_client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            model=GROQ_MODEL,
        )
        return completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Helper: Call Groq Vision ──────────────────────────────────────

async def ask_groq_vision(system_prompt: str, user_prompt: str, image_b64: str, language: str = "English") -> str:
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API key is not configured.")
    lang_rule = lang_instruction(language)
    if lang_rule:
        system_prompt = f"{system_prompt} {lang_rule}"
        user_prompt = f"{user_prompt}\n\n{lang_rule}"
    try:
        completion = await groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": [
                    {"type": "text", "text": user_prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
                ]}
            ],
            model=GROQ_VISION_MODEL,
        )
        return completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Routes ────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return FileResponse("templates/index.html")

# ── 1. Dashboard ───────────────────────────────────────────────────

@app.get("/api/weather")
async def get_weather(lat: float = 19.076, lon: float = 72.8777):
    return await fetch_weather(lat, lon)

@app.get("/api/forecast")
async def get_forecast(lat: float = 19.076, lon: float = 72.8777):
    forecast = await fetch_forecast(lat, lon)
    return {"forecast": forecast}

@app.get("/api/dashboard")
async def dashboard_summary(lat: float = 19.076, lon: float = 72.8777, language: str = "English"):
    weather = await fetch_weather(lat, lon)
    forecast = await fetch_forecast(lat, lon)
    forecast_str = ""
    for f in forecast[:5]:
        forecast_str += f"  {f['date']}: {f['temp_min']}–{f['temp_max']}°C, {f['description']}, humidity {f['humidity']}%\n"

    prompt = f"""You are a farming dashboard assistant. Given current and forecast weather, provide a brief farming advisory in exactly this JSON format (no markdown, just raw JSON):
{{
    "greeting": "A short greeting for the farmer",
    "advisory": "2-3 sentence advisory on farming activities today",
    "soil_tip": "One soil management tip",
    "season_crop": "One crop ideal for current season",
    "risk_alert": "Any risk to watch out for, or 'None'"
}}
Current weather: {weather['temp']}°C, Humidity: {weather['humidity']}%, {weather['description']}, Wind: {weather['wind_speed']} m/s.
5-day forecast:
{forecast_str}
Location: Lat {lat}, Lon {lon} (likely India).
{lang_instruction(language)}
Return ONLY valid JSON."""

    raw = await ask_groq("You are a concise farming advisor. Respond ONLY with valid JSON.", prompt, language)
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"): cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"): cleaned = cleaned.rsplit("```", 1)[0]
        tips = json.loads(cleaned.strip())
    except Exception:
        tips = {"greeting": "Good day, farmer!", "advisory": "Weather looks favorable.", "soil_tip": "Check soil moisture.", "season_crop": "Rice", "risk_alert": "None"}
    return {"weather": weather, "tips": tips, "forecast": forecast}

# ── 2. Crop Recommendation ────────────────────────────────────────

@app.post("/api/recommend")
async def recommend_crop(data: CropDataInput):
    weather = await fetch_weather(data.lat, data.lon)
    forecast = await fetch_forecast(data.lat, data.lon)
    forecast_str = "\n".join([f"  {f['date']}: {f['temp_min']}–{f['temp_max']}°C, {f['description']}" for f in forecast[:5]])

    prompt = f"""You are an expert agricultural AI advisor. Recommend the top 3 crops to maximize yield and profitability.

For EACH crop: Crop Name, Why suitable, Expected yield/acre, Profit margin, Key growing tips.

Data:
- Soil pH: {data.ph}, N: {data.nitrogen} mg/kg, P: {data.phosphorus} mg/kg, K: {data.potassium} mg/kg
- Water: {data.water_availability} | Farming Type: {data.farming_type}
- Location: Lat {data.lat}, Lon {data.lon}
- Current Weather: {weather['temp']}°C, Humidity: {weather['humidity']}%, {weather['description']}
- 5-Day Forecast:
{forecast_str}

IMPORTANT: Recommend crops suited for the UPCOMING weather conditions, not just today.
{lang_instruction(data.language)}
Provide response in plain text."""

    recommendation = await ask_groq("You are a precise agricultural intelligence assistant.", prompt, data.language)
    return {"recommendation": recommendation, "weather": weather}

# ── 3. Smart Recommendation (Visual Questionnaire) ────────────────

@app.post("/api/smart-recommend")
async def smart_recommend(data: SmartRecommendInput):
    weather = await fetch_weather(data.lat, data.lon)
    forecast = await fetch_forecast(data.lat, data.lon)
    forecast_str = "\n".join([f"  {f['date']}: {f['temp_min']}–{f['temp_max']}°C, {f['description']}" for f in forecast[:5]])

    prompt = f"""You are an expert agricultural AI. A farmer has described their field conditions in simple terms. Based on this, FIRST estimate their approximate soil pH and NPK levels, THEN recommend the top 3 best crops.

Farmer's description:
- Soil Color/Type: {data.soil_color}
- Water Drainage: {data.water_drainage}
- Previous Crop Grown: {data.previous_crop}
- Fertilizer Used: {data.fertilizer_used}
- Water Source: {data.water_availability}
- Farming Type: {data.farming_type}
- Location: Lat {data.lat}, Lon {data.lon}
- Current Weather: {weather['temp']}°C, Humidity: {weather['humidity']}%, {weather['description']}
- 5-Day Forecast:
{forecast_str}

Respond with:
1. Estimated Soil Profile (pH, N, P, K ranges based on the description)
2. For each of 3 recommended crops: Name, Why suitable, Expected yield, Profit margin, Growing tips

{lang_instruction(data.language)}
Provide response in plain text."""

    recommendation = await ask_groq("You are an agricultural soil scientist and crop advisor.", prompt, data.language)
    return {"recommendation": recommendation, "weather": weather}

# ── 4. Crop Disease Scanner (Image) ───────────────────────────────

@app.post("/api/scan-disease")
async def scan_disease(image: UploadFile = File(...), language: str = Form("English")):
    contents = await image.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Max 5MB.")
    image_b64 = base64.b64encode(contents).decode("utf-8")

    prompt = f"""Analyze this plant/crop image carefully. Identify:
1. The plant/crop species (if identifiable)
2. Any disease, pest damage, or nutrient deficiency visible
3. Severity level (Mild / Moderate / Severe)
4. Cause of the problem
5. Treatment recommendations (both organic and chemical options)
6. Preventive measures for the future

If the plant looks healthy, say so and give general care tips.
{lang_instruction(language)}
Provide response in plain text."""

    diagnosis = await ask_groq_vision(
        "You are an expert plant pathologist and agricultural scientist. Analyze crop images for diseases and provide actionable treatment advice.",
        prompt, image_b64, language
    )
    return {"diagnosis": diagnosis}

# ── 5. Market Analysis ────────────────────────────────────────────

@app.post("/api/market-analysis")
async def market_analysis(query: MarketQuery):
    crops_str = ", ".join(query.crops) if query.crops else "Rice, Wheat, Sugarcane"
    prompt = f"""Provide detailed market analysis for these crops in {query.region}:
Crops: {crops_str}
For EACH: 1) Current Price (INR/quintal) 2) Price Trend 3) Demand Level 4) Best time to sell 5) Key insight
Also provide overall market outlook.
{lang_instruction(query.language)}
Respond in plain text."""
    analysis = await ask_groq("You are a market intelligence analyst for Indian agriculture.", prompt, query.language)
    return {"analysis": analysis, "crops": query.crops, "region": query.region}

# ── 6. ROI Calculator ─────────────────────────────────────────────

@app.post("/api/roi")
async def calculate_roi(query: ROIQuery):
    prompt = f"""Calculate detailed ROI for:
Crop: {query.crop}, Area: {query.area_acres} acres, Investment: ₹{query.investment_inr}, Region: {query.region}
Provide: 1) Cost Breakdown 2) Expected Yield 3) Revenue 4) Net Profit 5) ROI% 6) Break-even 7) Risks 8) Tips
{lang_instruction(query.language)}
Respond in plain text."""
    roi = await ask_groq("You are a financial advisor for Indian agriculture.", prompt, query.language)
    return {"roi_analysis": roi, "crop": query.crop, "area_acres": query.area_acres, "investment_inr": query.investment_inr}

# ── 7. Season Predictor ───────────────────────────────────────────

class SeasonPredictInput(BaseModel):
    lat: float
    lon: float
    language: str = "English"

@app.post("/api/season-predict")
async def season_predict(data: SeasonPredictInput):
    weather = await fetch_weather(data.lat, data.lon)
    forecast = await fetch_forecast(data.lat, data.lon)
    forecast_str = "\n".join([f"  {f['date']}: {f['temp_min']}–{f['temp_max']}°C, {f['description']}, humidity {f['humidity']}%" for f in forecast])

    prompt = f"""You are an expert agricultural meteorologist and crop advisor.
Based on the CURRENT weather and 5-day forecast trends, predict what the upcoming season's weather will look like and recommend the BEST crops to grow in the NEXT season.

Current Weather: {weather['temp']}°C, Humidity: {weather['humidity']}%, {weather['description']}
Location: Lat {data.lat}, Lon {data.lon} (likely India)
5-Day Forecast:
{forecast_str}

Provide:
1. Current Season Assessment (what season it is now based on weather)
2. Next Season Prediction (expected weather patterns for the upcoming 2-3 months)
3. Top 5 Recommended Crops for Next Season with:
   - Crop name
   - Why it fits the predicted weather
   - Best planting window
   - Expected yield potential
4. Risk Factors to prepare for
5. Key preparation steps the farmer should start NOW

{lang_instruction(data.language)}
Provide response in plain text."""

    prediction = await ask_groq("You are a precision agriculture expert specializing in seasonal crop planning for Indian farming.", prompt, data.language)
    return {"prediction": prediction, "weather": weather, "forecast": forecast}

# ── 8. Seasonal Calendar ──────────────────────────────────────────

@app.post("/api/seasonal-calendar")
async def seasonal_calendar(data: SeasonPredictInput):
    weather = await fetch_weather(data.lat, data.lon)

    prompt = f"""You are an expert Indian farming calendar advisor. Create a detailed 12-month seasonal farming calendar.

Location: Lat {data.lat}, Lon {data.lon} (likely India)
Current Weather: {weather['temp']}°C, {weather['description']}

Return ONLY valid JSON in this exact format (no markdown):
{{
    "months": [
        {{"month": "January", "season": "Rabi", "icon": "❄️", "tasks": "Wheat harvesting preparation, monitor irrigation", "crops": "Wheat, Mustard, Peas", "tip": "Protect crops from frost"}},
        {{"month": "February", "season": "Rabi", "icon": "🌸", "tasks": "...", "crops": "...", "tip": "..."}},
        {{"month": "March", "season": "Summer", "icon": "☀️", "tasks": "...", "crops": "...", "tip": "..."}},
        {{"month": "April", "season": "Summer", "icon": "🌡️", "tasks": "...", "crops": "...", "tip": "..."}},
        {{"month": "May", "season": "Summer", "icon": "🔥", "tasks": "...", "crops": "...", "tip": "..."}},
        {{"month": "June", "season": "Kharif", "icon": "🌧️", "tasks": "...", "crops": "...", "tip": "..."}},
        {{"month": "July", "season": "Kharif", "icon": "⛈️", "tasks": "...", "crops": "...", "tip": "..."}},
        {{"month": "August", "season": "Kharif", "icon": "🌧️", "tasks": "...", "crops": "...", "tip": "..."}},
        {{"month": "September", "season": "Kharif", "icon": "🌦️", "tasks": "...", "crops": "...", "tip": "..."}},
        {{"month": "October", "season": "Rabi", "icon": "🍂", "tasks": "...", "crops": "...", "tip": "..."}},
        {{"month": "November", "season": "Rabi", "icon": "🌾", "tasks": "...", "crops": "...", "tip": "..."}},
        {{"month": "December", "season": "Rabi", "icon": "❄️", "tasks": "...", "crops": "...", "tip": "..."}}
    ]
}}

Fill ALL 12 months with realistic Indian farming data for this location.
{lang_instruction(data.language)}
Return ONLY valid JSON."""

    raw = await ask_groq("You are an Indian agricultural calendar expert. Respond ONLY with valid JSON.", prompt, data.language)
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"): cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"): cleaned = cleaned.rsplit("```", 1)[0]
        calendar_data = json.loads(cleaned.strip())
    except Exception:
        calendar_data = {"months": [{"month": m, "season": "—", "icon": "🌾", "tasks": "Loading...", "crops": "—", "tip": "—"} for m in ["January","February","March","April","May","June","July","August","September","October","November","December"]]}
    return {"calendar": calendar_data, "weather": weather}
