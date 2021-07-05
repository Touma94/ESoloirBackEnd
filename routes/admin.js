var nodemailer = require("nodemailer");

// SETVALIDITY
exports.setValidity = async function (req, res) {
  const id_user = req.body.id_user;
  const email = req.body.email;
  const validity = req.body.validity;

  if (validity) {
    // SET VALIDITY = TRUE
    await db.query(
      "UPDATE users SET isvalidated = true WHERE id = $1",
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
        user: "e-soloir@hotmail.com",
        pass: "isoloir1",
      },
    });

    var mailOptions = {
      from: "'e-soloir' <e-soloir@hotmail.com>",
      to: email,
      subject: "Compte e-soloir validé",
      text: "yes",
      html: '<div><img src="cid:logo" width="100" height="89" style="margin: 10px 0"><p>Bonjour Monsieur/madame,</p><p> Votre compte d’électeur sur la plateforme e-soloir a été validé. Vous avez maintenant accès à votre espace de vote en vous connectant sur ce lien ci-dessous :</p><a href="https://e-soloir.com/login">https://e-soloir.com/login</a></div>',
      attachments: [
        {
          filename: "logo_officiel.png",
          path: __dirname + "/img/logo_officiel.png",
          cid: "logo", //my mistake was putting "cid:logo@cid" here!
        },
      ],
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
        user: "e-soloir@hotmail.com",
        pass: "isoloir1",
      },
    });

    var mailOptions = {
      from: "'e-soloir' <e-soloir@hotmail.com>",
      to: email,
      subject: "Compte e-soloir invalide",
      text: "yes",
      html: '<div><img src="cid:logo" width="100" height="89" style="margin: 10px 0"><p>Bonjour Monsieur/madame,</p><p> Votre compte d’électeur sur la plateforme e-soloir n\'a pas été validé. Veuillez vérifier vos pièces d\'identités</p><a href="https://e-soloir.com/register">https://e-soloir.com/register</a></div>',
      attachments: [
        {
          filename: "logo_officiel.png",
          path: __dirname + "/img/logo_officiel.png",
          cid: "logo", //my mistake was putting "cid:logo@cid" here!
        },
      ],
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
    "SELECT * FROM users WHERE isvalidated = false",
    function (error, result, fields) {
      if (error) throw error;

      res.json(result);
    }
  );
};
