const mongoose = require("mongoose");

const ProjectPozSchema = mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects",
        required: true
    },
    pozId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pozes",
        required: true
    },
    // Poz bilgileri
    name: {
        type: String,
        required: true
    },
    unit: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    contractorPrice: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("projectpozlar", ProjectPozSchema);