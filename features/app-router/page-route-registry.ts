import type {
    PageRouteContext,
    PageRouteHandler,
    RegisteredPageRoute,
  } from "./route-types";
  
  type RouteMatchResult = {
    matched: boolean;
    routeParams: Record<string, string>;
  };
  
  function toPath(segments: string[]) {
    return `/${segments.join("/")}`;
  }
  
  /**
   * Matches a request path against a registered route pattern.
   *
   * Dynamic route parts use ':name' notation so the application router
   * remains framework-independent.
   *
   * Example:
   *   Pattern: /rooms/:roomId
   *   Path:    /rooms/101
   *   Params:  { roomId: "101" }
   */
  function matchRoute(pattern: string, path: string): RouteMatchResult {
    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);
    const routeParams: Record<string, string> = {};
  
    if (patternParts.length !== pathParts.length) {
      return {
        matched: false,
        routeParams,
      };
    }
  
    for (let index = 0; index < patternParts.length; index += 1) {
      const patternPart = patternParts[index];
      const pathPart = pathParts[index];
  
      if (patternPart.startsWith(":")) {
        routeParams[patternPart.slice(1)] = pathPart;
        continue;
      }
  
      if (patternPart !== pathPart) {
        return {
          matched: false,
          routeParams: {},
        };
      }
    }
  
    return {
      matched: true,
      routeParams,
    };
  }
  
  /**
   * Page route registry used by the single Page Gateway.
   *
   * Feature modules register page routes here instead of creating one
   * framework-owned route file per page. This keeps page ownership inside
   * the feature while still allowing the framework to expose one gateway.
   */
  export function createPageRouteRegistry(routes: RegisteredPageRoute[]) {
    return {
      resolve(context: PageRouteContext): {
        handler: PageRouteHandler;
        routeParams: Record<string, string>;
      } | null {
        const path = toPath(context.segments);
  
        for (const route of routes) {
          const match = matchRoute(route.pattern, path);
  
          if (match.matched) {
            return {
              handler: route.handler,
              routeParams: match.routeParams,
            };
          }
        }
  
        return null;
      },
    };
  }