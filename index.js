const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let User;
const userSchema = new mongoose.Schema({
    username: String,
});
let Exercise;
const exerciseSchema = new mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: String,
});

User = mongoose.model("User", userSchema);
Exercise = mongoose.model("Exercise", exerciseSchema);

let bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.use(bodyParser.urlencoded({ extended: false }));

app.route("/api/users")
    .post(async (req, res) => {
        let userName = req.body.username;
        let data;
        try {
            let user = new User({
                username: userName,
            });
            data = await user.save();
            res.json(data);
        } catch (err) {
            console.log(err);
            res.send(err);
        }
    })
    .get(async (req, res) => {
        try {
            let allUsers = await User.find();
            res.json(allUsers);
        } catch (err) {
            console.log(err);
            res.send(err);
        }
    });

app.route("/api/users/:_id/exercises")
    .post(async (req, res) => {
        let id = req.params._id;
        let desc = req.body.description;
        let period = req.body.duration;
        let dateStr =
            req.body.date == "undefined" || req.body.date == ""
                ? new Date().toDateString()
                : new Date(req.body.date).toDateString();
        console.log(req.body.date + " " + dateStr);
        try {
            let user = await User.findById({ _id: id });

            let exerCise = new Exercise({
                username: user.username,
                description: desc,
                duration: period,
                date: dateStr,
            });
            let data = await exerCise.save();
            console.log(data);
            user["exercise"] = data;
            console.log(user);
            res.json(user);
        } catch (err) {
            console.log(err);
            res.send(err);
        }
    })
    .get(async (req, res) => {
        let id = req.params._id;
    });

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
