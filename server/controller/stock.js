const LocalStockDB = require("../model/LocalStock");
const StockDB = require("../model/Stock");
const StockTranstionDB = require("../model/StockTransaction");
const LocalStockLogDB = require("../model/LocalStockLog");
const PozDB = require("../model/Poz");

const AddLocalStock = async (req, res) => {
    try {
        const { poz, amount } = req.body;

        // Mevcut kaydı kontrol et
        const existingStock = await LocalStockDB.findOne({ poz });

        if (existingStock) {
            // Eğer kayıt varsa, amount değerini artır
            existingStock.amount += amount;
            await existingStock.save();
            await LogLocalStock(req.user._id, poz, amount);
            return res.status(200).json(existingStock);
        } else {
            // Eğer kayıt yoksa, yeni kayıt oluştur
            const newLocalStock = new LocalStockDB({ poz, amount });
            await newLocalStock.save();
            await LogLocalStock(req.user._id, poz, amount);
            return res.status(200).json(newLocalStock);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};


const TransferStock = async (req, res) => {
    try {
        const { user, localStockId, amount } = req.body;
        const localStock = await LocalStockDB.findOne({ _id: localStockId });

        if (localStock.amount < amount) {
            return res.status(409).json({ message: "Transfer için yeterli birim depoda bulunmuyor." });
        } else {
            // Kullanıcının deposunda ilgili poz ile kayıt var mı kontrol et
            const existingStock = await StockDB.findOne({ user, poz: localStock.poz });

            if (existingStock) {
                // Eğer varsa, amount değerini artır
                existingStock.amount += amount;
                await existingStock.save();
            } else {
                // Yoksa, yeni kayıt oluştur
                const newStock = new StockDB({ user, poz: localStock.poz, amount });
                await newStock.save();
            }

            // Transfer yapılan depodaki miktarı düş
            localStock.amount -= amount;
            await localStock.save();

            // Transfer işlemini logla
            await LogStockTransfer(req.user._id, user, "Satın Alım", localStock.poz, amount);

            res.status(200).json({ message: "Transfer başarılı." });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};


const LogLocalStock = async (user, poz, amount) => {
    try {
        const newLogLocalStock = new LocalStockLogDB({creator: user, poz, amount});
        await newLogLocalStock.save();
    } catch (error) {
        console.log(error);
    }
}

const GetLocalStockLog = async (req, res) => {
    try {
        const localStockLog = await LocalStockLogDB.find().populate("poz").populate("creator", "fullName");
        res.status(200).json(localStockLog);
    } catch (error) {
        console.log(error);
    }
}

const LogStockTransfer = async (creator, user, transactionType, poz, amount) => {
    try {
        const newStockTransaction = new StockTranstionDB({creator, user, transactionType, poz, amount});
        await newStockTransaction.save();
    } catch (error) {
        console.log(error);
    }
}

const GetStockTransferLog = async (req, res) => {
    try {
        const stockTransferLog = await StockTranstionDB.find()
            .populate("poz")
            .populate("creator", "fullName")
            .populate("user", "fullName");
        res.status(200).json(stockTransferLog);
    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
}


const GetMyStock = async (req, res) => {
    try {
        const user = req.user;
        const myStocks = await StockDB.find({ user: user._id }).populate("poz");
        res.status(200).json(myStocks);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const GetLocalStock = async (req, res) => {
    try {
        const localStock = await LocalStockDB.find().populate("poz");
        res.status(200).json(localStock);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const RefundStock = async (req, res) => {
    try {
        const { refunder, poz, amount } = req.body;
        const checkPoz = await PozDB.findById(poz);

        if (!checkPoz) {
            return res.status(404).json({ message: "Böyle bir poz bulunmamaktadır." });
        }

        const stock = await StockDB.findOne({ user: refunder, poz });
        if (stock.amount < amount) {
            return res.status(409).json({ message: "İade için yeterli stok yok." });
        }

        stock.amount -= amount;
        await stock.save();

        const localStock = await LocalStockDB.findOne({ poz });
        if (localStock) {
            localStock.amount += amount;
            await localStock.save();
        } else {
            await new LocalStockDB({ poz, amount }).save();
        }
        await LogStockTransfer(req.user._id, refunder, "İade", poz, amount);
        res.status(200).json({ message: "Stok başarıyla iade edildi." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Sunucu hatası", error });
    }
};


module.exports = { AddLocalStock, TransferStock, 
    GetMyStock, RefundStock, GetLocalStock, GetLocalStockLog, GetStockTransferLog };