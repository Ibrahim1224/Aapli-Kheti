// ═══════════════════════════════════════════════════════════════════
// Aapli Kheti – Frontend v3 (Season Planner + Animations)
// ═══════════════════════════════════════════════════════════════════

let currentLanguage = "English", userLat = 19.076, userLon = 72.8777, dashboardMap = null;

// ─── i18n ─────────────────────────────────────────────────────────
const i18n = {
    English: { nav_dashboard:"Dashboard", nav_smart:"Smart Estimator", nav_season:"Season Planner", nav_doctor:"Crop Doctor", nav_market:"Market Analysis", nav_roi:"ROI Calculator", dash_title:"Dashboard", dash_desc:"Real-time weather, 5-day forecast, and AI-powered daily advisory.", weather_title:"Current Weather", forecast_title:"5-Day Forecast", location_title:"Farm Location", advisory_title:"Today's Advisory", smart_title:"🧑‍🌾 Smart Soil Estimator", smart_desc:"No lab test? Just answer simple questions and let AI estimate your soil & recommend crops!", season_title:"🗓️ Season Planner", season_desc:"AI predicts next season's weather and recommends what to plant. Plus a full 12-month calendar.", doctor_title:"📸 Crop Doctor", doctor_desc:"Upload a photo and AI diagnoses diseases instantly.", market_title:"Market Analysis", market_desc:"AI-powered market prices, trends, and selling times.", roi_title:"ROI Calculator", roi_desc:"Estimate return on investment with AI cost breakdown.", upload_prompt:"Click or drag a photo here" },
    Hindi: { nav_dashboard:"डैशबोर्ड", nav_smart:"स्मार्ट अनुमान", nav_season:"मौसम योजना", nav_doctor:"फसल डॉक्टर", nav_market:"बाज़ार विश्लेषण", nav_roi:"ROI कैलकुलेटर", dash_title:"डैशबोर्ड", dash_desc:"मौसम, पूर्वानुमान और AI सलाह।", weather_title:"मौजूदा मौसम", forecast_title:"5-दिन का पूर्वानुमान", location_title:"खेत का स्थान", advisory_title:"आज की सलाह", smart_title:"🧑‍🌾 स्मार्ट मिट्टी अनुमान", smart_desc:"मिट्टी का pH नहीं पता? सरल सवालों का जवाब दें!", season_title:"🗓️ मौसम योजना", season_desc:"AI अगले मौसम की भविष्यवाणी करता है।", doctor_title:"📸 फसल डॉक्टर", doctor_desc:"फोटो अपलोड करें, AI बीमारी बताएगा।", market_title:"बाज़ार विश्लेषण", market_desc:"AI बाज़ार भाव और रुझान।", roi_title:"ROI कैलकुलेटर", roi_desc:"AI लागत विश्लेषण।", upload_prompt:"फोटो यहाँ डालें" },
    Marathi: { nav_dashboard:"डॅशबोर्ड", nav_smart:"स्मार्ट अंदाज", nav_season:"हंगाम नियोजन", nav_doctor:"पीक डॉक्टर", nav_market:"बाजार विश्लेषण", nav_roi:"ROI कॅल्क्युलेटर", dash_title:"डॅशबोर्ड", dash_desc:"हवामान, अंदाज आणि AI सल्ला.", weather_title:"सध्याचे हवामान", forecast_title:"5-दिवसांचा अंदाज", location_title:"शेताचे ठिकाण", advisory_title:"आजचा सल्ला", smart_title:"🧑‍🌾 स्मार्ट माती अंदाज", smart_desc:"pH माहित नाही? सोप्या प्रश्नांची उत्तरे द्या!", season_title:"🗓️ हंगाम नियोजन", season_desc:"AI पुढील हंगामाचा अंदाज वर्तवतो.", doctor_title:"📸 पीक डॉक्टर", doctor_desc:"फोटो अपलोड करा, AI रोग ओळखेल.", market_title:"बाजार विश्लेषण", market_desc:"AI बाजारभाव आणि ट्रेंड.", roi_title:"ROI कॅल्क्युलेटर", roi_desc:"AI खर्च विश्लेषण.", upload_prompt:"फोटो इथे टाका" }
};
function updateLanguageUI() { const t = i18n[currentLanguage]||i18n.English; document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); if (t[k]) el.textContent = t[k]; }); }
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
    txt.innerHTML='<div class="spinner"></div> Predicting...'; btn.disabled=true;
    try {
        const data = await apiCall('/api/season-predict','POST',{ lat:userLat, lon:userLon, language:currentLanguage });
        document.getElementById('predict-content').innerText = data.prediction;
        document.getElementById('predict-result').style.display='block';
        document.getElementById('predict-result').scrollIntoView({behavior:'smooth'});
    } catch(err) { alert("Error: "+err.message); }
    finally { txt.innerText='🔮 Predict Next Season Crops'; btn.disabled=false; }
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
