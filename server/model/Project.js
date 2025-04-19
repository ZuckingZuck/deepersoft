const mongoose = require("mongoose");

const ProjectSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fieldType: {
        type: String,
        required: true
    },
    city: {
        type: String,
        default: "İstanbul"
    },
    clusterName: {
        type: String,
        default: "ISTAD-UMRANIYE_GPON_2023-1"
    },
    fieldName: {
        type: String,
        required: true
    },
    ddo: {
        type: String,
        required: true,
    },
    tellcordiaNo: {
        type: String,
        required: true
    },
    loc: {
        type: String,
    },
    sir: {
        type: String,
    },
    homePass:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    contractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    status: {
        type: String,
        enum: ["İşlemde", "Onayda", "İncelendi", "Montaj Tamam", "Tamamlandı", "Islah ve Düzenleme", "Beklemede", "Arşivde"],
        default: "İşlemde"
    },
    IMLT: {
        type: Boolean,
        default: false
    },
    AKTV: {
        type: Boolean,
        default: false
    },
    ISLH: {
        type: Boolean,
        default: false
    },
    HSRSZ: {
        type: Boolean,
        default: false
    },
    KMZ: {
        type: Boolean,
        default: false
    },
    OTDR: {
        type: Boolean,
        default: false
    },
    MTBKT: {
        type: Boolean,
        default: false
    },
    KSF: {
        type: Boolean,
        default: false
    },
    BRKD: {
        type: Boolean,
        default: false
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    totalContractorPrice: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

module.exports = mongoose.model("projects", ProjectSchema);