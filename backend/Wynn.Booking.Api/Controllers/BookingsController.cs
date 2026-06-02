using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Wynn.Booking.Application.Bookings.Dtos;
using Wynn.Booking.Application.Features.Bookings.CancelBooking;
using Wynn.Booking.Application.Features.Bookings.CreateBooking;
using Wynn.Booking.Application.Features.Bookings.GetBooking;
using Wynn.Booking.Application.Features.Bookings.GetMemberBookings;
using Wynn.Booking.Application.Features.Bookings.ModifyBooking;
using Wynn.Booking.Api.Authentication;

namespace Wynn.Booking.Api.Controllers;

public sealed class BookingsController(ISender sender) : ApiControllerBase
{
    [AllowAnonymous]
    [HttpPost]
    [EnableRateLimiting("booking-writes")]
    public async Task<IActionResult> Create(
        [FromBody] CreateBookingCommand command,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return FromServiceResult(result);
    }

    /// <summary>List reservations for the authenticated member.</summary>
    [Authorize(Roles = JwtClaimTypes.RoleMember)]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyBookings(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetMemberBookingsQuery(), cancellationToken);
        return FromServiceResult(result);
    }

    [AllowAnonymous]
    [HttpGet("{referenceNumber}")]
    public async Task<IActionResult> GetByReferenceNumber(
        string referenceNumber,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetBookingByReferenceQuery(referenceNumber), cancellationToken);
        return FromServiceResult(result);
    }

    /// <summary>Modify a confirmed reservation (dates, guests, contact, special requests).</summary>
    [Authorize(Roles = JwtClaimTypes.RoleMember)]
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
    [Authorize(Roles = JwtClaimTypes.RoleMember)]
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
