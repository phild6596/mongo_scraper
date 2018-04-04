const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let NotesSchema = new Schema({
    body: {
        type: String
    },
    articles: {
        type: Schema.Types.ObjectId,
        ref: "Articles"
    }
});

let Notes = mongoose.model("Notes", NotesSchema);

module.exports = Notes;