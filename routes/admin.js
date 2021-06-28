var nodemailer = require("nodemailer");

// SETVALIDITY
exports.setValidity = async function (req, res) {
  const id_user = req.body.id_user;
  const email = req.body.email;
  const validity = req.body.validity;

  if (validity) {
    // SET VALIDITY = TRUE
    await db.query(
      "UPDATE users SET isValidated = 1 WHERE id = $1",
      [id_user],
      function (err, result) {
        if (err) throw err;

        console.log(result.affectedRows + " record(s) updated");
      }
    );

    // SEND VALIDATED EMAIL
    var transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com", // hostname
      secureConnection: false, // TLS requires secureConnection to be false
      port: 587, // port for secure SMTP
      tls: {
        ciphers: "SSLv3",
      },
      auth: {
        user: "e-soloir@outlook.fr",
        pass: "i-soloirpassword",
      },
    });

    var mailOptions = {
      from: "'e-soloir' <e-soloir@outlook.fr>",
      to: email,
      subject: "Compte e-soloir validé",
      text: "Bonjour, vous avez désormais accès à votre compte électoral en ligne sur la plateforme e-soloir.",
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) throw error;

      console.log("Message sent: " + info.response);
    });

    res.send("user validated and email sent");
  } else {
    // DELETE ACCOUNT
    await db.query(
      "DELETE FROM users WHERE id = $1",
      [id_user],
      function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) deleted");
      }
    );

    // SEND NOT VALIDATED EMAIL
    var transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com", // hostname
      secureConnection: false, // TLS requires secureConnection to be false
      port: 587, // port for secure SMTP
      tls: {
        ciphers: "SSLv3",
      },
      auth: {
        user: "e-soloir@outlook.fr",
        pass: "i-soloirpassword",
      },
    });

    var mailOptions = {
      from: "'e-soloir' <e-soloir@outlook.fr>",
      to: email,
      subject: "Compte e-soloir invalide",
      text: "Bonjour, vous n'avez pas donné les bonnes informations.",
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) throw error;

      console.log("Message sent: " + info.response);
    });

    res.send("user deleted and email sent");
  }

  transporter.close();
};

// GETNOTVALIDATEDUSERS
exports.notValidatedUsers = async function (req, res) {
  await db.query(
    "SELECT * FROM users WHERE isValidated = 0",
    function (error, result, fields) {
      if (error) throw error;

      res.json(result);
    }
  );
};
