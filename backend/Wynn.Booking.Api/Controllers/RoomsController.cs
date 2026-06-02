using MediatR;
using Microsoft.AspNetCore.Mvc;
using Wynn.Booking.Application.Features.Rooms.CheckAvailability;
using Wynn.Booking.Application.Features.Rooms.SearchRooms;

namespace Wynn.Booking.Api.Controllers;

public sealed class RoomsController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string checkInDate,
        [FromQuery] string checkOutDate,
        [FromQuery] int guestCount,
        [FromQuery] bool petsAllowed = false,
        [FromQuery] bool nonSmoking = false,
        [FromQuery] decimal? minRating = null,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(
            new SearchRoomsQuery(checkInDate, checkOutDate, guestCount, petsAllowed, nonSmoking, minRating),
            cancellationToken);

        return FromServiceResult(result);
    }

    [HttpGet("{id:int}/availability")]
    public async Task<IActionResult> CheckAvailability(
        int id,
        [FromQuery] string checkInDate,
        [FromQuery] string checkOutDate,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(
            new CheckRoomAvailabilityQuery(id, checkInDate, checkOutDate),
            cancellationToken);

        return FromServiceResult(result);
    }
}
