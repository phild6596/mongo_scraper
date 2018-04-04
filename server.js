const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const request = require("request");
const cheerio = require("cheerio");
const path = require("path");
const exphbs = require("express-handlebars");
//const Notes = require("./models/notes.js");
//const Articles = require("./models/articles.js");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://basicUser:Password1234@ds121238.mlab.com:21238/heroku_brmzrqc0");
const db = mongoose.connection;

db.on("error", function (error) {
    console.log("Mongoose error: ", error);
});

db.once("open", function () {
    console.log("Mongoose succesfully connected!");
});

app.listen(PORT, function() {
    console.log("App running on port", PORT);
});