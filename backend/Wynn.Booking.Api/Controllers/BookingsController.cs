using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Wynn.Booking.Application.Bookings.Dtos;
using Wynn.Booking.Application.Features.Bookings.CancelBooking;
using Wynn.Booking.Application.Features.Bookings.CreateBooking;
using Wynn.Booking.Application.Features.Bookings.GetBooking;
using Wynn.Booking.Application.Features.Bookings.ModifyBooking;

namespace Wynn.Booking.Api.Controllers;

public sealed class BookingsController(ISender sender) : ApiControllerBase
{
    [HttpPost]
    [EnableRateLimiting("booking-writes")]
    public async Task<IActionResult> Create(
        [FromBody] CreateBookingCommand command,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return FromServiceResult(result);
    }

    [HttpGet("{referenceNumber}")]
    public async Task<IActionResult> GetByReferenceNumber(
        string referenceNumber,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetBookingByReferenceQuery(referenceNumber), cancellationToken);
        return FromServiceResult(result);
    }

    /// <summary>Modify a confirmed reservation (dates, guests, contact, special requests).</summary>
    [HttpPatch("{referenceNumber}")]
    [EnableRateLimiting("booking-writes")]
    public async Task<IActionResult> Modify(
        string referenceNumber,
        [FromBody] ModifyBookingRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new ModifyBookingCommand(referenceNumber, request),
            cancellationToken);

        return FromServiceResult(result);
    }

    /// <summary>Cancel a confirmed reservation before check-in.</summary>
    [HttpPost("{referenceNumber}/cancel")]
    [EnableRateLimiting("booking-writes")]
    public async Task<IActionResult> Cancel(
        string referenceNumber,
        [FromBody] CancelBookingRequestDto? request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CancelBookingCommand(referenceNumber, request),
            cancellationToken);

        return FromServiceResult(result);
    }
}
