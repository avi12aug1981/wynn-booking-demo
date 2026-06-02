using MediatR;
using Microsoft.AspNetCore.Mvc;
using Wynn.Booking.Application.Features.BookingSessions.CreateBookingSession;
using Wynn.Booking.Application.Features.BookingSessions.GetBookingSession;

namespace Wynn.Booking.Api.Controllers;

[Route("api/booking-sessions")]
public sealed class BookingSessionsController(ISender sender) : ApiControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateBookingSessionCommand command,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return FromServiceResult(result);
    }

    [HttpGet("{token}")]
    public async Task<IActionResult> GetByToken(string token, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetBookingSessionQuery(token), cancellationToken);
        return FromServiceResult(result);
    }
}
