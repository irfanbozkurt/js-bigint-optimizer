/* Packages */
const express = require('express');
const morgan = require('morgan');

/* Routes */
const exposeRouter = require('./routes/expose');
const injectRouter = require('./routes/inject');
const resetRouter = require('./routes/reset');


/* Initialize */
const app = express();

/* Request Logger */
app.use(morgan(':method :status :url :response-time ms\n'));

/* JSON support for request bodies */
app.use(express.json());

/* Endpoints */
app.use('/', exposeRouter);
app.use('/inject', injectRouter);
app.use('/reset', resetRouter);

/* To be imported in bin/www.js */
module.exports = app;
