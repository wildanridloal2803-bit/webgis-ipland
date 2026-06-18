const express = require('express');
const path = require('path');
const crypto = require('crypto');
const propertyController = require('./controllers/propertyController');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_COOKIE = 'ipland_admin_token';
const activeSessions = new Set();

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

app.use(express.json());

const parseCookies = (cookieHeader = '') => {
    return cookieHeader.split(';').reduce((cookies, item) => {
        const [rawKey, ...rawValue] = item.trim().split('=');
        if (!rawKey) return cookies;
        cookies[rawKey] = decodeURIComponent(rawValue.join('='));
        return cookies;
    }, {});
};

const getAuthToken = (req) => {
    const authHeader = req.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);

    const cookies = parseCookies(req.headers.cookie);
    return cookies[SESSION_COOKIE];
};

const setSessionCookie = (res, token) => {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader(
        'Set-Cookie',
        `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=7200${secure}`
    );
};

const clearSessionCookie = (res) => {
    res.setHeader(
        'Set-Cookie',
        `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
    );
};

const requireAdmin = (req, res, next) => {
    const token = getAuthToken(req);
    if (!token || !activeSessions.has(token)) {
        return res.status(401).json({ success: false, message: 'Sesi admin tidak valid' });
    }
    next();
};

const requireAdminPage = (req, res, next) => {
    const token = getAuthToken(req);
    if (!token || !activeSessions.has(token)) {
        return res.redirect('/login');
    }
    next();
};

const isAllowedGoogleMapsHost = (rawUrl) => {
    try {
        const { hostname } = new URL(rawUrl);
        return ['maps.app.goo.gl', 'goo.gl', 'www.google.com', 'google.com', 'maps.google.com'].includes(hostname);
    } catch (error) {
        return false;
    }
};

const extractCoordinates = (value = '') => {
    const patterns = [
        /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
        /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
        /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
        /(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/
    ];

    for (const pattern of patterns) {
        const match = value.match(pattern);
        if (match) {
            const latitude = Number(match[1]);
            const longitude = Number(match[2]);
            if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
                return { latitude, longitude };
            }
        }
    }

    return null;
};

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', requireAdminPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/dashboard.html', requireAdminPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin.html', requireAdminPage, (req, res) => {
    res.redirect('/dashboard');
});

app.post('/api/login', async (req, res) => {
    try {
        const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
        const password = typeof req.body.password === 'string' ? req.body.password : '';

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password wajib diisi'
            });
        }

        const [rows] = await db.query(
            `SELECT id, username, password_hash, nama, is_active
             FROM admins
             WHERE username = ? AND is_active = 1
             LIMIT 1`,
            [username]
        );

        const admin = rows[0];

        if (!admin || admin.password_hash !== hashPassword(password)) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        const token = crypto.randomBytes(32).toString('hex');
        activeSessions.add(token);
        setSessionCookie(res, token);

        return res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                nama: admin.nama
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
});

app.post('/api/logout', requireAdmin, (req, res) => {
    activeSessions.delete(getAuthToken(req));
    clearSessionCookie(res);
    res.json({ success: true });
});

app.get('/api/hunian', propertyController.getHunianAPI);
app.post('/api/hunian', requireAdmin, propertyController.createHunian);
app.put('/api/hunian/:id', requireAdmin, propertyController.editHunian);
app.delete('/api/hunian/:id', requireAdmin, propertyController.removeHunian);

app.post('/api/extract-link', requireAdmin, async (req, res) => {
    const { url } = req.body;

    if (typeof url !== 'string' || !isAllowedGoogleMapsHost(url)) {
        return res.status(400).json({ success: false, message: 'Link Google Maps tidak valid' });
    }

    const directCoordinates = extractCoordinates(url);
    if (directCoordinates) return res.json({ success: true, ...directCoordinates });

    try {
        const response = await fetch(url, { redirect: 'follow' });
        const coordinates = extractCoordinates(response.url);

        if (!coordinates) {
            return res.status(422).json({ success: false, message: 'Koordinat tidak ditemukan pada link' });
        }

        res.json({ success: true, ...coordinates });
    } catch (error) {
        res.status(502).json({ success: false, message: 'Gagal membaca link Google Maps' });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log('Server WebGIS berjalan.');
    console.log(`Akses Publik: http://localhost:${PORT}/`);
    console.log(`Akses Admin : http://localhost:${PORT}/dashboard`);
});
