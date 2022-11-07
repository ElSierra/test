const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const uuid = require("uuid");
multer = require("multer");
const cors = require("cors");
const { upload } = require("./fileupload");
var connect = require("connect");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);
const path = require("path");

//! Express Initialization
const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
  // email: String,
  // password: String,

  name: String,
  email: String,
  picture: String,
});

const blogSchema = {
  title: String,
  content: String,
  date: String,
  img: String,
  authorName: String,
  authorImg: String,
  timestamp: String,
  authorGoogleId: String,
};

const commentSchema = {
  name: String,
  img: String,
  comment: String,
  id: String,
  date: String,
};

const Blog = mongoose.model("Note", blogSchema);

const Users = mongoose.model("User", userSchema);
const Comments = mongoose.model("Comment", commentSchema);
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public",  "index.html"));
});
app.get("/blogpost/:id", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public",  "index.html"));
});

// simple route
app.get("/api/", (req, res) => {
  Blog.find((err, found) => {
    found = found.reverse();
    !err ? res.send(found) : console.log(err);
  });
});
app.get("/api/random", (req, res) => {
  var query = Blog.find();
  query.count(function (err, count) {
    if (err) {
      console.log(err);
    } else {
      const random = Math.floor(Math.random() * count);
      res.send({ random: random });
    }
  });
});

const uploadImage = upload.single("file");
app.post("/api/blogpost", (req, res) => {
  uploadImage(req, res, (err) => {
    if (!err) {
      const url = req.protocol + "://" + req.get("host");
      const {
        env,
        title,
        content,
        date,
        authorName,
        authorImg,
        timestamp,
        authorGoogleId,
      } = req.body;
      console.log(req.body);

      const newCompose = new Blog({
        title: title,
        content: content,
        date: date,
        img: url + "/uploads/" + req.file.filename,
        authorName: authorName,
        authorImg: authorImg,
        authorGoogleId: authorGoogleId,
        timestamp: timestamp,
      });

      // console.log('Adding notes:::::', note);
      // notes.push({ title: note.title, content: note.content });
      // res.json("entry addedd");
      // console.log(notes)
      if (env === process.env.TOKENFORBLOG) {
        newCompose.save((err) => {
          if (!err) {
            res.send(`Successfully added `);
          } else {
            res.send(err);
          }
        });
      } else {
        res.send({ error: 401, msg: "Unautorized Access" });
      }
    } else {
      console.log(err.code);
      res.send(err.code);
    }
  });
});
app.get("/api/singlepost/:id", (req, res) => {
  Blog.findOne({ _id: req.params.id }, (err, found) => {
    !err ? res.send(found) : console.log(err);
  });
});
app.get("/api/authorpost/:googleid", (req, res) => {
  Blog.find({ authorGoogleId: req.params.googleid }, (err, found) => {
    !err ? res.send(found) : console.log(err);
  });
});

app.post("/api/comments", (req, res) => {
  console.log(req.body);
  const comment = Comments({
    name: req.body.name,
    img: req.body.img,
    comment: req.body.comment,
    id: req.body.id,
    date: req.body.date,
  });
  if (req.body.env === process.env.TOKENFORBLOG) {
    comment.save((err) => {
      if (!err) {
        res.send(`Successfully added `);
      } else {
        res.send(err);
      }
    });
  } else {
    res.send({ error: 501, msg: "Unauthorized access" });
  }
});
app.get("/api/comments/:comment", (req, res) => {
  Comments.find({ id: req.params.comment }, (err, found) => {
    !err ? res.send(found) : console.log(err);
  });
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
