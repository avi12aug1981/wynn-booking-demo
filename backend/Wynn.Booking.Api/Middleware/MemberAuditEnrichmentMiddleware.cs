using System.Security.Claims;
using Serilog.Context;
using Wynn.Booking.Api.Authentication;

namespace Wynn.Booking.Api.Middleware;

/// <summary>
/// After JWT validation, pushes member id/email into Serilog so API and SQL lines match the UI session.
/// </summary>
public sealed class MemberAuditEnrichmentMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var memberId = context.User.FindFirstValue(JwtClaimTypes.MemberId);
            var email = context.User.FindFirstValue(ClaimTypes.Email);

            using (LogContext.PushProperty("MemberId", memberId))
            using (LogContext.PushProperty("MemberEmail", email))
            {
                await next(context);
                return;
            }
        }

        await next(context);
    }
}
