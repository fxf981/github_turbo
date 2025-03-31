export default {
    async fetch(request, env) {
      const _url = new URL(request.url);
      const hostname = _url.hostname;
  
      // 地域限制：仅允许中国（CN）访问
      const country = request.headers.get('CF-IPCountry') || 'XX'; // 默认处理无地区头的情况
      if (country !== 'CN') {
        return new Response('仅限中国大陆地区访问 | Access Denied: Mainland China Only', {
          status: 403,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
  
      // 拦截敏感路径（如登录/注册）
      if (_url.pathname.includes('/login') || _url.pathname.includes('/signup')) {
        return new Response('安全策略拦截敏感路径', { status: 403 });
      }
  
      // 构造 GitHub 请求
      _url.hostname = "github.com";
      const req = new Request(_url, request);
      req.headers.set('origin', 'https://github.com'); // 修复 CORS 问题
  
      // 转发请求并处理响应
      const res = await fetch(req);
      const newres = new Response(res.body, res);
  
      // 重定向地址修正
      const location = newres.headers.get('location');
      if (location) {
        newres.headers.set('location', location.replace('://github.com', `://${hostname}`));
      }
  
      return newres;
    },
  };