import { initializeParams } from './helpers/init';
import { VLOverWSHandler } from './protocols/vless';
import { TROverWSHandler } from './protocols/trojan';
import { fallback, serveIcon, renderError, renderSecrets, handlePanel, handleSubscriptions, handleLogin } from './helpers/helpers';
import { logout } from './authentication/auth';

export default {
	async fetch(request, env) {
		try {
			const { pathName, urlOrigin } = initializeParams(request, env);
			const isWebSocket = request.headers.get('Upgrade')?.toLowerCase() === 'websocket';

			if (!isWebSocket) {
				const routes = {
					'/panel': handlePanel,
					'/sub': handleSubscriptions,
					'/login': handleLogin,
					'/logout': logout,
					'/error': renderError,
					'/secrets': renderSecrets,
					'/favicon.ico': serveIcon,
				};

				for (const route in routes) {
					if (pathName.startsWith(route)) {
						return await routes[route](request, env);
					}
				}

				// Default fallback if no routes matched
				return await fallback(request);
			} else {
				// WebSocket upgrade handling
				if (pathName.startsWith('/tr')) {
					return await TROverWSHandler(request);
				} else {
					return await VLOverWSHandler(request);
				}
			}
		} catch (error) {
			// Redirect to /error with encoded error message
			return Response.redirect(`${urlOrigin}/error?error=${encodeURIComponent(error.toString())}`, 302);
		}
	}
};
