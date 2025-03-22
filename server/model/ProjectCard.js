const mongoose = require("mongoose");

const ProjectCardSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model("projectcards", ProjectCardSchema);