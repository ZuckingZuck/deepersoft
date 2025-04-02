const express = require('express');
const router = express.Router();
const { AddContractorPozPrice, GetContractorPozPrices, UpdateContractorPozPrice, DeleteContractorPozPrice, BulkAddContractorPozPrices } = require('../controller/contractorPozPrice');
const auth = require('../middleware/auth');

// Taşeron poz fiyatı ekleme
router.post('/add', auth, AddContractorPozPrice);

// Taşeron poz fiyatlarını getirme
router.get('/list', auth, GetContractorPozPrices);

// Taşeron poz fiyatı güncelleme
router.put('/update/:id', auth, UpdateContractorPozPrice);

// Taşeron poz fiyatı silme
router.delete('/delete/:id', auth, DeleteContractorPozPrice);

// Toplu taşeron poz fiyatı ekleme
router.post('/bulk', auth, BulkAddContractorPozPrices);

module.exports = router; 