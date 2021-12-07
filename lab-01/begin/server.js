require("dotenv").config();
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const request = require("request-promise");
const session = require("express-session");
const fs = require('fs');
const { auth, requiresAuth, claimEquals,claimIncludes,claimCheck } = require("express-openid-connect");
//const {  requiredScopes } = require('express-oauth2-bearer');
const output = fs.createWriteStream('./stdout.log');
const errorOutput = fs.createWriteStream('./stderr.log');
const { Console } = console;
const jwt_decode = require("jwt-decode")

// Custom simple logger
const logger = new Console({ stdout: process.stdout, stderr: errorOutput, colorMode: true });



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
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// Add the code below
app.use(auth({
  baseURL: appUrl,
  authRequired: false,
  auth0Logout: false,
  routes: {
    login: false,
    logout: false
  },
  afterCallback: async (req, res, session, decodedState) => {
    
    logger.info(`[${logDate()}] - afterCallback`);
    return {
      ...session
    };
    
  }
}));



app.get('/', (req, res) => {
  
  if(req.oidc && req.oidc.user){
    logger.info(`[${logDate()}] - user logged: ${req.oidc.user.name}`);
    var idTokenDecoded = jwt_decode(req.oidc.idToken)
    logger.info(`[${logDate()}] - roles: ${idTokenDecoded.roles}`);
    logger.info(`[${logDate()}] - groups: ${idTokenDecoded.groups}`);
    logger.info(`[${logDate()}] - permissions: ${idTokenDecoded.permissions}`);
  }
  
  res.render('home',  { user: req.oidc && req.oidc.user });
});



app.get('/profile', requiresAuth(), (req, res) => {
  
  console.log("> user info:")
  console.log(req.oidc.user);
  var idTokenDecoded = jwt_decode(req.oidc.idToken)
  res.render('profile',{user: req.oidc.user, token: idTokenDecoded})
  
  
});


app.get('/beers', claimIncludes('permissions','biere:read'), (req, res) => {
  
  res.render('beers', {
    beers
  });
  
});

app.get("/login", (req, res) => 
{
  console.log('login...')
  res.oidc.login({ returnTo: "/" })
});

app.get("/logout", (req, res) => {
  console.log('logout...')
  req.session.destroy();
  res.oidc.logout();
  //res.render('home',  { user: req.oidc && req.oidc.user });
});



http.createServer(app).listen(process.env.PORT, () => {
  logger.info(`[${logDate()}] - listening on ${appUrl}`);
});

logDate = function () {
  return new Date().toISOString();
}