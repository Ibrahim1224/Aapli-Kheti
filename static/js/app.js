// ═══════════════════════════════════════════════════════════════════
// Aapli Kheti – Frontend v3 (Season Planner + Animations)
// ═══════════════════════════════════════════════════════════════════

let currentLanguage = "English", userLat = 19.076, userLon = 72.8777, dashboardMap = null;

// ─── i18n ─────────────────────────────────────────────────────────
const i18n = {
    English: {
        // Nav
        nav_dashboard:"Dashboard", nav_smart:"Smart Estimator", nav_season:"Season Planner", nav_doctor:"Crop Doctor", nav_market:"Market Analysis", nav_roi:"ROI Calculator",
        // Dashboard
        dash_title:"Dashboard", dash_desc:"Real-time weather, 5-day forecast, and AI-powered daily advisory.", weather_title:"Current Weather", forecast_title:"5-Day Forecast", location_title:"Farm Location", advisory_title:"Today's Advisory",
        // Smart Estimator
        smart_title:"🧑‍🌾 Smart Soil Estimator", smart_desc:"No lab test? Just answer simple questions and let AI estimate your soil & recommend crops for the next 90 days!",
        q_soil:"What does your soil look like?", soil_dark:"Dark Black", soil_red:"Reddish Brown", soil_sandy:"Light Sandy", soil_clay:"Grey Clay",
        q_drain:"How does water drain?", drain_pools:"Pools Quickly", drain_slow:"Drains Slowly", drain_fast:"Drains Fast",
        q_prev:"What did you grow last season?", crop_rice:"Rice", crop_wheat:"Wheat", crop_sugarcane:"Sugarcane", crop_veg:"Vegetables", crop_nothing:"Nothing",
        q_fert:"What fertilizer do you use?", fert_dap:"DAP", fert_urea:"Urea", fert_compost:"Compost", fert_none:"None",
        lbl_water_source:"Water Source", water_well:"Well Water", water_rain:"Rainfed", water_river:"River/Stream",
        lbl_farm_type:"Farming Type", farm_mixed:"Mixed", farm_organic:"Organic", farm_chemical:"Chemical",
        btn_smart:"🌱 Get Smart Recommendations", result_ai:"AI Analysis",
        // Season Planner
        season_title:"🗓️ Season Planner", season_desc:"AI analyzes 90-day climate data (16-day forecast + historical patterns) to recommend what to plant.",
        btn_predict:"🔮 90-Day Season Prediction", btn_calendar:"📅 Generate Seasonal Calendar", result_season:"Season Prediction", result_calendar:"12-Month Farming Calendar",
        // Crop Doctor
        doctor_title:"📸 Crop Doctor", doctor_desc:"Upload a photo and AI diagnoses diseases instantly.", upload_prompt:"Click or drag a photo here",
        btn_scan:"🔬 Analyze Plant", result_diagnosis:"Diagnosis Report",
        // Market
        market_title:"Market Analysis", market_desc:"AI-powered market prices, trends, and selling times.",
        lbl_search_crops:"Search Crops", lbl_crops_input:"Crops (comma-separated)", placeholder_crops:"e.g. Rice, Wheat, Sugarcane", lbl_region:"Region",
        btn_market:"Get Market Analysis", result_market:"Results",
        // ROI
        roi_title:"ROI Calculator", roi_desc:"Estimate return on investment with AI cost breakdown.",
        lbl_investment:"Investment Details", lbl_crop_name:"Crop Name", placeholder_crop:"e.g. Rice", lbl_area:"Farm Area (acres)", lbl_total_inv:"Total Investment (₹)",
        btn_roi:"Calculate ROI"
    },
    Hindi: {
        // Nav
        nav_dashboard:"डैशबोर्ड", nav_smart:"स्मार्ट अनुमान", nav_season:"मौसम योजना", nav_doctor:"फसल डॉक्टर", nav_market:"बाज़ार विश्लेषण", nav_roi:"ROI कैलकुलेटर",
        // Dashboard
        dash_title:"डैशबोर्ड", dash_desc:"मौसम, पूर्वानुमान और AI सलाह।", weather_title:"मौजूदा मौसम", forecast_title:"5-दिन का पूर्वानुमान", location_title:"खेत का स्थान", advisory_title:"आज की सलाह",
        // Smart Estimator
        smart_title:"🧑‍🌾 स्मार्ट मिट्टी अनुमान", smart_desc:"मिट्टी का pH नहीं पता? सरल सवालों का जवाब दें, 90 दिन की फसल योजना पाएं!",
        q_soil:"आपकी मिट्टी कैसी दिखती है?", soil_dark:"गहरी काली", soil_red:"लाल-भूरी", soil_sandy:"हल्की रेतीली", soil_clay:"भूरी चिकनी",
        q_drain:"पानी कैसे निकलता है?", drain_pools:"जल्दी जमता है", drain_slow:"धीरे निकलता है", drain_fast:"जल्दी सूखता है",
        q_prev:"पिछले मौसम में क्या उगाया?", crop_rice:"चावल", crop_wheat:"गेहूँ", crop_sugarcane:"गन्ना", crop_veg:"सब्जियाँ", crop_nothing:"कुछ नहीं",
        q_fert:"आप कौन सी खाद उपयोग करते हैं?", fert_dap:"DAP", fert_urea:"यूरिया", fert_compost:"जैविक खाद", fert_none:"कोई नहीं",
        lbl_water_source:"पानी का स्रोत", water_well:"कुएं का पानी", water_rain:"वर्षा आधारित", water_river:"नदी/नाला",
        lbl_farm_type:"खेती का प्रकार", farm_mixed:"मिश्रित", farm_organic:"जैविक", farm_chemical:"रासायनिक",
        btn_smart:"🌱 स्मार्ट सुझाव पाएं", result_ai:"AI विश्लेषण",
        // Season Planner
        season_title:"🗓️ मौसम योजना", season_desc:"AI 90 दिनों के जलवायु आँकड़ों का विश्लेषण करता है।",
        btn_predict:"🔮 90-दिन मौसम भविष्यवाणी", btn_calendar:"📅 मौसमी कैलेंडर बनाएं", result_season:"मौसम भविष्यवाणी", result_calendar:"12-माह कृषि कैलेंडर",
        // Crop Doctor
        doctor_title:"📸 फसल डॉक्टर", doctor_desc:"फोटो अपलोड करें, AI बीमारी बताएगा।", upload_prompt:"फोटो यहाँ डालें",
        btn_scan:"🔬 पौधे की जाँच करें", result_diagnosis:"रोग निदान रिपोर्ट",
        // Market
        market_title:"बाज़ार विश्लेषण", market_desc:"AI बाज़ार भाव और रुझान।",
        lbl_search_crops:"फसलें खोजें", lbl_crops_input:"फसलें (कॉमा से अलग करें)", placeholder_crops:"जैसे: चावल, गेहूँ, गन्ना", lbl_region:"क्षेत्र",
        btn_market:"बाज़ार विश्लेषण करें", result_market:"परिणाम",
        // ROI
        roi_title:"ROI कैलकुलेटर", roi_desc:"AI लागत विश्लेषण।",
        lbl_investment:"निवेश विवरण", lbl_crop_name:"फसल का नाम", placeholder_crop:"जैसे: चावल", lbl_area:"खेत क्षेत्र (एकड़)", lbl_total_inv:"कुल निवेश (₹)",
        btn_roi:"ROI गणना करें"
    },
    Marathi: {
        // Nav
        nav_dashboard:"डॅशबोर्ड", nav_smart:"स्मार्ट अंदाज", nav_season:"हंगाम नियोजन", nav_doctor:"पीक डॉक्टर", nav_market:"बाजार विश्लेषण", nav_roi:"ROI कॅल्क्युलेटर",
        // Dashboard
        dash_title:"डॅशबोर्ड", dash_desc:"हवामान, अंदाज आणि AI सल्ला.", weather_title:"सध्याचे हवामान", forecast_title:"5-दिवसांचा अंदाज", location_title:"शेताचे ठिकाण", advisory_title:"आजचा सल्ला",
        // Smart Estimator
        smart_title:"🧑‍🌾 स्मार्ट माती अंदाज", smart_desc:"pH माहित नाही? सोप्या प्रश्नांची उत्तरे द्या, 90 दिवसांची पीक योजना मिळवा!",
        q_soil:"तुमची माती कशी दिसते?", soil_dark:"गडद काळी", soil_red:"लाल-तपकिरी", soil_sandy:"हलकी वाळूयुक्त", soil_clay:"राखाडी चिकण",
        q_drain:"पाणी कसे निचरते?", drain_pools:"लवकर साचते", drain_slow:"हळू निचरते", drain_fast:"लवकर सुकते",
        q_prev:"मागील हंगामात काय पिकवले?", crop_rice:"भात", crop_wheat:"गहू", crop_sugarcane:"ऊस", crop_veg:"भाजीपाला", crop_nothing:"काहीच नाही",
        q_fert:"तुम्ही कोणते खत वापरता?", fert_dap:"DAP", fert_urea:"युरिया", fert_compost:"सेंद्रिय खत", fert_none:"काहीच नाही",
        lbl_water_source:"पाण्याचा स्रोत", water_well:"विहिरीचे पाणी", water_rain:"पावसावर अवलंबून", water_river:"नदी/ओढा",
        lbl_farm_type:"शेतीचा प्रकार", farm_mixed:"मिश्र", farm_organic:"सेंद्रिय", farm_chemical:"रासायनिक",
        btn_smart:"🌱 स्मार्ट शिफारसी मिळवा", result_ai:"AI विश्लेषण",
        // Season Planner
        season_title:"🗓️ हंगाम नियोजन", season_desc:"AI 90 दिवसांच्या हवामान डेटाचे विश्लेषण करतो.",
        btn_predict:"🔮 90-दिवस हंगाम अंदाज", btn_calendar:"📅 हंगामी दिनदर्शिका तयार करा", result_season:"हंगाम अंदाज", result_calendar:"12-महिने शेती दिनदर्शिका",
        // Crop Doctor
        doctor_title:"📸 पीक डॉक्टर", doctor_desc:"फोटो अपलोड करा, AI रोग ओळखेल.", upload_prompt:"फोटो इथे टाका",
        btn_scan:"🔬 झाडाची तपासणी करा", result_diagnosis:"रोग निदान अहवाल",
        // Market
        market_title:"बाजार विश्लेषण", market_desc:"AI बाजारभाव आणि ट्रेंड.",
        lbl_search_crops:"पिके शोधा", lbl_crops_input:"पिके (स्वल्पविरामाने वेगळे करा)", placeholder_crops:"उदा: भात, गहू, ऊस", lbl_region:"प्रदेश",
        btn_market:"बाजार विश्लेषण करा", result_market:"निकाल",
        // ROI
        roi_title:"ROI कॅल्क्युलेटर", roi_desc:"AI खर्च विश्लेषण.",
        lbl_investment:"गुंतवणूक तपशील", lbl_crop_name:"पिकाचे नाव", placeholder_crop:"उदा: भात", lbl_area:"शेत क्षेत्र (एकर)", lbl_total_inv:"एकूण गुंतवणूक (₹)",
        btn_roi:"ROI मोजा"
    }
};
function updateLanguageUI() {
    const t = i18n[currentLanguage] || i18n.English;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        if (t[k]) el.textContent = t[k];
    });
    // Handle placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const k = el.getAttribute('data-i18n-placeholder');
        if (t[k]) el.placeholder = t[k];
    });
}
document.getElementById('lang-select').addEventListener('change', e => { currentLanguage = e.target.value; updateLanguageUI(); });

