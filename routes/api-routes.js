const jwt = require("jsonwebtoken");
const authWare = require("../middleware/authware");
const db = require("../models");


module.exports = function (app) {
  app.post("/api/signup", function (req, res) {
    db.User.create(req.body).then(function (result) {
      res.json({ message: "Virtuv.io account created" });
    }).catch(function (err) {
      res.status(500).json({ error: err.message });
    });
  });

  app.get("/api/users", function (req, res) {
    db.User.find({}).then(function (users) {
      res.json(users);
    });
  });

  app.post("/api/authenticate", function (req, res) {
    const { email, password } = req.body;
    db.User.findOne({ email: email }).then(function (dbUser) {
      if (!dbUser) return res.status(401).json({ message: "email or password is incorrect." });
      if (dbUser.comparePassword(password)) {

        const token = jwt.sign({
          data: dbUser._id
        }, "superSecretKey");

        res.json({
          id: dbUser._id,
          email: dbUser.email,
          token: token
        });

      } else {
        res.status(401).json({ message: "email or password is incorrect." });
      }
    })
  });

  app.get("/api/protected", authWare, function (req, res) {
    const user = req.user;
    res.json({ message: user.email + "authenticated" });
  });

  app.get("/api/public", function (req, res) {
    res.json({
      message: "public"
    });
  });

  app.get("api/diagnosis", function (req, res) {
    db.Diagnosis.findAll({})
      .populate('bodyPart')
      .populate('symptoms')
      .then(function (data) {
        res.json(data);
      })
      .catch(function (err) {
        res.json(err);
      });

  })
};