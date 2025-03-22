const mongoose = require("mongoose");

const ClusterSchema = mongoose.Schema({
    city: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model("clusters", ClusterSchema);