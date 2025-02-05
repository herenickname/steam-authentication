# Steam Authentication

This package provides robust Steam authentication with zero dependencies, built on the WebAPI fetch. Note that fetch is not available in older versions of Node.js.

## Features

-   Robust verification
-   Zero dependencies
-   Supports both CommonJS (CJS) and ECMAScript Modules (ESM)

## Installation

`npm install steam-authentication`

## Usage

### Creating an Authentication URL

Use the createAuthUrl function to generate a URL for redirecting users to Steam for authentication.

```ts
import { createAuthUrl } from 'steam-authentication'
const realm = 'https://example.com'
const returnPath = '/steam/callback'
const url = createAuthUrl(realm, returnPath)

console.log(url.toString()) // "https://steamcommunity.com/openid/login?..."
```

### Validating the Callback URL

Use the validateCallbackUrl function to validate the callback URL received from Steam and extract the Steam ID.

```ts
import { validateCallbackUrl } from 'steam-authentication'

const responseUrl = 'https://example.com/steam/callback?openid.ns=...'
const realm = 'https://example.com'
const returnPath = '/steam/callback'

validateCallbackUrl(responseUrl, realm, returnPath)
	.then((steamId) => {
		console.log(steamId) // "76561197960287930"
	})
	.catch((error) => {
		console.error('Validation failed:', error)
	})
```

## Building the Project

To build the project, run the following command:

`npm run build`

This will generate both CommonJS and ESM modules in the dist directory.

## License

This project is licensed under the MIT License.
