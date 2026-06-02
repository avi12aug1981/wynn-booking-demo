using Wynn.Booking.Application.Auth.Dtos;

namespace Wynn.Booking.Application.Auth;

public interface IDemoMemberCredentialStore
{
    AuthenticatedUserDto? ValidateCredentials(string email, string password);
}
