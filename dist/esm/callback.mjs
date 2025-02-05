const requiredSearchFields = [
    'openid.ns',
    'openid.mode',
    'openid.op_endpoint',
    'openid.claimed_id',
    'openid.identity',
    'openid.return_to',
    'openid.response_nonce',
    'openid.assoc_handle',
    'openid.signed',
    'openid.sig'
];
const requiredSignedFields = [
    // Breaks prettier formatting
    'signed',
    'op_endpoint',
    'claimed_id',
    'identity',
    'return_to',
    'response_nonce',
    'assoc_handle'
];
const regexpClaimedId = /^https:\/\/steamcommunity\.com\/openid\/id\/(765\d{14,14})$/;
const regexpAllowedSearchSymbols = /^\?(%3A|%2F|%3F|%3D|%2C|%2B|[a-z0-9]|[\.\-_=&])+$/i;
const regexpAllowedSignedSymbols = /^[a-z,_]+$/i;
/**
 * Verifies the Steam OpenID callback URL and returns the Steam ID if valid.
 *
 * @function SteamVerifyCallback
 * @param {string | URL} responseUrl - The callback URL received from Steam.
 * @param {string} realm - The realm URL that identifies your application.
 * @param {string} returnPath - The path to which the user will be redirected after authentication.
 * @param {number} [allowedSkewMs=20000] - The allowed time difference between the response nonce and the current time.
 *
 * @example
 * const steamId = await SteamVerifyCallback(request.url, "https://example.com", "/steam/callback")
 * console.log(steamId) // "76561197960287930"
 *
 * @returns {Promise<string>} The Steam ID64 if the callback URL is valid.
 * @throws {Error} If the callback URL is invalid or verification fails.
 */
export async function validateCallbackUrl(responseUrl, realm, returnPath, allowedSkewMs = 20000) {
    const returnTo = realm + returnPath;
    const callbackUrl = new URL(responseUrl);
    const searchParams = Object.fromEntries(callbackUrl.searchParams.entries());
    validateBaseFields(callbackUrl, searchParams, returnTo);
    validateResponseNonce(searchParams['openid.response_nonce'], allowedSkewMs);
    const steamId64 = validateSteamId(searchParams['openid.claimed_id']);
    await validateThroughSteam(searchParams);
    return steamId64;
}
function validateBaseFields(callbackUrl, searchParams, returnTo) {
    if (!callbackUrl.toString().startsWith(returnTo + '?')) {
        throw new Error('Return path is not equal to callback path');
    }
    const searchParamsKeys = Object.keys(searchParams);
    // Check symbols in callback url
    if (!regexpAllowedSearchSymbols.test(callbackUrl.search)) {
        throw new Error('Callback URL contains invalid characters');
    }
    // Check if all required fields are present
    const isEverySearchFieldOnlyOnce = requiredSearchFields.every((field) => {
        return callbackUrl.search.split(`${field}=`).length === 2;
    });
    if (!isEverySearchFieldOnlyOnce) {
        throw new Error('Callback URL contains required fields more than once');
    }
    // Check if all required fields are present
    let isNoOtherSearchFields = searchParamsKeys.every((key) => requiredSearchFields.includes(key));
    isNoOtherSearchFields && (isNoOtherSearchFields = searchParamsKeys.length === requiredSearchFields.length);
    if (!isNoOtherSearchFields) {
        throw new Error('Callback URL contains other fields than required');
    }
    // Check if all required fields are signed
    if (!regexpAllowedSignedSymbols.test(searchParams['openid.signed'])) {
        throw new Error('Signed key does not contains bad symbols');
    }
    const signedFields = searchParams['openid.signed'].split(',');
    let isNoOtherSignedFields = signedFields.every((field) => requiredSignedFields.includes(field));
    isNoOtherSignedFields && (isNoOtherSignedFields = signedFields.length === requiredSignedFields.length);
    if (!isNoOtherSignedFields) {
        throw new Error('Signed key contains other fields than required');
    }
    // Base checks
    if (searchParams['openid.ns'] !== 'http://specs.openid.net/auth/2.0') {
        throw new Error('Namespace is not valid');
    }
    if (searchParams['openid.mode'] !== 'id_res') {
        throw new Error('Mode is not id_res');
    }
    if (searchParams['openid.op_endpoint'] !== 'https://steamcommunity.com/openid/login') {
        throw new Error('OpenID Provider endpoint is bad');
    }
    if (searchParams['openid.claimed_id'] !== searchParams['openid.identity']) {
        throw new Error('Claimed ID is not equal to identity');
    }
    if (searchParams['openid.return_to'] !== returnTo) {
        throw new Error('Return path is not equal to base domain');
    }
    if (searchParams['openid.assoc_handle'] !== '1234567890') {
        throw new Error('Assoc handle is not 1234567890');
    }
}
function validateSteamId(claimedId) {
    const matchClaimedId = claimedId.match(regexpClaimedId);
    if (!matchClaimedId) {
        throw new Error('Claimed ID is not valid');
    }
    return matchClaimedId[1];
}
function validateResponseNonce(nonce, allowedSkewMs = 20000) {
    if (typeof nonce !== 'string' || nonce.length < 20) {
        throw new Error('Incorrect response_nonce format');
    }
    // Extract timestamp (assuming first 20 characters are ISO-8601 format)
    const timestampPart = nonce.substring(0, 20);
    const nonceTime = Date.parse(timestampPart);
    if (isNaN(nonceTime)) {
        throw new Error('Failed to parse timestamp in response_nonce');
    }
    const now = Date.now();
    if (Math.abs(now - nonceTime) > allowedSkewMs) {
        throw new Error('response_nonce timestamp is outside allowed range');
    }
    return true;
}
async function validateThroughSteam(searchParams) {
    // For verification, we need to change the mode to check_authentication
    const params = { ...searchParams, 'openid.mode': 'check_authentication' };
    // Form request body in application/x-www-form-urlencoded format
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        body.append(key, value);
    }
    // Send a POST request to the Steam OpenID endpoint
    const response = await fetch('https://steamcommunity.com/openid/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    });
    if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
    }
    // Read the response text
    const responseText = await response.text();
    console.log({ responseText });
    // Verify the response
    const isValid = responseText === 'ns:http://specs.openid.net/auth/2.0\nis_valid:true\n';
    if (!isValid) {
        throw new Error('Steam verification failed');
    }
}
