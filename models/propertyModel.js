const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ipland_gis'
});

const getAllHunian = async () => {
    const [rows] = await pool.query('SELECT * FROM hunian');
    return rows;
};

// --- TAMBAHKAN KODE INI ---
const addHunian = async (data) => {
    const { nama_tipe, harga, status, latitude, longitude } = data;
    const [result] = await pool.query(
        'INSERT INTO hunian (nama_tipe, harga, status, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
        [nama_tipe, harga, status, latitude, longitude]
    );
    return result.insertId;
};

const updateHunian = async (id, data) => {
    const { nama_tipe, harga, status, latitude, longitude } = data;
    await pool.query(
        'UPDATE hunian SET nama_tipe=?, harga=?, status=?, latitude=?, longitude=? WHERE id=?',
        [nama_tipe, harga, status, latitude, longitude, id]
    );
};

const deleteHunian = async (id) => {
    await pool.query('DELETE FROM hunian WHERE id=?', [id]);
};

module.exports = { getAllHunian, addHunian, updateHunian, deleteHunian };