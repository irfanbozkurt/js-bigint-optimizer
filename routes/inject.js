const express = require('express');
const router = express.Router();

const process = require('../core/process');
const numberFormatter = require('../util/numberformatter');
const constants = require('../common/constants');


/*
    Performs input validation for /inject endpoint.

    Must be enhanced for production usage.
*/
const inputValidator = (req, res, next) => {

  const isNumeric = (value) => /^\d+$/.test(value);

  const obj = req.body;
  if (!obj["ticker"] || !obj["userId"] || !obj["Balance"]) {
    res.send(constants.ERR_001);
    return;
  }

  if (Object.keys(obj).length > 3) {
    res.send(constants.ERR_002);
    return;
  }

  if (typeof obj["ticker"] != "string") {
    res.send(constants.ERR_003);
    return;
  }
  if (typeof obj["userId"] != "string") {
    res.send(constants.ERR_004);
    return;
  }
  if (typeof obj["Balance"] != "string" || !isNumeric(obj["Balance"])) {
    res.send(constants.ERR_005);
    return;
  }

  next();
}


/*
    Passes request body to the core "process" module.
*/
const mw1 = (req, res) => {

  //Process the input
  process.takeInput(
    req.body['userId'],
    req.body['ticker'], 
    // If there are any redundant zeroes at the beginning
    // of the input, clear them out.
    numberFormatter.clearZeroes(req.body['Balance'])
  );

  res.send(constants.MSG_001);
};


/*
    This endpoint accepts valid data to the system.

    ex: 
    POST /inject
    {
      "ticker": "LUNA",
      "userId": "0xacc99",
      "Balance": "4364364364364364364364364364364336436436436"
    }
*/
router.post('/', inputValidator, mw1);


module.exports = router;
