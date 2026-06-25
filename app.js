const express = require('express');
const path = require('path');
const QRCode = require('qrcode');

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

function escapeWifiField(value) {
  return String(value).replace(/([\\;,:"])/g, '\\$1');
}

function buildWifiPayload({ ssid, password, security, hidden }) {
  const type = security === 'nopass' ? 'nopass' : security === 'WEP' ? 'WEP' : 'WPA';
  const s = escapeWifiField(ssid);
  const h = hidden ? 'true' : 'false';

  if (type === 'nopass') {
    return `WIFI:T:nopass;S:${s};H:${h};;`;
  }

  const p = escapeWifiField(password);
  return `WIFI:T:${type};S:${s};P:${p};H:${h};;`;
}

// Network credentials are used only to build the in-memory payload below and
// are never logged or persisted — do not add logging of req.body here.
app.post('/api/generate', async (req, res) => {
  const { ssid, password, security, hidden } = req.body || {};

  if (!ssid || typeof ssid !== 'string' || ssid.length > 32) {
    return res.status(400).json({ error: 'SSID is required and must be 32 characters or fewer.' });
  }
  if (security !== 'nopass' && (!password || typeof password !== 'string' || password.length > 63)) {
    return res.status(400).json({ error: 'Password is required for secured networks and must be 63 characters or fewer.' });
  }

  try {
    const payload = buildWifiPayload({ ssid, password, security, hidden: Boolean(hidden) });
    const dataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
    });
    res.json({ dataUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code.' });
  }
});

module.exports = app;
