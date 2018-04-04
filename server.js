const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const request = require("request");
const cheerio = require("cheerio");
const path = require("path");
const exphbs = require("express-handlebars");
const Note = require("./models/notes.js");
const Article = require("./models/articles.js");

mongoose.Promise = Promise;

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

app.get("/", function(req, res) {
    Article.find({"saved": false}, function(error, data){
        let hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("home", hbsObject);
    })
})

app.get("/saved", function(req, res) {
    Article.find({"saved": true}).populate("notes").exec(function(error, articles){
        let hbsObject = {
            article: articles
        };
        res.render("saved", hbsObject);
    });
});

app.get("/scrape", function(req,res){
    request("https://www.nytimes.com/", function(error, response, html){
        
    let $ = cheerio.load(html);
        
    $("article").each(function(i, element){
            let result = {};

            result.title = $(this).children("h2").text();
            result.summary = $(this).children(".summary").text();
            result.link = $(this).children("h2").children("a").attr("href");

            let entry = new Article(result);
            entry.save(function(err, doc) {
                if(err) {
                    console.log("entry error: ", error);
                }
                else {
                    console.log(doc);
                }
            })
        })
        res.send("scrape complete");
    })
})

app.get("/articles", function(req, res){
    Article.find({}, function(error, doc){
        if(error){
            console.log("Article find error: ", error);
        }
        else {
            res.json(doc);
        }
    })
})

app.get("/articles/:id", function(req, res){
    Article.findOne({"_id":req.params.id})
        .populate("note")
        .exec(function(error, doc){
            if (error) {
                console.log("Article id error: ", error);
            }
            else {
                res.json(doc);
            }
        })
})

app.post("/articles/save/:id", function(req,res){
    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true})
        .exec(function(error, doc){
            if(error) {
                console.log("Couldnt update error: ", error);
            }
            else {
                res.send(doc);
            }
        })
})

app.post("/articles/delete/:id", function(req, res){
    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false, "notes": []})
        .exec(function(error, doc){
            if(error) {
                console.log("Couldnt delete, error: ", error);
            }
            else {
                res.send(doc);
            }
        })
})

app.post("/notes/save/:id", function(req, res){
    let newNote = new Note({
        body: req.body.text,
        article: req.params.id
    })
    console.log(req.body);
    newNote.save(function(error, note){
        if (error) {
            console.log("New note error: ", error);
        }
        else {
            Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "notes": note } })
                .exec(function(error){
                    if(error) {
                        console.log(error);
                        res.send(error);
                    }
                    else {
                        res.send(note);
                    }
                })
        }
    })
})

app.delete("/notes/delete/:note_id/:article_id", function(req, res){
    Note.findOneAndRemove({ "_id": req.params.note_id }, function(error){
        if(error){
            console.log("Couldnt delete: ", error);
            res.send(error);
        }
        else {
            Article.findOneAndUpdate({ "_id": req.params.article_id }, {$pull:{"notes": req.params.note_id}})
                .exec(function(error){
                    if (err){
                        console.log("Couldnt update and delete: ", error);
                        res.send(error);
                    }
                    else {
                        res.send("note deleted");
                    }
                })
        }
    })
})

app.listen(PORT, function() {
    console.log("App running on port", PORT);
});