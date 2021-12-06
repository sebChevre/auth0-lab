require("dotenv").config();
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const request = require("request-promise");
const session = require("express-session");
const { auth } = require("express-openid-connect");
const {  requiredScopes } = require('express-oauth2-bearer');
const appUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;
const beers = [
  {
    description: 'Bière vieillie en fut de whyski',
    nom: "Abbaye de StBonChien",
    stock: 92,
    prix: 3.90
  },
  {
    description: 'Bière brune',
    nom: "Mandragore",
    stock: 12,
    prix: 4.50
  }
]

const app = express();

app.set('view engine', 'ejs');

app.use(morgan('combined'));

app.use(
  session({
    secret: process.env.APP_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// Add the code below
app.use(auth({
  baseURL: appUrl,
  required: false,
  auth0Logout: true,
  routes: false,
  appSession: false,
    authorizationParams: {
      response_type: "code id_token",
      response_mode: "form_post",
      audience: process.env.API_AUDIENCE,
      scope: "openid profile email read:reports",
    },
  handleCallback: async function (req, res, next) {
    console.log(req.openidTokens)
    req.session.openidTokens = req.openidTokens;
    req.session.userIdentity = req.openidTokens.claims();
    next();
  },
    getUser: async function (req) {
      return req.session.userIdentity;
    }
}));

app.get('/', (req, res) => {
  res.render('home',  { user: req.openid && req.openid.user });
});



app.get('/beers', requiredScopes('read:reports'), (req, res) => {
  res.render('beers', {
    beers
  });
  
});

app.get("/login", (req, res) => res.openid.login({ returnTo: "/" }));

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.openid.logout();
});



http.createServer(app).listen(process.env.PORT, () => {
  console.log(`listening on ${appUrl}`);
});
