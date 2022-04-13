const express = require('express');

const passport = require('./config/passport');
const usersRouter = require('./routes/users/users.router');

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.use(usersRouter);

module.exports = app;
