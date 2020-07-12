/* const express = require("express");
const bodyParser = require("body-parser");

const devicesRoutes = require('./routes/devices-routes');
const usersRoutes = require("./routes/users-routes");

require("dotenv").config();
const sql = require("mssql");

const config = {
  database: "plugnplaydb",
  server: "DESKTOP-9F0L9N9",
  user: "sa",
  password: "plugnplay",
};

const app = express();

app.use(bodyParser.json());

sql
  .connect(config)
  .then((pool) => {
    console.log("Connected successfully to DB");
  })
  .catch((err) => {
    console.log(err);
  });

  app.use("/api/users", usersRoutes);
  app.use('/api/devices', devicesRoutes);

//Error handling
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error ocurred!" });
});

app.listen(4005); */

const express = require('express');

const spdy = require('spdy');
var https = require('https');
var http = require('http');
const fs = require('fs');
const path = require("path")
const bodyParser = require('body-parser');

require("dotenv").config();
const sql = require("mssql");

const config = {
  database: "plugnplaydb",
  server: "DESKTOP-9F0L9N9",
  user: "sa",
  password: "plugnplay",
};

const options = {
  key: fs.readFileSync('./localhost-privkey.pem'),
  cert: fs.readFileSync('./localhost-cert.pem')
};

const devicesRoutes = require('./routes/devices-routes');
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "./frontend_build")));

//Handles any requests that don't match the ones above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/frontend_build/index.html"))
})

sql
  .connect(config)
  .then((pool) => {
    console.log("Connected successfully to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/users", usersRoutes);
app.use('/api/devices', devicesRoutes);

//Error handling
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error ocurred!" });
});

spdy
  .createServer(options, app)
  .listen(4005, (error) => {
    if (error) {
      console.error(error)
      return process.exit(1)
    } else {
      console.log('Listening on port: ' + 4005 + '.')
    }
  });

//app.listen(4005);
