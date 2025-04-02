const UserDB = require("../model/User");
const PozDB = require("../model/Poz");
const ClusterDB = require("../model/Cluster");
const FieldTypeDB = require("../model/FieldType");
const LocalStockDB = require("../model/LocalStock");
const StockDB = require("../model/Stock");
const TransactionDB = require("../model/StockTransaction");
const ContractorPozPrice = require("../model/ContractorPozPrice");

//GET requirements

const GetSysRequirements = async (req, res) => {
    try {
        const user = req.user; // JWT'den gelen kullanıcı bilgisi

        let pozList;
        if (user.userType === 'Taşeron') {
            // Taşeron için pozları ve kendi fiyatlarını getir
            const contractorPrices = await ContractorPozPrice.find({ contractorId: user._id })
                .populate('pozId', 'name code unit price', 'pozes')
                .lean();

            // Poz verilerini düzenle
            pozList = contractorPrices.map(cp => ({
                _id: cp.pozId._id,
                name: cp.pozId.name,
                code: cp.pozId.code,
                unit: cp.pozId.unit,
                price: cp.price, // Taşeronun kendi fiyatı
                originalPrice: cp.pozId.price // Orijinal poz fiyatı
            }));
        } else {
            // Sistem Yetkilisi için tüm pozları getir
            const pozes = await PozDB.find();
            // Sistem Yetkilisi için price yerine originalPrice kullan
            pozList = pozes.map(poz => ({
                ...poz.toObject(),
                originalPrice: poz.price,
                price: poz.price
            }));
        }

        const [userList, clusterList, fieldTypeList, localStockList] = await Promise.all([
            UserDB.find().select('-password'),
            ClusterDB.find(),
            FieldTypeDB.find(),
            LocalStockDB.find()
        ]);
        
        res.status(200).json({ userList, pozList, clusterList, fieldTypeList, localStockList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const GetUser = async (req, res) => {   
    try {
        const user = await UserDB.findById(req.params.id);
        const userStock = await StockDB.find({ user: user._id }).populate('poz');
        console.log(userStock);
        const userTransactions = await TransactionDB.find({ user: user._id }).populate('poz', "name");
        res.status(200).json({ user, userStock, userTransactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { GetSysRequirements, GetUser };