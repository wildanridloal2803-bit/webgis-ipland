const PropertyModel = require('../models/propertyModel');

const getHunianAPI = async (req, res) => {
    try {
        const dataHunian = await PropertyModel.getAllHunian();
        
        const totalUnit = dataHunian.length;
        const terjual = dataHunian.filter(h => h.status === 'Terjual').length;
        const tersedia = dataHunian.filter(h => h.status === 'Tersedia').length;

        // Kembalikan data sebagai JSON
        res.json({
            success: true,
            stats: { totalUnit, terjual, tersedia },
            data: dataHunian
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
    }
};

const createHunian = async (req, res) => {
    try {
        await PropertyModel.addHunian(req.body);
        res.json({ success: true, message: 'Data berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const editHunian = async (req, res) => {
    try {
        await PropertyModel.updateHunian(req.params.id, req.body);
        res.json({ success: true, message: 'Data berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeHunian = async (req, res) => {
    try {
        await PropertyModel.deleteHunian(req.params.id);
        res.json({ success: true, message: 'Data berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getHunianAPI, createHunian, editHunian, removeHunian };