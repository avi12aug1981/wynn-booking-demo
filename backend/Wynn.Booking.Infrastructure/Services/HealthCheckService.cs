using Microsoft.EntityFrameworkCore;
using Wynn.Booking.Application.Abstractions.Persistence;
using Wynn.Booking.Infrastructure.Persistence;

namespace Wynn.Booking.Infrastructure.Services;

public sealed class HealthCheckService(BookingDbContext dbContext) : IHealthCheckService
{
    public Task<bool> CanConnectToDatabaseAsync(CancellationToken cancellationToken = default) =>
        dbContext.Database.CanConnectAsync(cancellationToken);
}
