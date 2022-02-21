require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function (req, res) {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email[0];
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(data);

  const url = `https://us${process.env.DC}.api.mailchimp.com/3.0/lists/${process.env.AUDIENCE_ID}`;

  const options = {
    method: "POST",
    auth: `pritishc:${process.env.API_KEY}`,
  };

  const request = https.request(url, options, function (response) {
    response.on("data", function (data) {
      let log = JSON.parse(data);
      let error = log.errors;

      if (error.length == 0 && response.statusCode === 200) {
        res.sendFile(__dirname + "/success.html");
      } else {
        res.sendFile(__dirname + "/failure.html");
      }
    });
  });

  request.write(jsonData);
  request.end();
});

app.post("/failure", function (req, res) {
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("App is listening on port 3000");
});
