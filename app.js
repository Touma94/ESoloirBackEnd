const express = require("express"),
  user = require("./routes/user"),
  admin = require("./routes/admin"),
  path = require("path"),
  app = express(),
  bodyParser = require("body-parser"),
  fileUpload = require("express-fileupload"),
  session = require("express-session"),
  cors = require("cors");

// MANAGING FILES
// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

// POSTGRE
const { Client } = require("pg");

// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// LOCAL
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "e-soloir",
  password: "Postgrevinc06",
  port: 5432,
});

try {
  client.connect();
} catch (e) {
  console.log("error :" + e);
}

global.db = client;

// all environments
app.set("port", process.env.PORT || port);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "uploads"))); // static files in public directory
app.use(cors({ credentials: true, origin: true }));
app.use(
  session({
    secret: "grehjznejzkhgjrez",
    saveUninitialized: false,
    resave: false,
  })
);

//Middleware
const { PORT = 3000, LOCAL_ADDRESS = "0.0.0.0" } = process.env;

app.listen(PORT, LOCAL_ADDRESS, () => {
  var dateTime = new Date();
  var message =
    "Server running on Port : " + PORT + ", started at :" + dateTime;
  console.log(message);
});

// REQUESTS
app.post("/signup", user.signup); //call for signup post

app.post("/login", user.login); //call for login post

app.get("/me", user.me); //call for login post

app.put("/admin/validation", admin.setValidity); //call for setValidity

app.get("/admin/notValidatedUsers", admin.notValidatedUsers); // call for getNotValidatedUsers

app.delete("/logout", function (req, res) {
  req.session.destroy();
  res.send("logged out");
});