// ─── Navigation ───────────────────────────────────────────────────
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        document.getElementById('page-' + link.getAttribute('data-page')).classList.add('active');
    });
});

// ─── Pill toggles ─────────────────────────────────────────────────
function setupPills(sel, cb) { document.querySelectorAll(sel).forEach(b => b.addEventListener('click', () => { document.querySelectorAll(sel).forEach(x => x.classList.remove('active')); b.classList.add('active'); if (cb) cb(b.getAttribute('data-value')); })); }
let selectedSoil="Dark Black Soil", selectedDrain="Water pools quickly after rain", selectedPrev="Rice", selectedFert="DAP";
setupPills('.soil-btn', v => selectedSoil=v);
setupPills('.drain-btn', v => selectedDrain=v);
setupPills('.prev-btn', v => selectedPrev=v);
setupPills('.fert-btn', v => selectedFert=v);

// ─── Helpers ──────────────────────────────────────────────────────
async function apiCall(url, method='GET', body=null) {
    const opts = { method, headers: {'Content-Type':'application/json'} };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail||'API failed'); }
    return res.json();
}
function weatherEmoji(d) {
    d = d.toLowerCase();
    if (d.includes('rain')) return '🌧️'; if (d.includes('cloud')) return '☁️'; if (d.includes('clear')) return '☀️';
    if (d.includes('storm')||d.includes('thunder')) return '⛈️'; if (d.includes('snow')) return '❄️';
    if (d.includes('mist')||d.includes('haze')||d.includes('fog')||d.includes('smoke')) return '🌫️'; return '🌤️';
}

