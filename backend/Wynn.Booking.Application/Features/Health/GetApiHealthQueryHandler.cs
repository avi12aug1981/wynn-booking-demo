using MediatR;
using Wynn.Booking.Application.Abstractions.Persistence;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Health;

public sealed class GetApiHealthQueryHandler(IHealthCheckService healthCheckService)
    : IRequestHandler<GetApiHealthQuery, ServiceResult<ApiHealthDto>>
{
    public async Task<ServiceResult<ApiHealthDto>> Handle(
        GetApiHealthQuery request,
        CancellationToken cancellationToken)
    {
        var canConnect = await healthCheckService.CanConnectToDatabaseAsync(cancellationToken);

        if (!canConnect)
        {
            return ServiceResult<ApiHealthDto>.Fail(
                ApplicationMessages.Health.DatabaseUnavailable,
                503);
        }

        return ServiceResult<ApiHealthDto>.Ok(
            new ApiHealthDto("Healthy", "Connected", DateTime.UtcNow));
    }
}
