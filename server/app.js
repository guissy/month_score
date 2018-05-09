const path = require('path');
const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const graphqlRouter = require('./routes/graphql');
const exportRouter = require('./routes/export');
const token = require('./routes/token');

const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/graphql', token);
app.use('/graphql', graphqlRouter);
app.use('/assets', exportRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json(err);
});

app.listen(8899, () => {
  console.log('☞☞☞ running: ', 8899);
});
module.exports = app;
