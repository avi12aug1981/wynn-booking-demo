using Microsoft.Extensions.Options;
using Wynn.Booking.Api.Configuration;
using Wynn.Booking.Application.Auth;
using Wynn.Booking.Application.Auth.Dtos;

namespace Wynn.Booking.Api.Authentication;

public sealed class DemoMemberCredentialStore(IOptions<DemoAuthOptions> options) : IDemoMemberCredentialStore
{
    public AuthenticatedUserDto? ValidateCredentials(string email, string password)
    {
        var account = options.Value.Members.FirstOrDefault(member =>
            string.Equals(member.Email, email, StringComparison.OrdinalIgnoreCase));

        if (account is null ||
            !string.Equals(account.Password, password, StringComparison.Ordinal))
        {
            return null;
        }

        return new AuthenticatedUserDto(
            account.MemberId,
            account.Email,
            account.FirstName,
            account.LastName,
            account.Tier);
    }
}