// ─── 1. Dashboard ─────────────────────────────────────────────────
function initMap(lat, lon, city) {
    if (dashboardMap) dashboardMap.remove();
    dashboardMap = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution:'© OSM'}).addTo(dashboardMap);
    L.marker([lat, lon]).addTo(dashboardMap).bindPopup('<b>🌾 Your Farm</b><br>' + city).openPopup();
    document.getElementById('location-details').innerHTML = `<div><strong>Lat:</strong> ${lat.toFixed(4)}°</div><div><strong>Lon:</strong> ${lon.toFixed(4)}°</div><div><strong>City:</strong> ${city}</div><div style="margin-top:8px;padding:8px;background:rgba(21,66,18,0.08);border-radius:8px;font-size:12px;">📡 Auto-detected via GPS</div>`;
}
async function loadDashboard() {
    const loading = document.getElementById('dashboard-loading'), content = document.getElementById('dashboard-content');
    try {
        const data = await apiCall(`/api/dashboard?lat=${userLat}&lon=${userLon}&language=${currentLanguage}`);
        const w = data.weather, t = data.tips, fc = data.forecast || [];
        document.getElementById('weather-grid').innerHTML = `
            <div class="weather-stat"><div class="value">${w.temp}°C</div><div class="label">Temperature</div></div>
            <div class="weather-stat"><div class="value">${w.humidity}%</div><div class="label">Humidity</div></div>
            <div class="weather-stat"><div class="value">${w.wind_speed} m/s</div><div class="label">Wind</div></div>
            <div class="weather-stat"><div class="value">${w.pressure}</div><div class="label">Pressure</div></div>
            <div class="weather-stat" style="grid-column:span 2;"><div class="value" style="font-size:18px;text-transform:capitalize;">${weatherEmoji(w.description)} ${w.description}</div><div class="label">${w.city||''}${w.simulated?' (Simulated)':''}</div></div>`;
        let fcHTML = '';
        fc.forEach(f => { const day = new Date(f.date).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'}); fcHTML += `<div class="forecast-card"><div class="fc-date">${day}</div><div class="fc-icon">${weatherEmoji(f.description)}</div><div class="fc-temp">${f.temp_min}° – ${f.temp_max}°</div><div class="fc-desc">${f.description}</div></div>`; });
        document.getElementById('forecast-cards').innerHTML = fcHTML || '<p style="color:#999;">Forecast unavailable</p>';
        document.getElementById('advisory-cards').innerHTML = `
            <div class="advisory-card"><h4>🌤 Greeting</h4><p>${t.greeting}</p></div>
            <div class="advisory-card"><h4>📋 Advisory</h4><p>${t.advisory}</p></div>
            <div class="advisory-card"><h4>🌱 Soil Tip</h4><p>${t.soil_tip}</p></div>
            <div class="advisory-card"><h4>🌾 Season Crop</h4><p>${t.season_crop}</p></div>
            <div class="advisory-card" style="grid-column:span 2;${t.risk_alert!=='None'?' border-left-color:var(--error);':''}"><h4>⚠️ Risk</h4><p>${t.risk_alert}</p></div>`;
        loading.style.display='none'; content.style.display='block';
        initMap(userLat, userLon, w.city||'Your Location');
    } catch(err) { loading.innerHTML = `<p style="color:var(--error);">Error: ${err.message}</p>`; }
}
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => { userLat=pos.coords.latitude; userLon=pos.coords.longitude; loadDashboard(); }, ()=>loadDashboard(), {enableHighAccuracy:true,timeout:5000});
} else loadDashboard();

