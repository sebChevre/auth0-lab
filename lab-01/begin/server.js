require('dotenv').config();
const { auth } = require('express-openid-connect');
const express = require('express');
const http = require('http');
const morgan = require('morgan');

const appUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;
const secret = process.env.SECRET;

const app = express();
app.set('view engine', 'ejs');
app.use(morgan('combined'));


// Add the code below
app.use(auth({
  auth0Logout: true,
  baseURL: appUrl,
  secret: secret
}));

app.get('/', (req, res) => {
  console.log(req.oidc.idToken)
  console.log(req.oidc.accessToken)
  res.render('home',  { user: req.oidc && req.oidc.user });
});

app.get('/expenses', (req, res) => {
  res.render('expenses', {
    expenses: [
      {
        date: new Date(),
        description: 'Coffee for a Coding Dojo session.',
        value: 42,
      }
    ]
  });
});

http.createServer(app).listen(process.env.PORT, () => {
  console.log(`listening on ${appUrl}`);
});
