/**
 * Module dependencies.
 */
var express = require("express"),
  http = require("http"),
  path = require("path");

const session = require("express-session");
var app = express();
var mysql = require("mysql");
var bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const router = express.Router();

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "e-soloir",
});
connection.connect();
global.db = connection;

// all environments
app.set("port", process.env.PORT || 8080);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "grehjznejzkhgjrez",
    saveUninitialized: false,
    resave: false,
  })
);

//Middleware
app.listen(8080, function () {
  var dateTime = new Date();
  var message = "Server running on Port : 8080, started at :" + dateTime;
  console.log(message);
});

// LOGIN POST
app.post("/login", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const session = req.session;

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async function (err, result, fields) {
      if (err) throw err;

      if (result.length === 0) {
        res.status(401).json({
          message: "user doesn't exists",
        });
        return;
      }

      // si on a pas trouvé l'utilisateur
      // alors on le crée
      const user = result[0];

      if (user.id == session.userId) {
        res.status(401).json({ message: "user already connected" });
        return;
      }

      if (await bcrypt.compare(password, user.password)) {
        // alors connecter l'utilisateur
        session.userId = user.id;
        res.json({
          id: user.id,
          email: user.email,
        });
      } else {
        res.status(401).json({
          message: "bad password",
        });
        return;
      }
    }
  );
}); //call for login post

// SIGNUP POST
app.post("/signup", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async function (err, result, fields) {
      if (err) throw err;

      if (result.length > 0) {
        res.status(401).json({
          message: "user already exists",
        });
        return;
      }

      // si on a pas trouvé l'utilisateur
      // alors on le crée
      const hash = await bcrypt.hash(password, 10);

      await connection.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hash]
      );
      res.send("registered");
    }
  );
}); //call for signup post
