const UserDB = require("../model/User");
const PozDB = require("../model/Poz")
const ClusterDB = require("../model/Cluster");
const FieldTypeDB = require("../model/FieldType");
const LocalStockDB = require("../model/LocalStock");
const StockDB = require("../model/Stock");
const TransactionDB = require("../model/StockTransaction");

//GET requirements

const GetSysRequirements = async (req, res) => {
    try {
        const [userList, pozList, clusterList, fieldTypeList, localStockList] = await Promise.all([
            UserDB.find().select('-password'),
            PozDB.find(),
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
        const userTransactions = await TransactionDB.find({ user: user._id }).populate('poz', "name");
        res.status(200).json({ user, userStock, userTransactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { GetSysRequirements, GetUser };