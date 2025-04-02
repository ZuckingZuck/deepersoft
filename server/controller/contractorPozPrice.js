const ContractorPozPriceDB = require('../model/ContractorPozPrice');
const PozDB = require('../model/Poz');
const UserDB = require('../model/User');

// Taşeron poz fiyatı ekleme
const AddContractorPozPrice = async (req, res) => {
    try {
        const { contractorId, pozId, price, notes } = req.body;

        // Taşeron kontrolü
        const contractor = await UserDB.findById(contractorId);
        if (!contractor || contractor.userType !== 'Taşeron') {
            return res.status(400).json({ message: 'Geçersiz taşeron' });
        }

        // Poz kontrolü
        const poz = await PozDB.findById(pozId);
        if (!poz) {
            return res.status(400).json({ message: 'Geçersiz poz' });
        }

        // Fiyat kontrolü
        if (!price || price <= 0) {
            return res.status(400).json({ message: 'Geçersiz fiyat' });
        }

        // Aynı taşeron ve poz için fiyat var mı kontrol et
        const existingPrice = await ContractorPozPriceDB.findOne({ contractorId, pozId });
        if (existingPrice) {
            return res.status(400).json({ message: 'Bu taşeron için bu pozun fiyatı zaten tanımlanmış' });
        }

        // Yeni fiyat oluştur
        const newPrice = new ContractorPozPriceDB({
            contractorId,
            pozId,
            price,
            notes
        });

        await newPrice.save();
        res.status(201).json(newPrice);
    } catch (error) {
        console.error('Taşeron poz fiyatı eklenirken hata:', error);
        res.status(500).json({ message: 'Taşeron poz fiyatı eklenirken bir hata oluştu' });
    }
};

// Taşeron poz fiyatlarını getirme
const GetContractorPozPrices = async (req, res) => {
    try {
        const { contractorId } = req.query;

        // Taşeron kontrolü
        if (contractorId) {
            const contractor = await UserDB.findById(contractorId);
            if (!contractor || contractor.userType !== 'Taşeron') {
                return res.status(400).json({ message: 'Geçersiz taşeron' });
            }
        }

        // Fiyatları getir
        const prices = await ContractorPozPriceDB.find(contractorId ? { contractorId } : {})
            .populate('contractorId', 'fullName')
            .populate('pozId', 'name description unit');

        res.status(200).json(prices);
    } catch (error) {
        console.error('Taşeron poz fiyatları alınırken hata:', error);
        res.status(500).json({ message: 'Taşeron poz fiyatları alınırken bir hata oluştu' });
    }
};

// Taşeron poz fiyatı güncelleme
const UpdateContractorPozPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, notes } = req.body;

        // Fiyat kontrolü
        if (!price || price <= 0) {
            return res.status(400).json({ message: 'Geçersiz fiyat' });
        }

        const contractorPozPrice = await ContractorPozPriceDB.findById(id);
        if (!contractorPozPrice) {
            return res.status(404).json({ message: 'Fiyat bulunamadı' });
        }

        contractorPozPrice.price = price;
        contractorPozPrice.notes = notes;

        await contractorPozPrice.save();
        res.status(200).json(contractorPozPrice);
    } catch (error) {
        console.error('Taşeron poz fiyatı güncellenirken hata:', error);
        res.status(500).json({ message: 'Taşeron poz fiyatı güncellenirken bir hata oluştu' });
    }
};

// Taşeron poz fiyatı silme
const DeleteContractorPozPrice = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPrice = await ContractorPozPriceDB.findByIdAndDelete(id);
        if (!deletedPrice) {
            return res.status(404).json({ message: 'Fiyat bulunamadı' });
        }

        res.status(200).json({ message: 'Fiyat başarıyla silindi' });
    } catch (error) {
        console.error('Taşeron poz fiyatı silinirken hata:', error);
        res.status(500).json({ message: 'Taşeron poz fiyatı silinirken bir hata oluştu' });
    }
};

// Toplu taşeron poz fiyatı ekleme
const BulkAddContractorPozPrices = async (req, res) => {
    console.log("istekgeldi bulk add");
    try {
        const { contractorId, prices } = req.body;

        // Taşeron kontrolü
        const contractor = await UserDB.findById(contractorId);
        if (!contractor || contractor.userType !== 'Taşeron') {
            return res.status(400).json({ message: 'Geçersiz taşeron' });
        }

        // Tüm poz kodlarını tek seferde getir
        const pozCodes = prices.map(p => p.code);
        const pozes = await PozDB.find({ code: { $in: pozCodes } });
        const pozMap = new Map(pozes.map(p => [p.code, p]));

        // Mevcut taşeron poz fiyatlarını tek seferde getir
        const existingPrices = await ContractorPozPriceDB.find({ 
            contractorId,
            pozId: { $in: pozes.map(p => p._id) }
        });
        const existingPriceMap = new Map(existingPrices.map(p => [p.pozId.toString(), p]));

        // İşlemleri paralel olarak yap
        const operations = prices.map(async (priceData) => {
            try {
                const { code, price } = priceData;
                const poz = pozMap.get(code);

                if (!poz) {
                    return { error: `Poz bulunamadı: ${code}` };
                }

                if (!price || price <= 0) {
                    return { error: `Geçersiz fiyat: ${price}` };
                }

                const existingPrice = existingPriceMap.get(poz._id.toString());

                if (existingPrice) {
                    // Fiyat varsa güncelle
                    existingPrice.price = price;
                    await existingPrice.save();
                    return { success: existingPrice };
                } else {
                    // Fiyat yoksa yeni ekle
                    const newPrice = new ContractorPozPriceDB({
                        contractorId,
                        pozId: poz._id,
                        price
                    });
                    await newPrice.save();
                    return { success: newPrice };
                }
            } catch (error) {
                return { error: `Hata: ${priceData.code} - ${error.message}` };
            }
        });

        // Tüm işlemleri paralel olarak çalıştır
        const results = await Promise.all(operations);

        // Sonuçları ayır
        const successes = results.filter(r => r.success).map(r => r.success);
        const errors = results.filter(r => r.error).map(r => r.error);

        res.status(200).json({
            message: 'Toplu fiyat ekleme tamamlandı',
            successCount: successes.length,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Toplu taşeron poz fiyatı eklenirken hata:', error);
        res.status(500).json({ message: 'Toplu taşeron poz fiyatı eklenirken bir hata oluştu' });
    }
};

module.exports = {
    AddContractorPozPrice,
    GetContractorPozPrices,
    UpdateContractorPozPrice,
    DeleteContractorPozPrice,
    BulkAddContractorPozPrices
}; 