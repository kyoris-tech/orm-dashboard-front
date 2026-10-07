import { NextResponse } from 'next/server';
import { backendClient, withBearerToken } from '@/lib/http/backend-client';
import { forwardAxiosError } from '@/lib/http/forward-error';
import { requireSessionToken } from '@/lib/auth/require-session';

export type RouteParams = Record<string, string>;

export interface RouteContext {
  params: Promise<RouteParams>;
}

export interface AuthenticatedRouteArgs {
  token: string;
  request: Request;
  params: RouteParams;
}

type HttpMethod = 'get' | 'post' | 'patch' | 'delete';

export interface ProxyOptions {
  method: HttpMethod;
  path: string | ((params: RouteParams) => string);
  errorMessage: string;
  query?: boolean;
  body?: boolean;
  public?: boolean;
  respond?: (data: unknown, params: RouteParams) => unknown;
}

async function resolveParams(context?: RouteContext): Promise<RouteParams> {
  return context ? await context.params : {};
}

export function authenticatedRoute(
  errorMessage: string,
  handler: (args: AuthenticatedRouteArgs) => Promise<NextResponse>,
) {
  return async (request: Request, context?: RouteContext): Promise<NextResponse> => {
    const token = await requireSessionToken();

    if (token instanceof NextResponse) {
      return token;
    }

    try {
      return await handler({ token, request, params: await resolveParams(context) });
    } catch (error) {
      return forwardAxiosError(error, errorMessage);
    }
  };
}

async function forward(options: ProxyOptions, request: Request, params: RouteParams, token?: string) {
  const url = typeof options.path === 'function' ? options.path(params) : options.path;
  const query = options.query ? Object.fromEntries(new URL(request.url).searchParams) : undefined;
  const data = options.body ? await request.json() : undefined;

  const response = await backendClient.request({
    method: options.method,
    url,
    data,
    params: query,
    ...(token ? withBearerToken(token) : {}),
  });

  return NextResponse.json(options.respond ? options.respond(response.data, params) : response.data);
}

export function proxyHandler(options: ProxyOptions) {
  if (options.public) {
    return async (request: Request, context?: RouteContext): Promise<NextResponse> => {
      try {
        return await forward(options, request, await resolveParams(context));
      } catch (error) {
        return forwardAxiosError(error, options.errorMessage);
      }
    };
  }

  return authenticatedRoute(options.errorMessage, ({ token, request, params }) =>
    forward(options, request, params, token),
  );
}
