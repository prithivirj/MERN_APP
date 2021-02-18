const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const dbConfig = require('./config/db')
const mongoose = require('mongoose');
const app = express();
const passport = require('passport');
const cors = require('cors');
require('./auth/auth');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("connected to the db");
}).catch(err => {
    console.log('db connection failure');
    process.exit();
});


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

app.use('/', indexRouter);
app.use('/users',passport.authenticate('jwt', { session : false }), usersRouter);

module.exports = app;
