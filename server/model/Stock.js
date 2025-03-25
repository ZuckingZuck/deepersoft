const mongoose = require("mongoose");

const StockSchema = mongoose.Schema({
    user: {
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

module.exports = mongoose.model("stocks", StockSchema);