// ─── 2. Smart Estimator ──────────────────────────────────────────
document.getElementById('smart_btn').addEventListener('click', async () => {
    const btn=document.getElementById('smart_btn'), txt=document.getElementById('smart_btn_text');
    txt.innerHTML='<div class="spinner"></div> Analyzing...'; btn.disabled=true;
    try {
        const data = await apiCall('/api/smart-recommend','POST',{ soil_color:selectedSoil, water_drainage:selectedDrain, previous_crop:selectedPrev, fertilizer_used:selectedFert, water_availability:document.getElementById('smart_water').value, farming_type:document.getElementById('smart_farm').value, lat:userLat, lon:userLon, language:currentLanguage });
        document.getElementById('smart-content').innerText = data.recommendation;
        document.getElementById('smart-result').style.display='block';
        document.getElementById('smart-result').scrollIntoView({behavior:'smooth'});
    } catch(err) { alert("Error: "+err.message); }
    finally { txt.innerText='🌱 Get Smart Recommendations'; btn.disabled=false; }
});

// ─── 3. Season Planner ───────────────────────────────────────────
document.getElementById('predict_btn').addEventListener('click', async () => {
    const btn=document.getElementById('predict_btn'), txt=document.getElementById('predict_btn_text');
    txt.innerHTML='<div class="spinner"></div> Analyzing 90-day data...'; btn.disabled=true;
    try {
        const data = await apiCall('/api/season-predict','POST',{ lat:userLat, lon:userLon, language:currentLanguage });
        // Build a data-source banner
        const days = data.forecast_days || 90;
        const extDays = (data.extended_forecast||[]).length;
        const histWeeks = (data.historical_weeks||[]).length;
        let bannerHTML = `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;">`;
        bannerHTML += `<div style="padding:8px 16px;background:linear-gradient(135deg,#2d5a27,#3b6934);color:#fff;border-radius:20px;font-size:13px;font-weight:600;">📊 ${days}+ Days of Climate Data</div>`;
        if (extDays) bannerHTML += `<div style="padding:8px 16px;background:#e8f5e9;color:#2d5a27;border-radius:20px;font-size:13px;font-weight:600;">🌤️ ${extDays}-Day Detailed Forecast</div>`;
        if (histWeeks) bannerHTML += `<div style="padding:8px 16px;background:#fff3e0;color:#e65100;border-radius:20px;font-size:13px;font-weight:600;">📅 ${histWeeks} Weeks Historical Data</div>`;
        bannerHTML += `</div>`;
        // Build mini forecast chart if extended data available
        let chartHTML = '';
        if (data.extended_forecast && data.extended_forecast.length > 0) {
            chartHTML = `<div style="margin-bottom:20px;padding:16px;background:#f8faf8;border-radius:12px;border:1px solid #c2c9bb;">`;
            chartHTML += `<h4 style="font-size:14px;font-weight:700;color:#154212;margin-bottom:12px;">🌡️ 16-Day Temperature & Rainfall Forecast</h4>`;
            chartHTML += `<div style="display:flex;gap:6px;align-items:flex-end;height:100px;margin-bottom:8px;">`;
            const maxT = Math.max(...data.extended_forecast.map(d=>d.temp_max));
            const minT = Math.min(...data.extended_forecast.map(d=>d.temp_min));
            const range = maxT - minT || 1;
            data.extended_forecast.forEach(d => {
                const hMax = ((d.temp_max - minT) / range) * 80 + 15;
                const hMin = ((d.temp_min - minT) / range) * 80 + 15;
                const hasRain = d.precipitation_mm > 0;
                const dayLabel = d.date.slice(5);
                chartHTML += `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">`;
                chartHTML += `<div style="font-size:9px;color:#666;">${Math.round(d.temp_max)}°</div>`;
                chartHTML += `<div style="width:100%;display:flex;flex-direction:column;align-items:center;">`;
                chartHTML += `<div style="width:12px;height:${hMax}px;background:linear-gradient(180deg,#ff7043,#ffab91);border-radius:4px 4px 0 0;"></div>`;
                if (hasRain) chartHTML += `<div style="width:12px;height:${Math.min(d.precipitation_mm*2,25)}px;background:#42a5f5;border-radius:0 0 4px 4px;" title="${d.precipitation_mm}mm rain"></div>`;
                chartHTML += `</div>`;
                chartHTML += `<div style="font-size:8px;color:#999;writing-mode:vertical-lr;height:35px;overflow:hidden;">${dayLabel}</div>`;
                chartHTML += `</div>`;
            });
            chartHTML += `</div>`;
            chartHTML += `<div style="display:flex;gap:16px;font-size:11px;color:#666;"><span>🔴 Temperature</span><span>🔵 Rainfall</span></div>`;
            chartHTML += `</div>`;
        }
        document.getElementById('predict-content').innerHTML = bannerHTML + chartHTML + `<pre style="white-space:pre-wrap;font-family:inherit;margin:0;line-height:1.8;">${data.prediction}</pre>`;
        document.getElementById('predict-result').style.display='block';
        document.getElementById('predict-result').scrollIntoView({behavior:'smooth'});
    } catch(err) { alert("Error: "+err.message); }
    finally { txt.innerText='🔮 90-Day Season Prediction'; btn.disabled=false; }
});

