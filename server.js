const express = require('express');
const path = require('path');
const propertyController = require('./controllers/propertyController');

const app = express();

// Middleware untuk membaca JSON dan melayani file statis
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 1. RUTE HALAMAN (FRONTEND VIEW)
// ==========================================

// Rute Default (http://localhost:3000/) otomatis memuat public/index.html
// Rute untuk halaman Dashboard Admin (http://localhost:3000/dashboard)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});


// --- API Login Baru ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Hardcode pengecekan akun (Bisa diganti dengan query ke MySQL nanti)
    if (username === 'admin' && password === 'ipland123') {
        // Beri token acak sebagai penanda sesi berhasil
        res.json({ success: true, token: 'auth-token-' + Date.now() });
    } else {
        res.status(401).json({ success: false, message: 'Username atau password salah' });
    }
});

// ==========================================
// 2. RUTE API (BACKEND DATA)
// ==========================================
app.get('/api/hunian', propertyController.getHunianAPI);         // READ
app.post('/api/hunian', propertyController.createHunian);        // CREATE
app.put('/api/hunian/:id', propertyController.editHunian);       // UPDATE
app.delete('/api/hunian/:id', propertyController.removeHunian);  // DELETE


// ==========================================
// JALANKAN SERVER
// ==========================================
app.listen(3000, () => {
    console.log('🚀 Server WebGIS berjalan!');
    console.log('▶ Akses Publik: http://localhost:3000/');
    console.log('▶ Akses Admin : http://localhost:3000/dashboard');
});