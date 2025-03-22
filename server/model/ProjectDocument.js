const mongoose = require("mongoose");

const ProjectDocumentSchema = mongoose.Schema({
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
    documentType: {
        type: String,
        required: true
    },
    documentUrl: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model("projectdocuments", ProjectDocumentSchema);