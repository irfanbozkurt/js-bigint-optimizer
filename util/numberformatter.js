
/**
 * Removes the redundant zeroes at the beginning
 * of a numerical string.
 * 
 * @param {string} num
 */
const clearZeroes = (num) => {
    const negative = num[0] == '-';
    let i = negative ? 1 : 0;

    while (num[i] == 0) i++;

    if (i == num.length)
        return "0";

    if (negative)
        return "-" + num.slice(i);
        
    return num.slice(i);
};

module.exports = {clearZeroes: clearZeroes};
