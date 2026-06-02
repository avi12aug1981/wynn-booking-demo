using MediatR;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Health;

public sealed record GetApiHealthQuery : IRequest<ServiceResult<ApiHealthDto>>;

public sealed record ApiHealthDto(string Status, string Database, DateTime Timestamp);
