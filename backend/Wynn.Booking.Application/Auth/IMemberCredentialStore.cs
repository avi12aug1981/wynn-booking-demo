using Wynn.Booking.Application.Auth.Dtos;

namespace Wynn.Booking.Application.Auth;

public interface IMemberCredentialStore
{
    Task<AuthenticatedUserDto?> ValidateCredentialsAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default);

    Task RecordLoginAsync(int memberId, CancellationToken cancellationToken = default);
}
