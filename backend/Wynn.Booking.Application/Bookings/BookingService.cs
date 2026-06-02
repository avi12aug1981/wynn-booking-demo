using Wynn.Booking.Application.Abstractions.Notifications;
using Wynn.Booking.Application.BookingSessions;
using Wynn.Booking.Application.Bookings.Dtos;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Application.Rooms;
using Wynn.Booking.Domain.Entities;
using Wynn.Booking.Domain.Enums;
using Microsoft.Extensions.Logging;
using Wynn.Booking.Domain.Exceptions;
using BookingEntity = Wynn.Booking.Domain.Entities.Booking;

namespace Wynn.Booking.Application.Bookings;

public sealed class BookingService(
    IBookingRepository bookingRepository,
    IBookingSessionRepository bookingSessionRepository,
    IRoomRepository roomRepository,
    IRoomSearchService roomSearchService,
    IReservationConfirmationNotifier confirmationNotifier,
    ICurrentUserContext currentUser,
    ILogger<BookingService> logger) : IBookingService
{
    public async Task<ServiceResult<CreateBookingResponseDto>> CreateAsync(
        CreateBookingRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var checkIn = DateHelpers.ParseDateOnly(request.CheckInDate)!.Value;
        var checkOut = DateHelpers.ParseDateOnly(request.CheckOutDate)!.Value;

        var childCount = request.ChildCount ?? 0;
        var infantCount = request.InfantCount ?? 0;
        var petCount = request.PetCount ?? 0;
        var totalGuestCount = request.AdultCount + childCount + infantCount;

        var room = await roomRepository.GetByIdAsync(request.RoomId, cancellationToken);

        if (room is null || !room.IsActive || room.Status != RoomStatus.Available)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail("Selected room is not available.", 404);
        }

        if (totalGuestCount > room.MaxGuests)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail("Guest count exceeds room capacity.", 400);
        }

        if (!room.PetsAllowed && petCount > 0)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail("Pets are not allowed in this room.", 400);
        }

        if (room.PetsAllowed && petCount > 2)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail("Maximum of 2 pets allowed.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.BookingSessionToken))
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(
                "Booking session token is required. Start checkout via POST /api/booking-sessions.",
                400);
        }

        var session = await bookingSessionRepository.GetByTokenWithRoomAsync(
            request.BookingSessionToken,
            cancellationToken);

        if (session is null || session.Status != BookingSessionStatus.Active)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(
                "Booking session is invalid or has expired.",
                409);
        }

        if (session.ExpiresAt <= DateTime.UtcNow)
        {
            await bookingSessionRepository.ExpireAsync(session.Id, cancellationToken);
            return ServiceResult<CreateBookingResponseDto>.Fail(
                "Booking session is invalid or has expired.",
                409);
        }

        if (session.RoomId != room.Id ||
            session.GuestCount != totalGuestCount ||
            session.CheckInDate != checkIn ||
            session.CheckOutDate != checkOut)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(
                "Booking session does not match the reservation details.",
                400);
        }

        var bookingSessionId = session.Id;

        var availability = await roomSearchService.CheckAvailabilityAsync(
            room.Id,
            request.CheckInDate,
            request.CheckOutDate,
            cancellationToken);

        if (availability.Data is not { Available: true })
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(
                availability.Data?.Message ?? "Room is not available.",
                409);
        }

        var numberOfNights = DateHelpers.CalculateNumberOfNights(checkIn, checkOut);
        var pricePerNight = room.PricePerNight;
        const decimal discountAmount = 0m;
        var taxAmount = decimal.Round(pricePerNight * numberOfNights * BookingConstants.TaxRate, 2);
        var totalPrice = decimal.Round(pricePerNight * numberOfNights - discountAmount + taxAmount, 2);
        var now = DateTime.UtcNow;

        var memberId = request.MemberId ?? currentUser.MemberId;
        var bookingType = memberId.HasValue ? BookingType.Member : request.BookingType;

        var booking = new BookingEntity
        {
            ReferenceNumber = ReferenceGenerator.GenerateBookingReference(),
            RoomId = room.Id,
            BookingSessionId = bookingSessionId,
            MemberId = memberId,
            BookingType = bookingType,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Gender = request.Gender,
            ContactEmail = request.ContactEmail.Trim(),
            AdultCount = request.AdultCount,
            ChildCount = childCount,
            InfantCount = infantCount,
            PetCount = petCount,
            CheckInDate = checkIn,
            CheckOutDate = checkOut,
            SpecialRequests = request.SpecialRequests?.Trim(),
            AddressLine1 = request.AddressLine1.Trim(),
            AddressLine2 = request.AddressLine2?.Trim(),
            City = request.City.Trim(),
            State = request.State.Trim(),
            ZipCode = request.ZipCode.Trim(),
            Country = request.Country ?? BookingConstants.DefaultCountry,
            PricePerNight = pricePerNight,
            NumberOfNights = numberOfNights,
            DiscountAmount = discountAmount,
            TaxAmount = taxAmount,
            TotalPrice = totalPrice,
            PaymentStatus = PaymentStatus.Paid,
            PaymentTransactionId = ReferenceGenerator.GeneratePaymentTransactionId(),
            Status = BookingStatus.Confirmed,
            ConfirmationEmailSent = false,
            BookingSource = BookingConstants.BookingSource,
            CreatedAt = now,
            UpdatedAt = now,
            Guests = request.Guests?.Select(guest => new BookingGuest
            {
                Sequence = guest.Sequence,
                FirstName = guest.FirstName.Trim(),
                LastName = guest.LastName.Trim(),
                Gender = guest.Gender,
                AgeGroup = guest.AgeGroup,
                CreatedAt = now,
                UpdatedAt = now,
            }).ToList() ?? [],
        };

        try
        {
            var created = await bookingRepository.CreateBookingAsync(
                booking,
                bookingSessionId,
                cancellationToken);

            var confirmationEmailSent = false;
            try
            {
                await confirmationNotifier.NotifyAsync(created, cancellationToken);
                confirmationEmailSent = true;
            }
            catch (Exception ex)
            {
                logger.LogWarning(
                    ex,
                    "Confirmation notification failed for {ReferenceNumber}",
                    created.ReferenceNumber);
            }

            return ServiceResult<CreateBookingResponseDto>.Ok(
                new CreateBookingResponseDto(
                    created.ReferenceNumber,
                    room.Name,
                    created.CheckInDate,
                    created.CheckOutDate,
                    created.NumberOfNights,
                    created.TotalPrice,
                    created.PaymentStatus,
                    created.Status,
                    confirmationEmailSent),
                201);
        }
        catch (ConflictException conflict)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(conflict.Message, conflict.StatusCode);
        }
    }

    public async Task<ServiceResult<MemberBookingsResponseDto>> ListByCurrentMemberAsync(
        CancellationToken cancellationToken = default)
    {
        if (!currentUser.IsAuthenticated || !currentUser.MemberId.HasValue)
        {
            return ServiceResult<MemberBookingsResponseDto>.Fail("Authentication is required.", 401);
        }

        var bookings = await bookingRepository.FindByMemberIdAsync(
            currentUser.MemberId.Value,
            cancellationToken);

        var summaries = bookings.Select(booking => new MemberBookingSummaryDto(
            booking.ReferenceNumber,
            booking.Room.Name,
            booking.CheckInDate,
            booking.CheckOutDate,
            booking.AdultCount,
            booking.ChildCount,
            booking.InfantCount,
            booking.Status,
            booking.TotalPrice)).ToList();

        return ServiceResult<MemberBookingsResponseDto>.Ok(
            new MemberBookingsResponseDto(summaries));
    }

    public async Task<ServiceResult<object>> GetByReferenceNumberAsync(
        string referenceNumber,
        CancellationToken cancellationToken = default)
    {
        var booking = await bookingRepository.FindDetailsByReferenceNumberAsync(
            referenceNumber,
            cancellationToken);

        if (booking is null)
        {
            return ServiceResult<object>.Fail("Booking not found.", 404);
        }

        return ServiceResult<object>.Ok(new
        {
            booking.ReferenceNumber,
            booking.RoomId,
            roomName = booking.Room.Name,
            booking.FirstName,
            booking.LastName,
            booking.ContactEmail,
            booking.AdultCount,
            booking.ChildCount,
            booking.InfantCount,
            booking.CheckInDate,
            booking.CheckOutDate,
            booking.NumberOfNights,
            booking.TotalPrice,
            booking.Status,
            booking.PaymentStatus,
            booking.ConfirmationEmailSent,
            booking.SpecialRequests,
            guests = booking.Guests.OrderBy(g => g.Sequence).Select(g => new
            {
                g.Sequence,
                g.FirstName,
                g.LastName,
                g.AgeGroup,
            }),
        });
    }

    public async Task<ServiceResult<CancelBookingResponseDto>> CancelAsync(
        string referenceNumber,
        CancelBookingRequestDto? request,
        CancellationToken cancellationToken = default)
    {
        var existing = await bookingRepository.FindByReferenceNumberAsync(referenceNumber, cancellationToken);

        if (existing is null)
        {
            return ServiceResult<CancelBookingResponseDto>.Fail("Booking not found.", 404);
        }

        var accessDenied = BookingAuthorization.GetAccessDeniedMessage(existing, currentUser);
        if (accessDenied is not null)
        {
            return ServiceResult<CancelBookingResponseDto>.Fail(accessDenied, 403);
        }

        if (existing.Status == BookingStatus.Cancelled)
        {
            return ServiceResult<CancelBookingResponseDto>.Fail("Booking is already cancelled.", 400);
        }

        if (existing.CheckInDate.Date <= DateTime.UtcNow.Date)
        {
            return ServiceResult<CancelBookingResponseDto>.Fail(
                "Cannot cancel a reservation on or after the check-in date.",
                400);
        }

        var cancelled = await bookingRepository.CancelByReferenceNumberAsync(
            referenceNumber,
            request?.CancellationReason,
            cancellationToken);

        return ServiceResult<CancelBookingResponseDto>.Ok(
            new CancelBookingResponseDto(
                cancelled.ReferenceNumber,
                cancelled.Status,
                cancelled.PaymentStatus,
                "Booking has been cancelled.",
                cancelled.UpdatedAt));
    }

    public async Task<ServiceResult<ModifyBookingResponseDto>> ModifyAsync(
        string referenceNumber,
        ModifyBookingRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var booking = await bookingRepository.FindForUpdateByReferenceNumberAsync(
            referenceNumber,
            cancellationToken);

        if (booking is null)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail("Booking not found.", 404);
        }

        var accessDenied = BookingAuthorization.GetAccessDeniedMessage(booking, currentUser);
        if (accessDenied is not null)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail(accessDenied, 403);
        }

        if (booking.Status != BookingStatus.Confirmed)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail(
                "Only confirmed reservations can be modified.",
                400);
        }

        if (booking.CheckInDate.Date <= DateTime.UtcNow.Date)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail(
                "Cannot modify a reservation on or after the check-in date.",
                400);
        }

        DateTime checkIn;
        DateTime checkOut;

        if (request.CheckInDate is not null)
        {
            var parsed = DateHelpers.ParseDateOnly(request.CheckInDate);
            if (parsed is null)
            {
                return ServiceResult<ModifyBookingResponseDto>.Fail("Invalid check-in date.", 400);
            }

            checkIn = parsed.Value;
        }
        else
        {
            checkIn = booking.CheckInDate;
        }

        if (request.CheckOutDate is not null)
        {
            var parsed = DateHelpers.ParseDateOnly(request.CheckOutDate);
            if (parsed is null)
            {
                return ServiceResult<ModifyBookingResponseDto>.Fail("Invalid check-out date.", 400);
            }

            checkOut = parsed.Value;
        }
        else
        {
            checkOut = booking.CheckOutDate;
        }

        if (checkOut <= checkIn)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail("Check-out must be after check-in.", 400);
        }

        var adultCount = request.AdultCount ?? booking.AdultCount;
        var childCount = request.ChildCount ?? booking.ChildCount;
        var infantCount = request.InfantCount ?? booking.InfantCount;
        var petCount = request.PetCount ?? booking.PetCount;
        var totalGuests = adultCount + childCount + infantCount;
        var room = booking.Room;

        if (totalGuests > room.MaxGuests)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail(
                "Guest count exceeds room capacity.",
                400);
        }

        if (!room.PetsAllowed && petCount > 0)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail("Pets are not allowed in this room.", 400);
        }

        if (room.PetsAllowed && petCount > 2)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail("Maximum of 2 pets allowed.", 400);
        }

        booking.CheckInDate = checkIn;
        booking.CheckOutDate = checkOut;
        booking.AdultCount = adultCount;
        booking.ChildCount = childCount;
        booking.InfantCount = infantCount;
        booking.PetCount = petCount;

        if (request.SpecialRequests is not null)
        {
            booking.SpecialRequests = request.SpecialRequests.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.ContactEmail))
        {
            booking.ContactEmail = request.ContactEmail.Trim();
        }

        booking.NumberOfNights = DateHelpers.CalculateNumberOfNights(
            booking.CheckInDate,
            booking.CheckOutDate);
        booking.TaxAmount = decimal.Round(
            booking.PricePerNight * booking.NumberOfNights * BookingConstants.TaxRate,
            2);
        booking.TotalPrice = decimal.Round(
            booking.PricePerNight * booking.NumberOfNights - booking.DiscountAmount + booking.TaxAmount,
            2);

        try
        {
            var updated = await bookingRepository.ModifyBookingAsync(booking, cancellationToken);

            return ServiceResult<ModifyBookingResponseDto>.Ok(
                new ModifyBookingResponseDto(
                    updated.ReferenceNumber,
                    room.Name,
                    updated.CheckInDate,
                    updated.CheckOutDate,
                    updated.NumberOfNights,
                    updated.AdultCount,
                    updated.ChildCount,
                    updated.InfantCount,
                    updated.PetCount,
                    updated.TotalPrice,
                    updated.Status,
                    updated.PaymentStatus,
                    "Reservation has been updated."));
        }
        catch (ConflictException conflict)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail(conflict.Message, conflict.StatusCode);
        }
    }

}
