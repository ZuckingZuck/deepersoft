const mongoose = require("mongoose");

const FieldTypeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model("fieldtypes", FieldTypeSchema);