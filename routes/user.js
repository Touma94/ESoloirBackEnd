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

  // specific files upload
  const identity_card = req.files.identity;
  const electoral_card = req.files.electoral;
  const selfie = req.files.selfie;

  const path_identity_card = "./uploads/identity_cards/" + identity_card.name;
  const path_electoral_card =
    "./uploads/electoral_cards/" + electoral_card.name;
  const path_selfie = "./uploads/selfies/" + selfie.name;

  identity_card.mv(path_identity_card, (error) => {
    if (error) throw error;
  });

  electoral_card.mv(path_electoral_card, (error) => {
    if (error) throw error;
  });

  selfie.mv(path_selfie, (error) => {
    if (error) throw error;
  });

  try {
    // files insertion in database
    const result = await db.query(
      "INSERT INTO img (name, id_user) VALUES ($1, $2), ($3, $4), ($5, $6)",
      [
        electoral_card.name,
        insertId,
        identity_card.name,
        insertId,
        selfie.name,
        insertId,
      ]
    );
  } catch (e) {
    res.status(500).json({ message: "pb get id : " + e.message });
  }

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
