const bcrypt = require("bcrypt"),
  multer = require("multer"),
  upload = multer({ storage: multer.memoryStorage() });

// SIGNUP
exports.signup = async function (req, res) {
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const phone = req.body.phone;
  const email = req.body.email;
  const password = req.body.password;

  // verify email's uniqueness
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      res.status(401).json({
        message: "user already exists",
      });
      return;
    }
  } catch (e) {
    res.status(400).json({ message: "pb get id : " + e.message });
  }

  const hash = await bcrypt.hash(password, 10); // bcrypt hash

  var insertId = -1;
  try {
    // user insertion
    const result = await db.query(
      "INSERT INTO users (first_name, last_name, phone, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [first_name, last_name, phone, email, hash]
    );

    insertId = result.rows[0].id;
  } catch (e) {
    res.status(500).json({ message: "pb get id : " + e.message });
  }

  // files upload
  var files = [];
  var fileKeys = Object.keys(req.files.files);

  fileKeys.forEach(function (key) {
    req.files.files[key];
    files.push(req.files.files[key]);
  });

  files.forEach((element) => {
    element.mv("./uploads/" + element.name, (error) => {
      if (error)
        res.status(500).json({ message: "pb get id : " + error.message });
    });

    try {
      // files insertion in database
      db.query("INSERT INTO img (name, id_user) VALUES ($1, $2)", [
        element.name,
        insertId,
      ]);
    } catch (e) {
      res.status(500).json({ message: "pb get id : " + e.message });
    }
  });

  res.send("user registered");
};

// LOGIN
exports.login = async function (req, res) {
  const email = req.body.email;

  var result = "";
  try {
    result = await db.query({
      text: "SELECT * FROM users WHERE email = $1",
      values: [email],
    });
    if (result.rows.length === 0) {
      res.status(500).json({ message: "user doesn't exist" });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: "pb get id : " + e.message });
  }

  const user = result.rows[0];

  if (user.id == req.session.userId) {
    res.status(401).json({ message: "user already connected" });
    return;
  }

  try {
    const password = req.body.password;

    if (await bcrypt.compare(password, user.password)) {
      // alors connecter l'utilisateur
      req.session.userId = user.id;
      res.json({
        message: "user connected",
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        isValidated: user.isValidated,
      });
    } else {
      res.status(401).json({
        message: "bad password",
      });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: "pb get id : " + e.message });
  }
};
