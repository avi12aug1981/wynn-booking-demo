using System.Security.Claims;
using Serilog;
using Wynn.Booking.Api.Authentication;
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

        var operation = context.Items.TryGetValue(HttpContextExtensions.ClientOperationItemKey, out var op)
            ? op as string
            : null;

        var memberId = context.User.FindFirstValue(JwtClaimTypes.MemberId);
        var memberEmail = context.User.FindFirstValue(ClaimTypes.Email);

        Log.Information(
            "HTTP {Method} {Path} -> {StatusCode} Operation={Operation} MemberId={MemberId} MemberEmail={MemberEmail} ApiTraceId={ApiTraceId}",
            context.Request.Method,
            context.Request.Path.Value,
            context.Response.StatusCode,
            operation,
            memberId,
            memberEmail,
            traceId);
    }
}
