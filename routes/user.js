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
        message: "Un utilisateur correspond déjà à cette email.",
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
      "INSERT INTO users (first_name, last_name, phone, email, password, id_card, selfie, electoral_card) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [
        first_name,
        last_name,
        phone,
        email,
        hash,
        req.files.files[0].name,
        req.files.files[1].name,
        req.files.files[2].name,
      ]
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
  });

  res.json({ message: "user registered" });
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
      res
        .status(500)
        .json({ message: "Cet email ne correspond à aucun utilisateur." });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: "pb get id : " + e.message });
  }

  const user = result.rows[0];

  if (user.id == req.session.userId) {
    res.status(401).json({ message: "Utilisateur déjà connecté." });
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
        isadmin: user.isadmin,
        isvalidated: user.isvalidated,
      });
    } else {
      res.status(401).json({
        message: "Mot de passe incorrecte.",
      });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: "pb get id : " + e.message });
  }
};

// LOGIN
exports.me = async function (req, res) {
  /*
   * Cette route retourne les infos de l'utilisateur connecté
   * Ne marche uniquement lorsque l'utilisateur est connecté
   */

  if (typeof req.session.userId === "undefined") {
    res.status(401).json({ message: "Utilisateur non connecté" });
    return;
  }

  const result = await db.query({
    text: "SELECT id, email FROM users WHERE id=$1",
    values: [req.session.userId],
  });

  res.json(result.rows[0]);
};

// LOGIN
exports.voter = async function (req, res) {
  const id_user = req.body.id_user;

  await db.query(
    "UPDATE users SET hasvoted = true WHERE id = $1",
    [id_user],
    function (err, result) {
      if (err) throw err;

      console.log(result.affectedRows + " record(s) updated");
    }
  );

  res.send("user has voted");
};

// LOGIN
exports.hasvoted = async function (req, res) {
  const result = await db.query({
    text: "SELECT hasvoted FROM users WHERE id=$1",
    values: [req.query.id],
  });

  res.json(result.rows[0]);
};