const mongoose = require("mongoose");

const ProjectLogSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects",
        required: true
    },
    note: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model("projectlogs", ProjectLogSchema);