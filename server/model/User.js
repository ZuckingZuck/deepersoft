const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    userType: {
        type: String,
        enum: ["Taşeron", "Supervisor", "Onay Yetkilisi", "Sistem Yetkilisi", "Tedarikçi", "ISG Personeli"],
        required: true,
    },
    status: {
        type: String,
        default: "Aktif"
    },
    fullName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model("users", UserSchema);