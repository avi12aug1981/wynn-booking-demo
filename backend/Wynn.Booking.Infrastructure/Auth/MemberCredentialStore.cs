using Microsoft.EntityFrameworkCore;
using Wynn.Booking.Application.Auth;
using Wynn.Booking.Application.Auth.Dtos;
using Wynn.Booking.Domain.Enums;
using Wynn.Booking.Infrastructure.Persistence;

namespace Wynn.Booking.Infrastructure.Auth;

public sealed class MemberCredentialStore(BookingDbContext dbContext) : IMemberCredentialStore
{
    public async Task<AuthenticatedUserDto?> ValidateCredentialsAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim();
        var member = await dbContext.Members
            .AsNoTracking()
            .FirstOrDefaultAsync(
                m => m.Email.ToLower() == normalizedEmail.ToLower() &&
                     m.Status == MemberStatus.Active,
                cancellationToken);

        if (member is null ||
            !string.Equals(member.PasswordHash, password, StringComparison.Ordinal))
        {
            return null;
        }

        return new AuthenticatedUserDto(
            member.Id,
            member.Email,
            member.FirstName,
            member.LastName,
            member.Tier);
    }

    public async Task RecordLoginAsync(int memberId, CancellationToken cancellationToken = default)
    {
        var member = await dbContext.Members
            .FirstOrDefaultAsync(m => m.Id == memberId, cancellationToken);

        if (member is null)
        {
            return;
        }

        var now = DateTime.UtcNow;
        member.LastLoginAt = now;
        member.UpdatedAt = now;
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
