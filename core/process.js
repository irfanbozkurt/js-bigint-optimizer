const storage = require('./storage');
const algebra = require('../util/algebra');


/*
    Reset all stored data
*/
const reset = () => {
    storage.users = {};
    storage.tickers = {};
};

/*
    Updates user's database entry.
    Returns the balance delta: newBalance - oldBalance

    This delta will later be added to the global ticker balance.

    For example, say a user already has 5 ETH, and total ETH in 
    database is 10 ETH. If that user's account is updated to have 
    3 ETH, total ETH balance will be 10 + (3 - 5) = 8 ETH.
*/
const updateUserBalance = (userId, ticker, newBalance) => {
    var delta = newBalance;

    // If user exists in database...
    if (userId in storage.users) {
        // If user already has a balance for given ticker, 
        // calculate delta
        if (ticker in storage.users[userId])
            delta = algebra.performSubtraction(newBalance, storage.users[userId][ticker]);
            //        delta -= BigInt(storage.users[userId][ticker]);

        // update user balance
        storage.users[userId][ticker] = newBalance; 

    // If user does not exist in database, then PUT
    } else {
        const newUser = {};
        newUser[ticker] = newBalance;
        storage.users[userId] = newUser;
    }

    // Return newBalance - oldBalance
    return delta;
};

/*
    Updates the global ticker accumulator so that O(1)
    aggregation is possible
*/
const updateGlobalTicker = (ticker, delta) => {
    if (ticker in storage.tickers)
        if (delta[0] == '-')
            storage.tickers[ticker] = algebra.performSubtraction(storage.tickers[ticker], delta.slice(1));
        else
            storage.tickers[ticker] = algebra.performAddition(storage.tickers[ticker], delta);
    else
        storage.tickers[ticker] = delta;
};

/*
    1. Update user balance
    2. Update global ticker accumulator

    ...upon every balance update.
*/
const takeInput = (userId, ticker, newBalance) => {
    updateGlobalTicker(
        ticker,
        updateUserBalance(userId, ticker, newBalance)
    );
};


module.exports = {
    takeInput: takeInput,
    reset: reset
}
