const mongoose = require("mongoose");

const StockTranstionSchema = mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    base: {
        type: String,
        default: "Yerel Depo"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    transactionType: {
        type: String,
        enum: ["Satın Alım", "İade"],
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
    },
    documentUrl: {
        type: String
    },
}, {timestamps: true})

module.exports = mongoose.model("stocktransactions", StockTranstionSchema);