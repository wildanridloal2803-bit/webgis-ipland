ALTER TABLE hunian
  ADD COLUMN rute_url VARCHAR(255) NULL AFTER status,
  ADD COLUMN denah_url VARCHAR(255) NULL AFTER rute_url;

UPDATE hunian
SET rute_url = CONCAT('https://www.google.com/maps/dir/?api=1&destination=', latitude, ',', longitude)
WHERE rute_url IS NULL OR rute_url = '';
