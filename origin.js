import { initializeParams } from './src/helpers/init.js';
import { VLOverWSHandler } from './src/protocols/vless.js';
import { TROverWSHandler } from './src/protocols/trojan.js';
import { fallback, serveIcon, renderError, renderSecrets, handlePanel, handleSubscriptions, handleLogin } from './src/helpers/helpers.js';
import { logout } from './src/authentication/auth.js';

export default {
	async fetch(request, env) {
		try {
			initializeParams(request, env);
			const { pathName } = globalThis;
			const upgradeHeader = request.headers.get('Upgrade');
			if (!upgradeHeader || upgradeHeader !== 'websocket') {
				if (pathName.startsWith('/panel')) return await handlePanel(request, env);
				if (pathName.startsWith('/sub')) return await handleSubscriptions(request, env);
				if (pathName.startsWith('/login')) return await handleLogin(request, env);
				if (pathName.startsWith('/logout')) return await logout(request, env);
				if (pathName.startsWith('/error')) return await renderError();
				if (pathName.startsWith('/secrets')) return await renderSecrets();
				if (pathName.startsWith('/favicon.ico')) return await serveIcon();
				return await fallback(request);
			} else {
				return pathName.startsWith('/tr')
					? await TROverWSHandler(request)
					: await VLOverWSHandler(request);
			}
		} catch (error) {
			return Response.redirect(`${globalThis.urlOrigin}/error?error=${error.toString()}`, 302);
		}
	}
};
