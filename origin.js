import { initializeParams } from './helpers/init.js';
import { VLOverWSHandler } from './protocols/vless.js';
import { TROverWSHandler } from './protocols/trojan.js';
import { 
  fallback, 
  serveIcon, 
  renderError, 
  renderSecrets, 
  handlePanel, 
  handleSubscriptions, 
  handleLogin 
} from './helpers/helpers.js';
import { logout } from './authentication/auth.js';

const routeHandlers = {
  '/panel': handlePanel,
  '/sub': handleSubscriptions,
  '/login': handleLogin,
  '/logout': logout,
  '/error': renderError,
  '/secrets': renderSecrets,
  '/favicon.ico': serveIcon
};

export default {
  async fetch(request, env) {
    try {
      // 初始化参数
      initializeParams(request, env);
      const { pathName } = globalThis;
      const upgradeHeader = request.headers.get('Upgrade');
      
      // 处理WebSocket请求
      if (upgradeHeader === 'websocket') {
        return pathName.startsWith('/tr')
          ? await TROverWSHandler(request)
          : await VLOverWSHandler(request);
      }

      // 处理常规路径请求
      for (const [route, handler] of Object.entries(routeHandlers)) {
        if (pathName.startsWith(route)) {
          return await handler(request, env);
        }
      }

      // 默认处理
      return await fallback(request);

    } catch (error) {
      console.error('Error in fetch:', error);
      return Response.redirect(`${globalThis.urlOrigin}/error?error=${encodeURIComponent(error.toString())}`, 302);
    }
  }
};
