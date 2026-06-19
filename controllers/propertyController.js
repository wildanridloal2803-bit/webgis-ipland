const PropertyModel = require('../models/propertyModel');

const allowedStatuses = ['Tersedia', 'Booking', 'Terjual'];
const allowedKategori = ['Subsidi', 'Komersil', 'Cluster Premium'];
const validateHunianPayload = (payload) => {
    const nama_tipe = typeof payload.nama_tipe === 'string' ? payload.nama_tipe.trim() : '';
    const kategoriInput = typeof payload.kategori === 'string' ? payload.kategori.trim() : '';
    const kategori = kategoriInput || 'Komersil';
    const harga = Number(payload.harga);
    const status = payload.status;
    const rute_url = typeof payload.rute_url === 'string' ? payload.rute_url.trim() : '';
    const denah_url = typeof payload.denah_url === 'string' ? payload.denah_url.trim() : '';
    const latitude = Number(payload.latitude);
    const longitude = Number(payload.longitude);

    if (!nama_tipe) return { error: 'Nama atau tipe hunian wajib diisi' };
    if (!allowedKategori.includes(kategori)) return { error: 'Kategori hunian tidak valid' };
    if (!Number.isFinite(harga) || harga <= 0) return { error: 'Harga harus berupa angka positif' };
    if (!allowedStatuses.includes(status)) return { error: 'Status hunian tidak valid' };
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return { error: 'Latitude tidak valid' };
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return { error: 'Longitude tidak valid' };

    return {
        data: {
            nama_tipe,
            kategori,
            harga,
            status,
            rute_url: rute_url || `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
            denah_url,
            latitude,
            longitude
        }
    };
};

const validateId = (id) => {
    const parsedId = Number(id);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const getHunianAPI = async (req, res) => {
    try {
        const dataHunian = await PropertyModel.getAllHunian();
        const totalUnit = dataHunian.length;
        const terjual = dataHunian.filter(h => h.status === 'Terjual').length;
        const tersedia = dataHunian.filter(h => h.status === 'Tersedia').length;

        res.json({
            success: true,
            stats: { totalUnit, terjual, tersedia },
            data: dataHunian
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
};

const createHunian = async (req, res) => {
    try {
        const validation = validateHunianPayload(req.body);
        if (validation.error) {
            return res.status(400).json({ success: false, message: validation.error });
        }

        await PropertyModel.addHunian(validation.data);
        res.json({ success: true, message: 'Data berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const editHunian = async (req, res) => {
    try {
        const id = validateId(req.params.id);
        if (!id) return res.status(400).json({ success: false, message: 'ID hunian tidak valid' });

        const validation = validateHunianPayload(req.body);
        if (validation.error) {
            return res.status(400).json({ success: false, message: validation.error });
        }

        await PropertyModel.updateHunian(id, validation.data);
        res.json({ success: true, message: 'Data berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeHunian = async (req, res) => {
    try {
        const id = validateId(req.params.id);
        if (!id) return res.status(400).json({ success: false, message: 'ID hunian tidak valid' });

        await PropertyModel.deleteHunian(id);
        res.json({ success: true, message: 'Data berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getHunianAPI, createHunian, editHunian, removeHunian };
