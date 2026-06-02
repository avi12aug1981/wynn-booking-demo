using MediatR;
using Microsoft.AspNetCore.Mvc;
using Wynn.Booking.Application.Features.Health;

namespace Wynn.Booking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class HealthController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetApiHealthQuery(), cancellationToken);

        if (!result.Success)
        {
            return StatusCode(
                result.StatusCode,
                new
                {
                    success = false,
                    message = result.Message,
                    traceId = HttpContext.TraceIdentifier,
                });
        }

        return Ok(new
        {
            success = true,
            data = result.Data,
            traceId = HttpContext.TraceIdentifier,
        });
    }
}
