require('dotenv').config();
require('./socket-handler')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const mongoose = require('mongoose')
const User = require('./models/user')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/account', require('./routes/account'));

app.use((err, req, res, next) => {
  if(req.get('accept').includes('json')) {
    return next(createError(404))
  }
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use((err, req, res, next) => {
  if(err.name === 'MongoError' || err.name === 'ValidationError' || err.name === 'castError') {
    err.status = 422
  }
  res.status(err.status || 500).json({message: err.message || 'some error occured.'})
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

mongoose.connect(process.env.DB_URL)
console.log('Connected successfully.')

module.exports = app;
