-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 22 Bulan Mei 2026 pada 11.00
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ipland_gis`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `hunian`
--

CREATE TABLE `hunian` (
  `id` int(11) NOT NULL,
  `nama_tipe` varchar(100) NOT NULL,
  `harga` decimal(15,2) NOT NULL,
  `status` enum('Tersedia','Booking','Terjual') DEFAULT 'Tersedia',
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `hunian`
--

INSERT INTO `hunian` (`id`, `nama_tipe`, `harga`, `status`, `latitude`, `longitude`, `created_at`) VALUES
(1, 'Tipe Zamzam 45/90', 650000000.00, 'Tersedia', -6.37610000, 106.92420000, '2026-05-22 08:06:39'),
(2, 'Tipe Firdaus 60/120', 850000000.00, 'Terjual', -6.37550000, 106.92500000, '2026-05-22 08:06:39');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `hunian`
--
ALTER TABLE `hunian`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `hunian`
--
ALTER TABLE `hunian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
