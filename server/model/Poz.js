const mongoose = require("mongoose");

const PozSchema = mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    priceType: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    contractorPrice: {
        type: Number,
        default: 0
    },
    unit: {
        type: String
    }
}, { timestamps: true })

module.exports = mongoose.model("pozes", PozSchema);