import { initializeParams } from './helpers/init';
import { VLOverWSHandler } from './protocols/vless';
import { TROverWSHandler } from './protocols/trojan';
import { updateWarpConfigs } from './kv/handlers';
import { logout, resetPassword, login } from './authentication/auth';
import { renderErrorPage } from './pages/error';
import { getXrayCustomConfigs, getXrayWarpConfigs } from './cores-configs/xray';
import { getSingBoxCustomConfig, getSingBoxWarpConfig } from './cores-configs/sing-box';
import { getClashNormalConfig, getClashWarpConfig } from './cores-configs/clash';
import { getNormalConfigs } from './cores-configs/normalConfigs';
import { fallback, getMyIP, handlePanel } from './helpers/helpers';
import { renderSecretsPage } from './pages/secrets';

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
