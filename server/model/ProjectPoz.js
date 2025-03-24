const mongoose = require("mongoose");

const ProjectPozSchema = mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects",
        required: true
    },
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
    },
    unit: {
        type: String,
    }
}, {timestamps: true})

module.exports = mongoose.model("projectpozes", ProjectPozSchema);