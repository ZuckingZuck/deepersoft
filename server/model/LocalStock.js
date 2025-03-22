const mongoose = require("mongoose");

const LocalStockSchema = mongoose.Schema({
    poz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pozes",
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    return: {
        type: Number,
        default: 0
    },
    stockOut: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

module.exports = mongoose.model("localstocks", LocalStockSchema);