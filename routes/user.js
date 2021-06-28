const bcrypt = require("bcrypt"),
  multer = require("multer"),
  upload = multer({ storage: multer.memoryStorage() });

// SIGNUP
exports.signup = async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  console.log(email, password);
  console.log(db);

  // verify email's uniqueness
  await db.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
    function (error, result, fields) {
      if (error) throw error;

      if (result.length > 0) {
        res.status(401).json({
          message: "user already exists",
        });
        return;
      }
    }
  );

  const hash = await bcrypt.hash(password, 10); // bcrypt hash

  // user insertion
  await db.query(
    "INSERT INTO users (email, password) VALUES ($1, $2)",
    [email, hash],
    (error, result, fields) => {
      if (error) throw error;

      // specific files upload
      const identity_card = req.files.identity;
      const electoral_card = req.files.electoral;
      const selfie = req.files.selfie;

      const path_identity_card =
        "./uploads/identity_cards/" +
        result.insertId +
        "_" +
        identity_card.name;
      const path_electoral_card =
        "./uploads/electoral_cards/" +
        result.insertId +
        "_" +
        electoral_card.name;
      const path_selfie =
        "./uploads/selfies/" + result.insertId + "_" + selfie.name;

      identity_card.mv(path_identity_card, (error) => {
        if (error) throw error;
      });

      electoral_card.mv(path_electoral_card, (error) => {
        if (error) throw error;
      });

      selfie.mv(path_selfie, (error) => {
        if (error) throw error;
      });

      // files insertion in database
      db.query(
        "INSERT INTO img (name, id_user) VALUES ($1, $2), ($3, $4), ($5, $6)",
        [
          result.insertId + "_" + electoral_card.name,
          result.insertId,
          result.insertId + "_" + identity_card.name,
          result.insertId,
          result.insertId + "_" + selfie.name,
          result.insertId,
        ],
        (error, result, fields) => {
          if (error) throw error;

          console.log("rows inserted");
        }
      );

      res.send("user registered");
    }
  );
};

// LOGIN
exports.login = function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  db.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
    async function (err, result, fields) {
      if (err) return console.error(error.message);

      if (result.length === 0) {
        res.status(401).json({
          message: "user doesn't exists",
        });
        return;
      }

      const user = result[0];

      if (user.id == req.session.userId) {
        res.status(401).json({ message: "user already connected" });
        return;
      }

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
    }
  );
};
