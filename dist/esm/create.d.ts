/**
 * Creates a URL to redirect the user to in order to authenticate with Steam
 *
 * @function SteamCreateAuthUrl
 * @param {string} realm The realm URL that identifies your application
 * @param {string} returnPath The path to which the user will be redirected after authentication
 *
 * @example
 * const url = SteamCreateAuthUrl("https://example.com", "/steam/callback")
 * response.redirect(url.toString())
 *
 * @returns {URL} The URL object to redirect the user to
 */
export declare function createAuthUrl(realm: string, returnPath: string): URL;
