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

    app.route("/api/users/:_id/exercises").post(async (req, res) => {
        let id = req.params._id;
        let desc = req.body.description;
        let period = req.body.duration;
        let dateStr =
            (req.body.date == null || req.body.date == "undefined" || req.body.date == "")
                ? new Date().toISOString().substring(0,10)
                : req.body.date;
      console.log(req.method + ' exercises , date: ' + dateStr + '(' + req.body.date + ')');
      console.log(id+', '+desc+', '+period+', '+dateStr);
        try {
            let user = await User.findById({ _id: id });
            let exerCise = new Exercise({
                username: user.username,
                description: desc,
                duration: period,
                date: dateStr,
            });
            let data = await exerCise.save();
            res.json({
                username: user.username,
                description: desc,
              duration: Number(period),
              date: new Date(dateStr).toDateString(),
              _id: id
            });
        } catch (err) {
            console.log(err);
            res.send(err);
        }
    });
    
    app.get("/api/users/:_id/logs", async (req, res) => {
      console.log(req.method + ' logs ');
        try {
            let user = await User.findById(req.params._id);
            let logs = await Exercise.find({ username: user.username }, {username: 0, _id: 0});
          logs.forEach(x => {
              x.date = new Date(x.date).toDateString();
            });
          console.log(logs);
            res.json({
              _id: user._id,  
              username: user.username,
                count: logs.length,
                log: logs
            });
        } catch (err) {
            console.log(err);
            res.send(err);
        }
    });

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
