using Microsoft.Extensions.Options;
using Wynn.Booking.Api.Configuration;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Api.Middleware;

public sealed class ApiKeyMiddleware(RequestDelegate next, IOptions<ApiSecurityOptions> options)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var settings = options.Value;

        if (!settings.RequireApiKeyForBookingSessions ||
            !IsProtectedBookingSessionRequest(context))
        {
            await next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue(settings.ApiKeyHeaderName, out var suppliedKey) ||
            string.IsNullOrWhiteSpace(suppliedKey) ||
            !string.Equals(suppliedKey.ToString(), settings.InternalApiKey, StringComparison.Ordinal))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                message = ApplicationMessages.Common.Unauthorized,
                traceId = context.TraceIdentifier,
            });
            return;
        }

        await next(context);
    }

    private static bool IsProtectedBookingSessionRequest(HttpContext context) =>
        context.Request.Path.StartsWithSegments("/api/booking-sessions", StringComparison.OrdinalIgnoreCase) &&
        HttpMethods.IsPost(context.Request.Method);
}
