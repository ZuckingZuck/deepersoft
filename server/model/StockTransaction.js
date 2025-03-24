const mongoose = require("mongoose");

const StockTranstionSchema = mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    seller: {
        type: String,
        default: "Yerel Depo"
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    poz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pozes",
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model("stocktransactions", StockTranstionSchema);