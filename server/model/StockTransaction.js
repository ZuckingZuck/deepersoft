const mongoose = require("mongoose");

const StockTranstionSchema = mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
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
    date: {
        type: Date,
        required: true
    },
    refund: {
        type: Number,
        default: 0
    },
    warehouseRelease: {
        type: Number,
        default: 0
    },
    entitlement: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

module.exports = mongoose.model("stocktransactions", StockTranstionSchema);