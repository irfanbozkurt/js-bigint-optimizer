const bigNumber = require('./bignumber');

const constants = require('../common/constants');

const numberDigitLimit = constants.JS_MAX_SAFE_DIGITS;
const bigIntAdditionDigitLimit = constants.BIGINT_ADDITION_DIGIT_LIMIT;
const bigIntSubtractionDigitLimit = constants.BIGINT_SUBTRACTION_DIGIT_LIMIT;


/**
 * Chooses an addition algorithm depending on input length.
 * Only works with "0" or positive input for big numbers.
 * 
 * @param {string} a - First number
 * @param {string} b - Second number
 */
const performAddition = (a, b) => {
    // Second input might contain a negative sign "-"
    // Don't consider it.
    const lengthA = a.length, lengthB = b[0] == '-' ? b.length-1 : b.length;

    if (lengthA <= numberDigitLimit && lengthB <= numberDigitLimit)
        return (parseInt(a) + parseInt(b)).toString();
    
    if (lengthA > bigIntAdditionDigitLimit || lengthB > bigIntAdditionDigitLimit)
        return bigNumber.addition(a, b);

    return (BigInt(a) + BigInt(b)).toString();
}

/**
 * Chooses an addition algorithm depending on input length.
 * Subtracts a from b
 * 
 * @param {string} a - Minuend
 * @param {string} b - Subtrahend
 */
const performSubtraction = (a, b) => {
    const lengthA = a.length, lengthB = b.length;

    if (lengthA <= numberDigitLimit && lengthB <= numberDigitLimit)
        return (parseInt(a) - parseInt(b)).toString();
    
    if (lengthA > bigIntSubtractionDigitLimit || lengthB > bigIntSubtractionDigitLimit)
        return bigNumber.subtraction(a, b);

    return (BigInt(a) - BigInt(b)).toString();
}


module.exports = {
    performAddition: performAddition,
    performSubtraction: performSubtraction
};
