const express = require('express');
const router = express.Router();

const storage = require('../core/storage');
const constants = require('../common/constants');


/*
    This endpoint returns a JSON object of ALL tickers that
    reside in the system, together with their total balances.

    ex: GET /ticker
*/
router.get('/ticker', (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  res.send(
    Object.keys(storage.tickers).length == 0 ? {} : JSON.stringify(storage.tickers)
  );
});

/*
    This endpoint returns a JSON object of given ticker
    containing its total balance in the system.

    ex: GET /ticker/AVAX
    ex: GET /ticker/ETH

    If ticker does not exist in the system, returns 0.
*/
router.get('/ticker/:ticker', (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const requestedTicker = req.params.ticker;

  // If requested ticker does not exist, return 0
  // as aggregation result
  if (!(requestedTicker in storage.tickers)) {
    res.send(JSON.stringify({
      total: 0
    }));
    return;
  }

  // If it does exist, then just return the accumulator
  res.send(JSON.stringify({
    total: storage.tickers[requestedTicker].toString()
  }));
  
});

/*
    This endpoint returns a JSON object of given user
    containing total balances of all their tickers.

    ex: GET /user/0xacc30

    If user does not exist in the system, returns a text message.
*/
router.get('/user/:userId', (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const requestedUser = req.params.userId;

  if (!(requestedUser in storage.users)) {
    res.send(constants.ERR_006);
    return;
  }

  res.send(JSON.stringify(storage.users[requestedUser]));
});


module.exports = router;
