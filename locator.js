var express = require("express");
var indexRouter = require("./routes/index.js");
const { auth, requiresAuth } = require("express-openid-connect");
require('dotenv').config();
const path = require('path');
var fs = require('fs');
var https = require('https');
const port = 4010;
var loggedUsers = [];

const config = {
    authRequired: false,
    idpLogout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASEURL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER,
    authorizationParams: {
      response_type: 'code' ,
      scope: "openid profile email",
      redirect_uri: process.env.BASEURL + '/callback'	   
     },
  };
  
var app = express();
app.set("views", "views");
app.set("view engine", "ejs");
app.use('/scripts', 
    express.static(path.join(__dirname, '/scripts')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(auth(config));

app.use("/", indexRouter);


app.post("/refreshUsers", (req, res) => {
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  const userFromFront = req.body.user;

  const user = {
    name: userFromFront.name,
    email: userFromFront.email,
    timestamp: new Date().toLocaleString(),
    location: { latitude: latitude, longitude: longitude }
  }

  exists = false;
  for(const loggedUser of loggedUsers){
    if(loggedUser.email === user.email) {
      exists = true;
    }
  }   
  
  if(!exists) {
    if(loggedUsers.length == 5) {
      loggedUsers.shift();
    } 
    loggedUsers.push(user);
  }
  res.status(200).send();
});

app.get("/sign-in", (req, res) => {
  res.oidc.login({
    returnTo: '/setTimestampIfRecent',
  });
});

app.get("/loggedUsers", requiresAuth(), (req, res) => {
  res.status(200).send({ loggedUsers });
});

app.get("/setTimestampIfRecent", (req, res) => {
  for(const loggedUser of loggedUsers){
    if(loggedUser.email === req.oidc.user.email) {
      loggedUser.timestamp = new Date().toLocaleString();
    }
  }   
  res.redirect('/');
});


if(process.env.PORT){
    app.listen(process.env.PORT)
  } else {
    https.createServer({
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.cert')
    }, app)
    .listen(port, function () {
      console.log(`Server running at https://localhost:${port}/`);
    });
  }
  
