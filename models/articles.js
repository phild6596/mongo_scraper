const mongoose = require("mongoose");
const Notes = require("./notes.js");

let Schema = mongoose.Schema;

let ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    saved: {
        type: Boolean,
        default: false
    },
    notes: [{
        type: Schema.Types.ObjectId,
        ref: "Notes"
    }]
});

let Articles = mongoose.model("Articles", ArticleSchema);

module.exports = Articles;