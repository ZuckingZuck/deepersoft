const mongoose = require('mongoose');

const contractorPozPriceSchema = new mongoose.Schema({
    contractorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pozId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poz',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Aynı taşeron ve poz kombinasyonu için unique index
contractorPozPriceSchema.index({ contractorId: 1, pozId: 1 }, { unique: true });

module.exports = mongoose.model('ContractorPozPrice', contractorPozPriceSchema); 