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
        var dateValidation = DateHelpers.ValidateStayDateRange(
            request.CheckInDate,
            request.CheckOutDate);

        if (!dateValidation.IsValid)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(
                dateValidation.ErrorMessage!,
                400);
        }

        var checkIn = DateHelpers.ParseDateOnly(request.CheckInDate)!.Value;
        var checkOut = DateHelpers.ParseDateOnly(request.CheckOutDate)!.Value;

        var childCount = request.ChildCount ?? 0;
        var infantCount = request.InfantCount ?? 0;
        var petCount = request.PetCount ?? 0;
        var totalGuestCount = request.AdultCount + childCount + infantCount;

        var room = await roomRepository.GetByIdAsync(request.RoomId, cancellationToken);

        if (room is null || !room.IsActive || room.Status != RoomStatus.Available)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(
                ApplicationMessages.Booking.SelectedRoomNotAvailable,
                404);
        }

        if (totalGuestCount > room.MaxGuests)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(
                ApplicationMessages.Booking.GuestCountExceedsCapacity,
                400);
        }

        if (!room.PetsAllowed && petCount > 0)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(
                ApplicationMessages.Booking.PetsNotAllowed,
                400);
        }

        if (room.PetsAllowed && petCount > 2)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(
                ApplicationMessages.Booking.MaxPetsExceeded,
                400);
        }

        if (string.IsNullOrWhiteSpace(request.BookingSessionToken))
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(
                ApplicationMessages.Validation.BookingSessionTokenRequired,
                400);
        }

        var session = await bookingSessionRepository.GetByTokenWithRoomAsync(
            request.BookingSessionToken,
            cancellationToken);

        if (session is null || session.Status != BookingSessionStatus.Active)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(
                ApplicationMessages.Booking.SessionInvalidOrExpired,
                409);
        }

        if (session.ExpiresAt <= DateTime.UtcNow)
        {
            await bookingSessionRepository.ExpireAsync(session.Id, cancellationToken);
            return ServiceResult<CreateBookingResponseDto>.Fail(
                ApplicationMessages.Booking.SessionInvalidOrExpired,
                409);
        }

        if (session.RoomId != room.Id ||
            session.GuestCount != totalGuestCount ||
            session.CheckInDate != checkIn ||
            session.CheckOutDate != checkOut)
        {
            return ServiceResult<CreateBookingResponseDto>.Fail(
                ApplicationMessages.Booking.SessionMismatch,
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
                availability.Data?.Message ?? ApplicationMessages.Booking.RoomNotAvailable,
                409);
        }

        var numberOfNights = DateHelpers.CalculateNumberOfNights(checkIn, checkOut);
        var pricePerNight = room.PricePerNight;
        const decimal discountAmount = 0m;
        var taxAmount = decimal.Round(pricePerNight * numberOfNights * BookingConstants.TaxRate, 2);
        var totalPrice = decimal.Round(pricePerNight * numberOfNights - discountAmount + taxAmount, 2);
        var now = DateTime.UtcNow;

        int? memberId = null;
        var bookingType = request.BookingType;

        if (request.BookingType == BookingType.Member)
        {
            memberId = request.MemberId ?? currentUser.MemberId;

            if (!memberId.HasValue)
            {
                return ServiceResult<CreateBookingResponseDto>.Fail(
                    ApplicationMessages.Authorization.AuthenticationRequiredSignInAgain,
                    401);
            }

            var memberContactError = ValidateMemberContactMatchesAccount(request);
            if (memberContactError is not null)
            {
                return ServiceResult<CreateBookingResponseDto>.Fail(memberContactError, 400);
            }
        }

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
                var bookingForEmail = await bookingRepository.FindDetailsByReferenceNumberAsync(
                    created.ReferenceNumber,
                    cancellationToken);

                if (bookingForEmail is not null)
                {
                    await confirmationNotifier.NotifyAsync(bookingForEmail, cancellationToken);
                    await bookingRepository.MarkConfirmationEmailSentAsync(
                        created.Id,
                        cancellationToken);
                    confirmationEmailSent = true;
                }
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
            return ServiceResult<MemberBookingsResponseDto>.Fail(
                ApplicationMessages.Authorization.AuthenticationRequired,
                401);
        }

        var bookings = (await bookingRepository.FindByMemberIdAsync(
                currentUser.MemberId.Value,
                cancellationToken))
            .Where(booking => BookingAuthorization.ShouldAppearInMemberHistory(booking, currentUser))
            .ToList();

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
            return ServiceResult<object>.Fail(ApplicationMessages.Booking.NotFound, 404);
        }

        var viewDenied = BookingAuthorization.GetViewDeniedMessage(booking, currentUser);
        if (viewDenied is not null)
        {
            var statusCode =
                viewDenied == ApplicationMessages.Authorization.AuthenticationRequired
                    ? 401
                    : 403;

            return ServiceResult<object>.Fail(viewDenied, statusCode);
        }

        return ServiceResult<object>.Ok(MapBookingDetails(booking));
    }

    public async Task<ServiceResult<object>> GetByReferenceForManageAsync(
        string referenceNumber,
        CancellationToken cancellationToken = default)
    {
        var booking = await bookingRepository.FindDetailsByReferenceNumberAsync(
            referenceNumber,
            cancellationToken);

        if (booking is null)
        {
            return ServiceResult<object>.Fail(ApplicationMessages.Booking.NotFound, 404);
        }

        var manageDenied = BookingAuthorization.GetManageViewDeniedMessage(booking, currentUser);
        if (manageDenied is not null)
        {
            var statusCode =
                manageDenied == ApplicationMessages.Authorization.AuthenticationRequired
                    ? 401
                    : 403;

            return ServiceResult<object>.Fail(manageDenied, statusCode);
        }

        return ServiceResult<object>.Ok(MapBookingDetails(booking));
    }

    private static object MapBookingDetails(BookingEntity booking) =>
        new
        {
            booking.ReferenceNumber,
            booking.RoomId,
            roomName = booking.Room.Name,
            booking.FirstName,
            booking.LastName,
            booking.ContactEmail,
            booking.AddressLine1,
            booking.AddressLine2,
            booking.City,
            booking.State,
            booking.ZipCode,
            booking.Country,
            booking.AdultCount,
            booking.ChildCount,
            booking.InfantCount,
            booking.PetCount,
            booking.CheckInDate,
            booking.CheckOutDate,
            booking.NumberOfNights,
            booking.PricePerNight,
            booking.DiscountAmount,
            booking.TaxAmount,
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
        };

    public async Task<ServiceResult<CancelBookingResponseDto>> CancelAsync(
        string referenceNumber,
        CancelBookingRequestDto? request,
        CancellationToken cancellationToken = default)
    {
        var existing = await bookingRepository.FindByReferenceNumberAsync(referenceNumber, cancellationToken);

        if (existing is null)
        {
            return ServiceResult<CancelBookingResponseDto>.Fail(
                ApplicationMessages.Booking.NotFound,
                404);
        }

        var accessDenied = BookingAuthorization.GetAccessDeniedMessage(existing, currentUser);
        if (accessDenied is not null)
        {
            return ServiceResult<CancelBookingResponseDto>.Fail(accessDenied, 403);
        }

        if (existing.Status == BookingStatus.Cancelled)
        {
            return ServiceResult<CancelBookingResponseDto>.Fail(
                ApplicationMessages.Booking.AlreadyCancelled,
                400);
        }

        if (existing.CheckInDate.Date <= DateTime.UtcNow.Date)
        {
            return ServiceResult<CancelBookingResponseDto>.Fail(
                ApplicationMessages.Booking.CannotCancelOnOrAfterCheckIn,
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
                ApplicationMessages.Booking.Cancelled,
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
            return ServiceResult<ModifyBookingResponseDto>.Fail(
                ApplicationMessages.Booking.NotFound,
                404);
        }

        var accessDenied = BookingAuthorization.GetAccessDeniedMessage(booking, currentUser);
        if (accessDenied is not null)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail(accessDenied, 403);
        }

        if (booking.Status != BookingStatus.Confirmed)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail(
                ApplicationMessages.Booking.OnlyConfirmedCanBeModified,
                400);
        }

        if (booking.CheckInDate.Date < DateTime.UtcNow.Date)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail(
                ApplicationMessages.Booking.CannotModifyAfterCheckInPassed,
                400);
        }

        DateTime checkIn;
        DateTime checkOut;

        if (request.CheckInDate is not null)
        {
            var parsed = DateHelpers.ParseDateOnly(request.CheckInDate);
            if (parsed is null)
            {
                return ServiceResult<ModifyBookingResponseDto>.Fail(
                    ApplicationMessages.Booking.InvalidCheckInDate,
                    400);
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
                return ServiceResult<ModifyBookingResponseDto>.Fail(
                    ApplicationMessages.Booking.InvalidCheckOutDate,
                    400);
            }

            checkOut = parsed.Value;
        }
        else
        {
            checkOut = booking.CheckOutDate;
        }

        var stayDateValidation = DateHelpers.ValidateStayDateRange(
            checkIn.ToString("yyyy-MM-dd"),
            checkOut.ToString("yyyy-MM-dd"));

        if (!stayDateValidation.IsValid)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail(
                stayDateValidation.ErrorMessage!,
                400);
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
                ApplicationMessages.Booking.GuestCountExceedsCapacity,
                400);
        }

        if (!room.PetsAllowed && petCount > 0)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail(
                ApplicationMessages.Booking.PetsNotAllowed,
                400);
        }

        if (room.PetsAllowed && petCount > 2)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail(
                ApplicationMessages.Booking.MaxPetsExceeded,
                400);
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

        if (booking.BookingType != BookingType.Member &&
            !string.IsNullOrWhiteSpace(request.ContactEmail))
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
                    ApplicationMessages.Booking.Updated));
        }
        catch (ConflictException conflict)
        {
            return ServiceResult<ModifyBookingResponseDto>.Fail(conflict.Message, conflict.StatusCode);
        }
    }

    private string? ValidateMemberContactMatchesAccount(CreateBookingRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(currentUser.Email) ||
            !string.Equals(
                request.ContactEmail.Trim(),
                currentUser.Email,
                StringComparison.OrdinalIgnoreCase))
        {
            return ApplicationMessages.Booking.MemberContactMustMatchAccount;
        }

        if (string.IsNullOrWhiteSpace(currentUser.FirstName) ||
            string.IsNullOrWhiteSpace(currentUser.LastName))
        {
            return ApplicationMessages.Booking.MemberContactMustMatchAccount;
        }

        if (!string.Equals(request.FirstName.Trim(), currentUser.FirstName, StringComparison.OrdinalIgnoreCase) ||
            !string.Equals(request.LastName.Trim(), currentUser.LastName, StringComparison.OrdinalIgnoreCase))
        {
            return ApplicationMessages.Booking.MemberContactMustMatchAccount;
        }

        return null;
    }

}
