using MediatR;
using Wynn.Booking.Application.Auth.Dtos;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Features.Auth.Login;

public sealed record LoginCommand(string Email, string Password)
    : IRequest<ServiceResult<LoginResponseDto>>;
