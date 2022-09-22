
const numberFormatter = require('./numberformatter');

const maxDigits = require('../common/constants').JS_MAX_SAFE_DIGITS;


/**
 * Parses a big number into valid Number elements.
 * Returns these "chunks" as a list.
 * 
 * @param {string} bigNumber
 */
const parseOperand = (bigNumber) => {
    const chunks = [];

    const numberOfChunks = Math.floor(bigNumber.length / maxDigits);
    const firstChunkSize = bigNumber.length - maxDigits * numberOfChunks;

    if (firstChunkSize != 0)
        chunks.push(
            parseInt(
                bigNumber.slice(0, firstChunkSize)
            )
        );

    for (let i=0; i<numberOfChunks; i++)
        chunks.push(
            parseInt(
                bigNumber.slice(firstChunkSize + i*maxDigits, firstChunkSize + (i+1)*maxDigits)
            )
        );

    return chunks;
};

/**
 * Adds two big numbers and returns the result as a string.
 * 
 * @param {string} first - First big number
 * @param {string} second - Second big number
 */
const addition = (first, second) => {

    // Get the input strings as number chunks
    const firstTokens = parseOperand(first);
    const secondTokens = parseOperand(second);

    const firstTokensLength = firstTokens.length;
    const secondTokensLength = secondTokens.length;

    // Get the bigger chunk size
    const maxLength = Math.max(firstTokensLength, secondTokensLength);

    // Initialize an array full of zeroes for the return value
    const resultingArray = new Array(maxLength);
    for (let i=0; i<maxLength; i++) resultingArray[i] = 0;

    // Iterate from right to left, issueing each chunk of both numbers
    for(
        let i = firstTokensLength-1, 
        j = secondTokensLength-1,
        k = maxLength-1
        ;; i--, j--, k--
    ) {
        // Perform addition.
        // Chunks of smaller number might have been done. Only perform
        // addition if corresponding number still have chunks to issue.
        resultingArray[k] = (
            resultingArray[k]  
            +
            (i >= 0 ? firstTokens[i] : 0)
            +
            (j >= 0 ? secondTokens[j] : 0)
        ).toString();
        
        // Get out as soon as the last chunk is added, to avoid the
        // following steps.
        if (i <= 0 && j <= 0)
            break;
        
        // Get the length of the current chunk of the resulting array
        const currentStepLength = resultingArray[k].length;
        // If current chunk size exceeds the safe addition limit, then
        // send a "carry-out" to the chunk on the left.
        if (currentStepLength > maxDigits) {
            resultingArray[k-1] = 1; //carry-out
            //get rid of the leftmost digit
            resultingArray[k] = resultingArray[k].slice(1); 

        // Resulting number may be smaller than the expected chunk size.
        // This means we must fill-in the beginning with zeroes.
        } else if (currentStepLength < maxDigits)
            resultingArray[k] = 
                "0".repeat(maxDigits - currentStepLength) 
                + 
                resultingArray[k].toString();
    }

    // Merge the chunks as string and return the result.
    // Append "-" if the result was expected to be negative.
    return resultingArray.join('');
};

/**
 * Compares two numerical strings.
 * Returns 1 if a>b, -1 if a<b, 0 if a=b
 * 
 * @param {string} a - First number
 * @param {string} b - Second number
 */
const compareStringNumbers = (a, b) => {
    if (a.length > b.length) return 1;
    if (a.length < b.length) return -1;
    if (a > b) return 1;
    if (b > a) return -1;
    return 0;
};

/**
 * Subtracts the "second" big number from the "first" one.
 * 
 * @param {string} a - First big number
 * @param {string} b - Second big number
 */
 const subtraction = (a, b) => {

    // Get the bigger number
    const comparisonResult = compareStringNumbers(a,b);
    // Immediately return zero if strings are equal
    if (comparisonResult == 0)
        return "0"

    let negativeResult; // Result can be negative
    let bigger, smaller; // first is bigger, second is smaller
    if (comparisonResult == 1) {
        bigger = a;
        smaller = b;
        negativeResult = false;
    } else {
        bigger = b;
        smaller = a;
        negativeResult = true;
    }

    // Get the input strings as number chunks
    const biggerTokens = parseOperand(bigger);
    const smallerTokens = parseOperand(smaller);

    const biggerTokensLength = biggerTokens.length;
    const smallerTokensLength = smallerTokens.length;

    // Initialize an array full of zeroes for the return value
    const resultingArray = new Array(biggerTokensLength);
    for (let i=0; i<biggerTokensLength; i++) resultingArray[i] = 0;

    // Iterate from right to left, issueing each chunk of both numbers
    // Get out when smaller array is done.
    let i = biggerTokensLength-1, j = smallerTokensLength-1;
    for(; j>=0; i--, j--) {

        // Borrow from left
        while (biggerTokens[i] < smallerTokens[j]) {
            let k=i-1;
            while (true)
                if (biggerTokens[k] != 0) {
                    biggerTokens[k]--;
                    biggerTokens[k+1] += 1000000000000000;
                    break;
                }
                else k--;
        }

        // Perform subtraction and store as string
        resultingArray[i] = (biggerTokens[i] - smallerTokens[j]).toString();

        // Resulting number may be smaller than the expected chunk size.
        // This means we must fill-in the beginning with zeroes.
        const currentStepLength = resultingArray[i].length;
        if (currentStepLength < maxDigits)
            resultingArray[i] = "0".repeat(maxDigits - currentStepLength) + resultingArray[i].toString();
    }

    // Push the remaining chunks of the bigger number at the beginning
    // of the resulting array
    while (i >= 0) {
        resultingArray[i] = biggerTokens[i].toString();

        const currentStepLength = resultingArray[i].length;
        if (currentStepLength < maxDigits)
            resultingArray[i] = "0".repeat(maxDigits - currentStepLength) + resultingArray[i].toString();
        
        i--;
    }

    // Merge the chunks as string and return the result.
    // Avoid redundant zeroes at the beginning
    // Append "-" if the result was expected to be negative.
    return (negativeResult ? "-" : "") + numberFormatter.clearZeroes(resultingArray.join(''));
};

module.exports = {
    addition: addition,
    subtraction: subtraction
};
