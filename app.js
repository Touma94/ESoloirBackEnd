const express = require("express"),
  routes = require("./routes"),
  user = require("./routes/user"),
  admin = require("./routes/admin"),
  path = require("path"),
  app = express(),
  mysql = require("mysql"),
  bodyParser = require("body-parser"),
  multer = require("multer"),
  fileUpload = require("express-fileupload"),
  session = require("express-session");

// MANAGING FILES
// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

// MANAGING DATABASE
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "e-soloir",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to the MySQL server.");
});

global.db = con;

// all environments
app.set("port", process.env.PORT || 8080);
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
app.use(express.static('uploads'));

//Middleware
app.listen(8080, function () {
  var dateTime = new Date();
  var message = "Server running on Port : 8080, started at :" + dateTime;
  console.log(message);
});

// REQUESTS
app.post("/signup", user.signup); //call for signup post
app.post("/login", user.login); //call for login post
app.post("/setValidity", admin.setValidity); //call for setValidity
app.post("/getNotValidatedUsers", admin.getNotValidatedUsers); // call for getNotValidatedUsers
