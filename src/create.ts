/**
 * Creates a URL to redirect the user to in order to authenticate with Steam
 *
 * @function createAuthenticationUrl
 * @param {string} realm The realm URL that identifies your application
 * @param {string} returnPath The path to which the user will be redirected after authentication
 *
 * @example
 * const url = createAuthenticationUrl("https://example.com", "/steam/callback")
 * response.redirect(url.toString())
 *
 * @returns {URL} The URL object to redirect the user to
 */
export function createAuthenticationUrl(realm: string, returnPath: string): URL {
	if (!returnPath.startsWith('/')) {
		throw new Error('Return path must start with /')
	}

	const url = new URL('/openid/login', 'https://steamcommunity.com')
	const params = {
		'openid.mode': 'checkid_setup',
		'openid.ns': 'http://specs.openid.net/auth/2.0',
		'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
		'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
		'openid.return_to': realm + returnPath,
		'openid.realm': realm
	}

	for (const [key, value] of Object.entries(params)) {
		url.searchParams.append(key, value)
	}

	return url
}

/**
 * @deprecated Use `createAuthenticationUrl` instead
 */
export const createAuthUrl = createAuthenticationUrl
