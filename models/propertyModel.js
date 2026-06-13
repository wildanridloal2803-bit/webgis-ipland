const pool = require('../config/db');

const getAllHunian = async () => {
    const [rows] = await pool.query('SELECT * FROM hunian ORDER BY created_at DESC, id DESC');
    return rows;
};

const addHunian = async (data) => {
    const { nama_tipe, harga, status, rute_url, denah_url, latitude, longitude } = data;
    const [result] = await pool.query(
        'INSERT INTO hunian (nama_tipe, harga, status, rute_url, denah_url, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nama_tipe, harga, status, rute_url, denah_url, latitude, longitude]
    );
    return result.insertId;
};

const updateHunian = async (id, data) => {
    const { nama_tipe, harga, status, rute_url, denah_url, latitude, longitude } = data;
    await pool.query(
        'UPDATE hunian SET nama_tipe=?, harga=?, status=?, rute_url=?, denah_url=?, latitude=?, longitude=? WHERE id=?',
        [nama_tipe, harga, status, rute_url, denah_url, latitude, longitude, id]
    );
};

const deleteHunian = async (id) => {
    await pool.query('DELETE FROM hunian WHERE id=?', [id]);
};

module.exports = { getAllHunian, addHunian, updateHunian, deleteHunian };
