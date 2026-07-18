import { Express } from 'express';

interface RouteData {
  method: string;
  path: string;
  middleware: string[];
}

export const discoverRoutes = (app: Express): RouteData[] => {
  const routes: RouteData[] = [];

  const processStack = (stack: any[], basePath: string = '') => {
    stack.forEach((layer) => {
      if (layer.route) {
        // Individual Route
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
        methods.forEach(method => {
          routes.push({
            method,
            path: basePath + layer.route.path,
            middleware: layer.route.stack.map((s: any) => s.name || 'anonymous')
          });
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // Nested Router
        // Regex trick to extract the base path from Express internal regexp
        const regexStr = layer.regexp.toString();
        let matchedPath = '';
        if (regexStr !== '/^\\/?(?=\\/|$)/i') {
          matchedPath = regexStr.replace('/^\\', '').replace('\\/?(?=\\/|$)/i', '').replace(/\\\//g, '/');
          // cleanup complex regex syntax express generates
          matchedPath = matchedPath.split('/?')[0].replace('/^', '');
        }
        processStack(layer.handle.stack, basePath + matchedPath);
      }
    });
  };

  processStack(app._router.stack);
  return routes;
};
