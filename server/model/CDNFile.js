const mongoose = require("mongoose");

const CDNFileSchema = mongoose.Schema({
    fileName: {
        type: String,
        required: true,
        index: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects",
        default: null
    },
    metadata: {
        type: Map,
        of: String,
        default: {}
    }
}, {timestamps: true})

module.exports = mongoose.model("cdnfiles", CDNFileSchema); 