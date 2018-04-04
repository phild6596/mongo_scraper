const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let NoteSchema = new Schema({
    body: {
        type: String
    },
    article: {
        type: Schema.Types.ObjectId,
        ref: "Article"
    }
});

let Note = mongoose.model("Note", NoteSchema);

module.exports = Note;