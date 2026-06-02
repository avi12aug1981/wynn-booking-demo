namespace Wynn.Booking.Application.Auth.Dtos;

public sealed record LoginRequestDto(string Email, string Password);

public sealed record LoginResponseDto(
    string AccessToken,
    DateTime ExpiresAtUtc,
    AuthenticatedUserDto User);

public sealed record AuthenticatedUserDto(
    int MemberId,
    string Email,
    string FirstName,
    string LastName,
    string Tier);
