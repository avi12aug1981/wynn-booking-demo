import type {
    ApiRouteContext,
    ApiRouteHandler,
    HttpMethod,
    RegisteredApiRoute,
  } from "./route-types";
  
  type ApiRouteMatchResult = {
    matched: boolean;
    routeParams: Record<string, string>;
  };
  
  function toPath(segments: string[]) {
    return `/${segments.join("/")}`;
  }
  
  /**
   * Matches API request paths against feature-owned route patterns.
   *
   * Dynamic segments use ':name' notation so API ownership remains
   * independent from the framework's filesystem routing model.
   */
  function matchRoute(pattern: string, path: string): ApiRouteMatchResult {
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
   * API route registry used by the single API Gateway.
   *
   * Feature modules register their API handlers here. The gateway can apply
   * cross-cutting concerns such as logging, security, throttling, and error
   * handling before delegating to feature-owned handlers.
   */
  export function createApiRouteRegistry(routes: RegisteredApiRoute[]) {
    return {
      resolve(
        method: HttpMethod,
        context: ApiRouteContext
      ): {
        handler: ApiRouteHandler;
        routeParams: Record<string, string>;
      } | null {
        const path = toPath(context.segments);
  
        for (const route of routes) {
          if (route.method !== method) {
            continue;
          }
  
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