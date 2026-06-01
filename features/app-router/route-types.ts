import { NextRequest } from "next/server";

export type PageRouteContext = {
    segments: string[];
    routeParams: Record<string, string>;
    searchParams: Record<string, string | string[] | undefined>;
  };

export type PageRouteHandler = (
  context: PageRouteContext
) => Promise<React.ReactNode> | React.ReactNode;

export type ApiRouteContext = {
  request: NextRequest;
  segments: string[];
};

export type ApiRouteHandler = (
  context: ApiRouteContext
) => Promise<Response>;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RegisteredApiRoute = {
  method: HttpMethod;
  pattern: string;
  handler: ApiRouteHandler;
};

export type RegisteredPageRoute = {
  pattern: string;
  handler: PageRouteHandler;
};