document.getElementById('calendar_btn').addEventListener('click', async () => {
    const btn=document.getElementById('calendar_btn'), txt=document.getElementById('calendar_btn_text');
    txt.innerHTML='<div class="spinner" style="border-color:rgba(21,66,18,0.2);border-top-color:var(--primary);"></div> Generating...'; btn.disabled=true;
    try {
        const data = await apiCall('/api/seasonal-calendar','POST',{ lat:userLat, lon:userLon, language:currentLanguage });
        const months = data.calendar.months || [];
        const currentMonth = new Date().toLocaleString('en',{month:'long'});
        let html = '';
        months.forEach((m, i) => {
            const isCurrent = m.month === currentMonth;
            const seasonClass = m.season.toLowerCase().includes('rabi') ? 'rabi' : m.season.toLowerCase().includes('kharif') ? 'kharif' : 'summer';
            html += `<div class="cal-card${isCurrent?' current-month':''}" style="animation:fadeIn 0.4s ${i*0.06}s both;">
                <div class="cal-header"><span class="cal-month">${m.icon} ${m.month}</span><span class="cal-season ${seasonClass}">${m.season}</span></div>
                <div class="cal-crops">🌾 ${m.crops}</div>
                <div class="cal-tasks">📋 ${m.tasks}</div>
                <div class="cal-tip">💡 ${m.tip}</div>
            </div>`;
        });
        document.getElementById('calendar-grid').innerHTML = html;
        document.getElementById('calendar-result').style.display='block';
        document.getElementById('calendar-result').scrollIntoView({behavior:'smooth'});
    } catch(err) { alert("Error: "+err.message); }
    finally { txt.innerText='📅 Generate Seasonal Calendar'; btn.disabled=false; }
});

