const express = require('express');
const router = express.Router();

const process = require('../core/process');
const constants = require('../common/constants');


/*
    This endpoint resets the database.
    All accumulators and users are gone after invocation.
*/
router.post(`/`, (req, res) => {
  process.reset();

  res.send(constants.MSG_002);
});


module.exports = router;
