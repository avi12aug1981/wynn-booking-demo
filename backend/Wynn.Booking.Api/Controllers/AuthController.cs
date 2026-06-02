using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wynn.Booking.Application.Features.Auth.Login;

namespace Wynn.Booking.Api.Controllers;

[Route("api/auth")]
public sealed class AuthController(ISender sender) : ApiControllerBase
{
    /// <summary>Authenticate a demo member and receive a JWT access token.</summary>
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginCommand command,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return FromServiceResult(result);
    }
}
