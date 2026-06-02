using Wynn.Booking.Application.Abstractions.Auth;
using Wynn.Booking.Application.Auth.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Auth;

public sealed class AuthService(
    IDemoMemberCredentialStore credentialStore,
    IJwtTokenGenerator jwtTokenGenerator) : IAuthService
{
    public Task<ServiceResult<LoginResponseDto>> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var user = credentialStore.ValidateCredentials(
            request.Email.Trim(),
            request.Password);

        if (user is null)
        {
            return Task.FromResult(
                ServiceResult<LoginResponseDto>.Fail("Invalid email or password.", 401));
        }

        var token = jwtTokenGenerator.GenerateToken(user);
        var response = new LoginResponseDto(
            token.AccessToken,
            token.ExpiresAtUtc,
            user);

        return Task.FromResult(ServiceResult<LoginResponseDto>.Ok(response));
    }
}
