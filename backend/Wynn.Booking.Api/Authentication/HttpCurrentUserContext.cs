using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Api.Authentication;

public sealed class HttpCurrentUserContext(IHttpContextAccessor httpContextAccessor) : ICurrentUserContext
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated == true;

    public int? MemberId
    {
        get
        {
            var value = User?.FindFirstValue(JwtClaimTypes.MemberId)
                ?? User?.FindFirstValue(ClaimTypes.NameIdentifier);

            return int.TryParse(value, out var memberId) ? memberId : null;
        }
    }

    public string? Email =>
        User?.FindFirstValue(ClaimTypes.Email)
        ?? User?.FindFirstValue(JwtRegisteredClaimNames.Email);

    public string? FirstName =>
        User?.FindFirstValue(ClaimTypes.GivenName)
        ?? User?.FindFirstValue(JwtRegisteredClaimNames.GivenName);

    public string? LastName =>
        User?.FindFirstValue(ClaimTypes.Surname)
        ?? User?.FindFirstValue(JwtRegisteredClaimNames.FamilyName);

    public string? Role => User?.FindFirstValue(ClaimTypes.Role);
}
