const express = require("express"),
  user = require("./routes/user"),
  admin = require("./routes/admin"),
  path = require("path"),
  app = express(),
  mysql = require("mysql"),
  bodyParser = require("body-parser"),
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
const port = 8080;

app.set("port", process.env.PORT || port);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "uploads"))); // static files in public directory
app.use(
  session({
    secret: "grehjznejzkhgjrez",
    saveUninitialized: false,
    resave: false,
  })
);

//Middleware
app.listen(port, function () {
  var dateTime = new Date();
  var message =
    "Server running on Port : " + port + ", started at :" + dateTime;
  console.log(message);
});

// REQUESTS
app.post("/signup", user.signup); //call for signup post

app.post("/login", user.login); //call for login post

app.put("/admin/validation/:id_user", admin.setValidity); //call for setValidity

app.get("/admin/notValidatedUsers", admin.notValidatedUsers); // call for getNotValidatedUsers

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.send("logged out");
});
