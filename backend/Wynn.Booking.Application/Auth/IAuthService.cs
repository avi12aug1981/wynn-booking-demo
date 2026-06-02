using Wynn.Booking.Application.Auth.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Auth;

public interface IAuthService
{
    Task<ServiceResult<LoginResponseDto>> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default);
}
