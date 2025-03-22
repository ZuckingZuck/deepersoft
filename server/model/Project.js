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
        required: true, 
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
        required: true
    },
    sir: {
        type: String,
        required: true
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
    }
}, {timestamps: true})

module.exports = mongoose.model("projects", ProjectSchema);