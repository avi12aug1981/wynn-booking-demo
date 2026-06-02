using MediatR;
using Wynn.Booking.Application.Auth;
using Wynn.Booking.Application.Auth.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Auth.Login;

public sealed class LoginCommandHandler(IAuthService authService)
    : IRequestHandler<LoginCommand, ServiceResult<LoginResponseDto>>
{
    public Task<ServiceResult<LoginResponseDto>> Handle(
        LoginCommand request,
        CancellationToken cancellationToken) =>
        authService.LoginAsync(
            new LoginRequestDto(request.Email, request.Password),
            cancellationToken);
}
