using Serilog;
using Wynn.Booking.Api.Extensions;

namespace Wynn.Booking.Api.Middleware;

/// <summary>
/// Writes one completion line per HTTP request with the same ApiTraceId returned in API responses.
/// </summary>
public sealed class RequestCompletionLoggingMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        await next(context);

        var traceId = context.GetTraceId();

        Log.Information(
            "HTTP {Method} {Path} -> {StatusCode} ApiTraceId={ApiTraceId}",
            context.Request.Method,
            context.Request.Path.Value,
            context.Response.StatusCode,
            traceId);
    }
}
