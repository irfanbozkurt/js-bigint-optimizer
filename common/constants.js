
module.exports = {

    JS_MAX_SAFE_DIGITS: 15,
    BIGINT_ADDITION_DIGIT_LIMIT: 800,
    BIGINT_SUBTRACTION_DIGIT_LIMIT: 600,

    MSG_001: 'Input successfully taken',
    MSG_002: 'Values are reset.',

    ERR_001: 'Your JSON input must have following keys: \"ticker\", \"userId\", \"Balance\"',
    ERR_002: 'Input may not contain more than 3 keys: \"ticker\", \"userId\", \"Balance\"',
    ERR_003: 'Value of \"ticker\" field must be a non-empty string',
    ERR_004: 'Value of \"userId\" field must be a non-empty string',
    ERR_005: 'Value of \"Balance\" field must be a non-empty string consisting of digits only. No negative sign allowed.',
    ERR_006: 'User does not exist in database. Maybe you are case-insensitive?'
}
