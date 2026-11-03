// app.js - Main Express application
const express = require('express');
const os = require('os');
const app = express();
const PORT = 3000;

// Track request count per instance
let requestCount = 0;
const startTime = new Date();

app.get('/', (req, res) => {
    requestCount++;
    const hostname = os.hostname();

    // Each server gets a unique color based on its hostname
    // This makes load balancing VISUALLY obvious when you refresh
    const colors = [
        '#0066cc', '#28a745', '#e83e8c',
        '#fd7e14', '#6f42c1', '#17a2b8'
    ];
    const colorIndex = hostname
        .split('')
        .reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
    const serverColor = colors[colorIndex];

    const uptimeMin = Math.floor(
        (Date.now() - startTime.getTime()) / 60000
    );

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>EC2 App — ${hostname}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      background: #f0f4f8;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      text-align: center;
    }
    .server-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: ${serverColor}18;
      color: ${serverColor};
      border: 1.5px solid ${serverColor}44;
      border-radius: 24px;
      padding: 6px 18px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .pulse {
      width: 9px; height: 9px;
      border-radius: 50%;
      background: ${serverColor};
      animation: pulse 1.4s infinite;
    }
    @keyframes pulse {
      0%,100% { opacity:1; transform:scale(1); }
      50% { opacity:0.4; transform:scale(0.8); }
    }
    h1 { font-size: 1.6rem; color: ${serverColor}; margin-bottom: 6px; }
    .subtitle { color: #888; font-size: 14px; margin-bottom: 24px; }
    .stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat { background: #f8f9fa; border-radius: 10px; padding: 14px; }
    .stat-num { font-size: 1.8rem; font-weight: 700; color: ${serverColor}; }
    .stat-label { font-size: 12px; color: #888; margin-top: 2px; }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      margin-bottom: 20px;
    }
    .info-table td {
      padding: 9px 8px;
      font-size: 13px;
      border-bottom: 1px solid #f0f0f0;
    }
    .info-table td:first-child { color: #888; width: 45%; }
    .info-table td:last-child { font-weight: 600; color: #333; word-break: break-all; }
    .refresh-hint { font-size: 12px; color: #aaa; margin-top: 8px; }
    .highlight-box {
      background: ${serverColor}10;
      border: 1.5px dashed ${serverColor}55;
      border-radius: 10px;
      padding: 12px;
      font-size: 13px;
      color: ${serverColor};
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="server-badge">
      <div class="pulse"></div>
      Live — Server Active
    </div>
    <h1>${hostname}</h1>
    <p class="subtitle">This request was served by the above EC2 instance</p>
    <div class="highlight-box">
      ↻ Refresh the page — if you see a different hostname or color,
      the Load Balancer switched servers!
    </div>
    <div class="stat-grid">
      <div class="stat">
        <div class="stat-num">${requestCount}</div>
        <div class="stat-label">Requests this server handled</div>
      </div>
      <div class="stat">
        <div class="stat-num">${uptimeMin}m</div>
        <div class="stat-label">Server uptime</div>
      </div>
    </div>
    <table class="info-table">
      <tr><td>Hostname</td><td>${hostname}</td></tr>
      <tr><td>Platform</td><td>${os.platform()} (${os.arch()})</td></tr>
      <tr><td>Node.js</td><td>${process.version}</td></tr>
      <tr><td>Total memory</td><td>${Math.round(os.totalmem()/1024/1024)} MB</td></tr>
      <tr><td>Served at</td><td>${new Date().toLocaleTimeString()}</td></tr>
    </table>
    <p class="refresh-hint">Each server tracks its own request count independently</p>
  </div>
</body>
</html>
  `);
});

// Health check endpoint - ALB uses this
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        hostname: os.hostname(),
        requestCount,
        uptime: process.uptime()
    });
});

app.listen(PORT, () => {
    console.log(`Server ${os.hostname()} running on port ${PORT}`);
});