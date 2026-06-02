using Wynn.Booking.Application.BookingSessions.Dtos;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Rooms;
using Wynn.Booking.Domain.Entities;
using Wynn.Booking.Domain.Enums;

namespace Wynn.Booking.Application.BookingSessions;

public sealed class BookingSessionService(
    IBookingSessionRepository bookingSessionRepository,
    IRoomRepository roomRepository,
    IRoomSearchService roomSearchService) : IBookingSessionService
{
    public async Task<ServiceResult<CreateBookingSessionResponseDto>> CreateAsync(
        CreateBookingSessionRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var checkIn = DateHelpers.ParseDateOnly(request.CheckInDate)!.Value;
        var checkOut = DateHelpers.ParseDateOnly(request.CheckOutDate)!.Value;

        var room = await roomRepository.GetByIdAsync(request.RoomId, cancellationToken);

        if (room is null || !room.IsActive || room.Status != RoomStatus.Available)
        {
            return ServiceResult<CreateBookingSessionResponseDto>.Fail(
                "Selected room is not available.",
                404);
        }

        if (request.GuestCount > room.MaxGuests)
        {
            return ServiceResult<CreateBookingSessionResponseDto>.Fail(
                "Guest count exceeds room capacity.",
                400);
        }

        var availability = await roomSearchService.CheckAvailabilityAsync(
            request.RoomId,
            request.CheckInDate,
            request.CheckOutDate,
            cancellationToken);

        if (availability.Data is not { Available: true })
        {
            var status = availability.Data?.Reason == "booked" ? 409 : 404;
            return ServiceResult<CreateBookingSessionResponseDto>.Fail(
                availability.Data?.Message ?? "Room is not available.",
                status);
        }

        var now = DateTime.UtcNow;
        var session = new BookingSession
        {
            Token = ReferenceGenerator.GenerateBookingSessionToken(),
            RoomId = request.RoomId,
            CheckInDate = checkIn,
            CheckOutDate = checkOut,
            GuestCount = request.GuestCount,
            Status = BookingSessionStatus.Active,
            ExpiresAt = now.AddMinutes(BookingConstants.BookingSessionTimeoutMinutes),
            CreatedAt = now,
            UpdatedAt = now,
        };

        await bookingSessionRepository.CreateAsync(session, cancellationToken);

        var nights = DateHelpers.CalculateNumberOfNights(checkIn, checkOut);

        return ServiceResult<CreateBookingSessionResponseDto>.Ok(
            new CreateBookingSessionResponseDto(
                session.Token,
                $"/booking/{session.Token}",
                nights),
            201);
    }

    public async Task<ServiceResult<BookingSessionDetailDto>> GetByTokenAsync(
        string token,
        CancellationToken cancellationToken = default)
    {
        var session = await bookingSessionRepository.GetByTokenWithRoomAsync(token, cancellationToken);

        if (session is null)
        {
            return ServiceResult<BookingSessionDetailDto>.Fail("Booking session not found.", 404);
        }

        if (session.Status != BookingSessionStatus.Active)
        {
            return ServiceResult<BookingSessionDetailDto>.Fail("Booking session is no longer active.", 400);
        }

        if (session.ExpiresAt < DateTime.UtcNow)
        {
            await bookingSessionRepository.ExpireAsync(session.Id, cancellationToken);
            return ServiceResult<BookingSessionDetailDto>.Fail("Booking session has expired.", 400);
        }

        return ServiceResult<BookingSessionDetailDto>.Ok(MapToDetail(session));
    }

    private static BookingSessionDetailDto MapToDetail(BookingSession session)
    {
        var room = session.Room;
        return new BookingSessionDetailDto(
            session.Id,
            session.Token,
            session.RoomId,
            session.CheckInDate.ToString("yyyy-MM-dd"),
            session.CheckOutDate.ToString("yyyy-MM-dd"),
            session.GuestCount,
            session.Status.ToString().ToUpperInvariant(),
            session.ExpiresAt.ToString("o"),
            new RoomSummaryDto(
                room.Id,
                room.Name,
                room.Type,
                room.PricePerNight,
                room.MaxGuests,
                room.Amenities.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
                room.ImageUrl));
    }
}