// ─── 4. Crop Doctor ──────────────────────────────────────────────
const uploadZone=document.getElementById('upload-zone'), fileInput=document.getElementById('disease-file');
let selectedFile=null;
uploadZone.addEventListener('click', ()=>fileInput.click());
uploadZone.addEventListener('dragover', e=>{e.preventDefault();uploadZone.classList.add('dragover');});
uploadZone.addEventListener('dragleave', ()=>uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', e=>{e.preventDefault();uploadZone.classList.remove('dragover');handleFile(e.dataTransfer.files[0]);});
fileInput.addEventListener('change', e=>{if(e.target.files[0]) handleFile(e.target.files[0]);});
function handleFile(file) {
    if(!file||!file.type.startsWith('image/')){alert("Select an image.");return;}
    if(file.size>5*1024*1024){alert("Max 5MB.");return;}
    selectedFile=file;
    const r=new FileReader(); r.onload=e=>{document.getElementById('preview-img').src=e.target.result;document.getElementById('image-preview').style.display='block';}; r.readAsDataURL(file);
}
document.getElementById('scan_btn').addEventListener('click', async () => {
    if(!selectedFile){alert("Upload an image first.");return;}
    const btn=document.getElementById('scan_btn'), txt=document.getElementById('scan_btn_text');
    txt.innerHTML='<div class="spinner"></div> Scanning...'; btn.disabled=true;
    try {
        const fd=new FormData(); fd.append('image',selectedFile); fd.append('language',currentLanguage);
        const res=await fetch('/api/scan-disease',{method:'POST',body:fd});
        if(!res.ok){const e=await res.json();throw new Error(e.detail);}
        const data=await res.json();
        document.getElementById('disease-content').innerText=data.diagnosis;
        document.getElementById('disease-result').style.display='block';
        document.getElementById('disease-result').scrollIntoView({behavior:'smooth'});
    } catch(err){alert("Error: "+err.message);}
    finally{txt.innerText='🔬 Analyze Plant';btn.disabled=false;}
});

// ─── 5. Market Analysis ──────────────────────────────────────────
document.getElementById('market_btn').addEventListener('click', async () => {
    const cropsRaw=document.getElementById('market_crops').value.trim(), region=document.getElementById('market_region').value.trim()||'India';
    if(!cropsRaw){alert("Enter crop names.");return;}
    const crops=cropsRaw.split(',').map(c=>c.trim()).filter(c=>c);
    const btn=document.getElementById('market_btn'), txt=document.getElementById('market_btn_text');
    txt.innerHTML='<div class="spinner"></div> Analyzing...'; btn.disabled=true;
    try {
        const data=await apiCall('/api/market-analysis','POST',{crops,region,language:currentLanguage});
        document.getElementById('market-content').innerText=data.analysis;
        document.getElementById('market-result').style.display='block';
        document.getElementById('market-result').scrollIntoView({behavior:'smooth'});
    } catch(err){alert("Error: "+err.message);}
    finally{txt.innerText='Get Market Analysis';btn.disabled=false;}
});

// ─── 6. ROI Calculator ───────────────────────────────────────────
document.getElementById('roi_btn').addEventListener('click', async () => {
    const crop=document.getElementById('roi_crop').value.trim(), area=parseFloat(document.getElementById('roi_area').value), investment=parseFloat(document.getElementById('roi_investment').value), region=document.getElementById('roi_region').value.trim()||'India';
    if(!crop||isNaN(area)||isNaN(investment)){alert("Fill all fields.");return;}
    const btn=document.getElementById('roi_btn'), txt=document.getElementById('roi_btn_text');
    txt.innerHTML='<div class="spinner"></div> Calculating...'; btn.disabled=true;
    try {
        const data=await apiCall('/api/roi','POST',{crop,area_acres:area,investment_inr:investment,region,language:currentLanguage});
        document.getElementById('roi-content').innerText=data.roi_analysis;
        document.getElementById('roi-result').style.display='block';
        document.getElementById('roi-result').scrollIntoView({behavior:'smooth'});
    } catch(err){alert("Error: "+err.message);}
    finally{txt.innerText='Calculate ROI';btn.disabled=false;}
});

// ─── 7. Crop Comparison ──────────────────────────────────────────
let selectedCompCrops = [];
function renderSelectedCrops() {
    const container = document.getElementById('compare-selected');
    if (selectedCompCrops.length === 0) {
        container.innerHTML = '<span style="color:#999;font-size:13px;padding:8px;">No crops selected yet — click crops above or add custom ones</span>';
        return;
    }
    container.innerHTML = selectedCompCrops.map(c =>
        `<span class="compare-tag">${c} <span class="compare-tag-x" data-remove="${c}">✕</span></span>`
    ).join('');
    container.querySelectorAll('.compare-tag-x').forEach(x => {
        x.addEventListener('click', () => {
            const crop = x.getAttribute('data-remove');
            selectedCompCrops = selectedCompCrops.filter(c => c !== crop);
            document.querySelectorAll('.compare-pill').forEach(p => { if(p.getAttribute('data-crop')===crop) p.classList.remove('active'); });
            renderSelectedCrops();
        });
    });
}
renderSelectedCrops();

// Pill selection (toggle on/off)
document.querySelectorAll('.compare-pill').forEach(pill => {
    pill.addEventListener('click', () => {
        const crop = pill.getAttribute('data-crop');
        if (selectedCompCrops.includes(crop)) {
            selectedCompCrops = selectedCompCrops.filter(c => c !== crop);
            pill.classList.remove('active');
        } else {
            if (selectedCompCrops.length >= 6) { alert('Max 6 crops.'); return; }
            selectedCompCrops.push(crop);
            pill.classList.add('active');
        }
        renderSelectedCrops();
    });
});

// Custom crop add
document.getElementById('compare_add_btn').addEventListener('click', () => {
    const input = document.getElementById('compare_custom');
    const val = input.value.trim();
    if (!val) return;
    val.split(',').map(c => c.trim()).filter(c => c).forEach(crop => {
        if (!selectedCompCrops.includes(crop) && selectedCompCrops.length < 6) {
            selectedCompCrops.push(crop);
        }
    });
    input.value = '';
    renderSelectedCrops();
});

// Score bar helper
function scoreBar(score, color, label) {
    const w = Math.max(score, 5);
    return `<div style="margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:#666;margin-bottom:2px;">
            <span>${label}</span><span>${score}/100</span>
        </div>
        <div style="height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${w}%;background:${color};border-radius:4px;transition:width 0.8s ease;"></div>
        </div>
    </div>`;
}

// Compare button
document.getElementById('compare_btn').addEventListener('click', async () => {
    if (selectedCompCrops.length < 2) { alert('Select at least 2 crops to compare.'); return; }
    const btn = document.getElementById('compare_btn'), txt = document.getElementById('compare_btn_text');
    const area = parseFloat(document.getElementById('compare_area').value) || 5;
    const budget = parseFloat(document.getElementById('compare_budget').value) || 50000;
    const region = document.getElementById('compare_region').value.trim() || 'India';

    txt.innerHTML = '<div class="spinner"></div> Comparing...'; btn.disabled = true;
    try {
        const data = await apiCall('/api/crop-compare', 'POST', {
            crops: selectedCompCrops, area_acres: area, investment_inr: budget,
            region: region, lat: userLat, lon: userLon, language: currentLanguage
        });

        if (!data.comparison) {
            // Fallback: raw text
            document.getElementById('compare-winners').innerHTML = '';
            document.getElementById('compare-cards').innerHTML = `<div class="result-box">${data.raw_analysis||'Analysis unavailable.'}</div>`;
            document.getElementById('compare-summary').innerHTML = '';
        } else {
            const c = data.comparison;
            // Winner badges
            let winnersHTML = `<div style="display:flex;gap:10px;flex-wrap:wrap;">`;
            const badges = [
                {icon:'🏆',label:'Best Overall',crop:c.best_overall,bg:'linear-gradient(135deg,#2d5a27,#4caf50)',color:'#fff'},
                {icon:'💰',label:'Max Profit',crop:c.best_profit,bg:'linear-gradient(135deg,#e65100,#ff9800)',color:'#fff'},
                {icon:'🛡️',label:'Lowest Risk',crop:c.best_low_risk,bg:'linear-gradient(135deg,#1565c0,#42a5f5)',color:'#fff'},
                {icon:'💧',label:'Water Saver',crop:c.best_water_saving,bg:'linear-gradient(135deg,#00838f,#26c6da)',color:'#fff'},
                {icon:'🌱',label:'Sustainable',crop:c.best_sustainability,bg:'linear-gradient(135deg,#2e7d32,#66bb6a)',color:'#fff'}
            ];
            badges.forEach(b => {
                winnersHTML += `<div style="padding:10px 18px;background:${b.bg};color:${b.color};border-radius:14px;font-size:13px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:6px;animation:fadeIn 0.4s both;">
                    <span style="font-size:18px;">${b.icon}</span>
                    <span>${b.label}:</span>
                    <span style="text-decoration:underline;">${b.crop}</span>
                </div>`;
            });
            winnersHTML += `</div>`;
            document.getElementById('compare-winners').innerHTML = winnersHTML;

            // Crop cards
            let cardsHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">`;
            const crops = c.crops || [];
            crops.forEach((crop, i) => {
                const isBest = crop.name === c.best_overall;
                cardsHTML += `<div class="card" style="position:relative;${isBest?'border:2px solid var(--primary);background:linear-gradient(135deg,rgba(21,66,18,0.02),rgba(21,66,18,0.06));':''}animation:fadeIn 0.4s ${i*0.1}s both;">
                    ${isBest ? '<div style="position:absolute;top:-10px;right:16px;background:var(--primary);color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;">🏆 BEST PICK</div>' : ''}
                    <h4 style="font-size:18px;font-weight:800;color:var(--primary);margin-bottom:4px;">${crop.name}</h4>
                    <div style="font-size:11px;color:var(--outline);margin-bottom:12px;">${crop.growth_days||'—'} days • ${crop.water_requirement||'—'} water • ${crop.best_for||'—'}</div>

                    ${scoreBar(crop.profit_score, '#4caf50', '💰 Profit Potential')}
                    ${scoreBar(100 - crop.risk_score, '#42a5f5', '🛡️ Safety (Low Risk)')}
                    ${scoreBar(crop.water_score, '#26c6da', '💧 Water Efficiency')}
                    ${scoreBar(crop.labor_score, '#ff9800', '⚙️ Low Labor')}
                    ${scoreBar(crop.sustainability_score, '#66bb6a', '🌱 Sustainability')}

                    <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--outline-variant);">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">
                            <div><span style="color:#999;">Investment</span><br><strong style="color:var(--on-surface);">₹${(crop.investment_inr||0).toLocaleString('en-IN')}</strong></div>
                            <div><span style="color:#999;">Revenue</span><br><strong style="color:#2e7d32;">₹${(crop.expected_revenue_inr||0).toLocaleString('en-IN')}</strong></div>
                            <div><span style="color:#999;">Net Profit</span><br><strong style="color:${(crop.net_profit_inr||0)>=0?'#2e7d32':'#c62828'};">₹${(crop.net_profit_inr||0).toLocaleString('en-IN')}</strong></div>
                            <div><span style="color:#999;">ROI</span><br><strong style="color:var(--primary);">${crop.roi_percent||0}%</strong></div>
                        </div>
                    </div>
                    <div style="margin-top:12px;font-size:12px;color:var(--on-surface-variant);line-height:1.5;">
                        <div style="margin-bottom:4px;"><strong style="color:var(--primary);">✅ Advantage:</strong> ${crop.key_advantage||'—'}</div>
                        <div style="margin-bottom:4px;"><strong style="color:#e65100;">⚠️ Risks:</strong> ${crop.risk_factors||'—'}</div>
                        <div><strong style="color:#1565c0;">📊 Season Fit:</strong> ${crop.season_fit||'—'}</div>
                    </div>
                </div>`;
            });
            cardsHTML += `</div>`;
            document.getElementById('compare-cards').innerHTML = cardsHTML;

            // Summary
            if (c.summary) {
                document.getElementById('compare-summary').innerHTML = `
                    <div class="card card-green" style="display:flex;align-items:flex-start;gap:12px;">
                        <span class="material-symbols-outlined" style="font-size:28px;margin-top:2px;">lightbulb</span>
                        <div><strong style="font-size:14px;">AI Recommendation</strong><p style="margin-top:4px;font-size:14px;line-height:1.6;">${c.summary}</p></div>
                    </div>`;
            }
        }
        document.getElementById('compare-result').style.display = 'block';
        document.getElementById('compare-result').scrollIntoView({ behavior: 'smooth' });
    } catch (err) { alert('Error: ' + err.message); }
    finally { txt.innerText = 'Compare Crops'; btn.disabled = false; }
});
