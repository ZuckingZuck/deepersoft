const mongoose = require("mongoose");

const LocalStockLogSchema = mongoose.Schema({
    creator: {
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
        default: 0
    },
    documentUrl: {
        type: String
    }
}, {timestamps: true })

module.exports = mongoose.model("localstocklogs", LocalStockLogSchema);