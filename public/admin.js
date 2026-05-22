let map;
let marker;

document.addEventListener('DOMContentLoaded', () => {
    loadTableData();

    // Event listener untuk submit form
    document.getElementById('crud-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveData();
    });
});

// --- 1. READ: Ambil dan Tampilkan Data ke Tabel ---
async function loadTableData() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">Memuat data...</td></tr>';
    
    try {
        const res = await fetch('/api/hunian');
        const result = await res.json();
        
        tbody.innerHTML = '';
        if(result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">Belum ada data.</td></tr>';
            return;
        }

        result.data.forEach(item => {
            // Data diselipkan sebagai string JSON di atribut tombol Edit
            const itemData = JSON.stringify(item).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
            
            let statusColor = item.status === 'Terjual' ? 'bg-rose-100 text-rose-700' : 
                             (item.status === 'Booking' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700');

            tbody.innerHTML += `
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td class="p-4 font-medium">${item.nama_tipe}</td>
                    <td class="p-4">Rp ${parseInt(item.harga).toLocaleString('id-ID')}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 text-xs rounded-full ${statusColor}">${item.status}</span>
                    </td>
                    <td class="p-4">
                        <button onclick="openModal(true, '${itemData}')" class="text-blue-500 hover:underline mr-3 text-sm">Edit</button>
                        <button onclick="deleteData(${item.id})" class="text-red-500 hover:underline text-sm">Hapus</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Gagal load tabel", error);
    }
}

// --- 2. CREATE & UPDATE: Simpan Data ---
async function saveData() {
    const id = document.getElementById('form-id').value;
    const data = {
        nama_tipe: document.getElementById('form-nama').value,
        harga: document.getElementById('form-harga').value,
        status: document.getElementById('form-status').value,
        latitude: document.getElementById('form-lat').value,
        longitude: document.getElementById('form-lng').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/hunian/${id}` : '/api/hunian';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        
        if(result.success) {
            closeModal();
            loadTableData(); // Refresh tabel
        } else {
            alert('Gagal menyimpan: ' + result.message);
        }
    } catch (error) {
        console.error(error);
    }
}

// --- 3. DELETE: Hapus Data ---
async function deleteData(id) {
    if(confirm('Yakin ingin menghapus data ini?')) {
        try {
            const res = await fetch(`/api/hunian/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if(result.success) loadTableData();
        } catch (error) {
            console.error(error);
        }
    }
}

// --- 4. MANAJEMEN MODAL & PETA INTERAKTIF ---
function openModal(isEdit = false, rawData = null) {
    document.getElementById('crud-modal').classList.remove('hidden');
    
    // Reset Form
    document.getElementById('crud-form').reset();
    document.getElementById('form-id').value = '';
    
    let defaultLat = -6.3761; // Default Jatisampurna
    let defaultLng = 106.9242;

    if (isEdit && rawData) {
        document.getElementById('modal-title').innerText = 'Edit Hunian';
        const item = JSON.parse(rawData);
        
        document.getElementById('form-id').value = item.id;
        document.getElementById('form-nama').value = item.nama_tipe;
        document.getElementById('form-harga').value = item.harga;
        document.getElementById('form-status').value = item.status;
        document.getElementById('form-lat').value = item.latitude;
        document.getElementById('form-lng').value = item.longitude;
        
        defaultLat = item.latitude;
        defaultLng = item.longitude;
    } else {
        document.getElementById('modal-title').innerText = 'Tambah Hunian';
    }

    // Trik Leaflet: Peta tidak bisa render sempurna jika kontainernya "display: none". 
    // Kita harus inisialisasi / perbarui peta setelah modal terbuka.
    setTimeout(() => {
        initFormMap(defaultLat, defaultLng);
    }, 100);
}

function closeModal() {
    document.getElementById('crud-modal').classList.add('hidden');
}

function initFormMap(lat, lng) {
    if (!map) {
        // Inisialisasi peta pertama kali
        map = L.map('form-map').setView([lat, lng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // Tambah marker yang bisa digeser
        marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        
        // Event: Saat marker digeser, update input koordinat
        marker.on('dragend', function (e) {
            const pos = marker.getLatLng();
            document.getElementById('form-lat').value = pos.lat.toFixed(8);
            document.getElementById('form-lng').value = pos.lng.toFixed(8);
        });

        // Event: Saat peta diklik, pindahkan marker ke titik tersebut
        map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            document.getElementById('form-lat').value = e.latlng.lat.toFixed(8);
            document.getElementById('form-lng').value = e.latlng.lng.toFixed(8);
        });
    } else {
        // Jika peta sudah ada, update view dan posisi marker saja
        map.invalidateSize(); // Wajib agar ukuran peta tidak error di dalam modal
        map.setView([lat, lng], 16);
        marker.setLatLng([lat, lng]);
    }

    // Set nilai input awal
    document.getElementById('form-lat').value = lat;
    document.getElementById('form-lng').value = lng;
}