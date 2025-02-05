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
export declare function validateCallbackUrl(responseUrl: string | URL, realm: string, returnPath: string, allowedSkewMs?: number): Promise<string>;
