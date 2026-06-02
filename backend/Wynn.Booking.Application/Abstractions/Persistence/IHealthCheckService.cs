namespace Wynn.Booking.Application.Abstractions.Persistence;

public interface IHealthCheckService
{
    Task<bool> CanConnectToDatabaseAsync(CancellationToken cancellationToken = default);
}
