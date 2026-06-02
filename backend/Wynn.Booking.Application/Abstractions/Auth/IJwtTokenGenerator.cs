using Wynn.Booking.Application.Auth.Dtos;

namespace Wynn.Booking.Application.Abstractions.Auth;

public interface IJwtTokenGenerator
{
    JwtTokenResult GenerateToken(AuthenticatedUserDto user);
}

public sealed record JwtTokenResult(
    string AccessToken,
    DateTime ExpiresAtUtc);
