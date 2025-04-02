const PozDB = require("../model/Poz");
const ContractorPozPrice = require("../model/ContractorPozPrice");


const GetPozes = async (req, res) => {
    console.log("poz istek geldi", req.user);
    try {
        const user = req.user; // JWT'den gelen kullanıcı bilgisi

        if (user.userType === 'Taşeron') {
            console.log("taşeron istek geldi");
            // Taşeron için pozları ve kendi fiyatlarını getir
            const contractorPrices = await ContractorPozPrice.find({ contractorId: user._id })
                .populate('pozId', 'name code unit price')
                .lean();

            // Poz verilerini düzenle
            const formattedPozes = contractorPrices.map(cp => ({
                _id: cp.pozId._id,
                name: cp.pozId.name,
                code: cp.pozId.code,
                unit: cp.pozId.unit,
                price: cp.price, // Taşeronun kendi fiyatı
                originalPrice: cp.pozId.price // Orijinal poz fiyatı
            }));

            res.status(200).json(formattedPozes);
        } else {
            console.log("sistem yetkilisi istek geldi");
            // Sistem Yetkilisi için tüm pozları getir
            const pozes = await PozDB.find();
            // Sistem Yetkilisi için price yerine originalPrice kullan
            const formattedPozes = pozes.map(poz => ({
                ...poz.toObject(),
                originalPrice: poz.price,
                price: poz.price
            }));
            res.status(200).json(formattedPozes);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}
// Tekli ekleme veya güncelleme fonksiyonu
const AddorUpdatePoz = async (req, res) => {
    try {
        const poz = req.body;
        const updatedPoz = await PozDB.findOneAndUpdate(
            { code: poz.code },
            poz,
            { new: true, upsert: true }
        );

        res.status(200).json(updatedPoz);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

// Çoklu ekleme veya güncelleme fonksiyonu
const BulkAddorUpdatePoz = async (req, res) => {
    try {
        const pozes = req.body.pozes; // Gelen pozes dizisi
        if (!Array.isArray(pozes)) {
            return res.status(400).json({ message: "Invalid data format" });
        }

        // Her bir poz için güncelleme veya ekleme işlemi
        const operations = pozes.map(poz => 
            PozDB.findOneAndUpdate(
                { code: poz.code },
                poz,
                { new: true, upsert: true }
            )
        );

        const updatedPozes = await Promise.all(operations);

        res.status(200).json(updatedPozes);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const DeletePoz = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPoz = await PozDB.findByIdAndDelete(id);
        if (!deletedPoz) {
            return res.status(404).json({ message: "Poz bulunamadı." });
        }
        res.status(200).json({ message: "Poz başarıyla silindi." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

module.exports = {GetPozes, AddorUpdatePoz, BulkAddorUpdatePoz, DeletePoz };
