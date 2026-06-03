using Wynn.Booking.Application.Abstractions.Auth;
using Wynn.Booking.Application.Auth.Dtos;
using Wynn.Booking.Application.Common;
namespace Wynn.Booking.Application.Auth;

public sealed class AuthService(
    IMemberCredentialStore credentialStore,
    IJwtTokenGenerator jwtTokenGenerator) : IAuthService
{
    public async Task<ServiceResult<LoginResponseDto>> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var user = await credentialStore.ValidateCredentialsAsync(
            request.Email.Trim(),
            request.Password,
            cancellationToken);

        if (user is null)
        {
            return ServiceResult<LoginResponseDto>.Fail(
                ApplicationMessages.Auth.InvalidCredentials,
                401);
        }

        await credentialStore.RecordLoginAsync(user.MemberId, cancellationToken);

        var token = jwtTokenGenerator.GenerateToken(user);
        var response = new LoginResponseDto(
            token.AccessToken,
            token.ExpiresAtUtc,
            user);

        return ServiceResult<LoginResponseDto>.Ok(response);
    }
}
