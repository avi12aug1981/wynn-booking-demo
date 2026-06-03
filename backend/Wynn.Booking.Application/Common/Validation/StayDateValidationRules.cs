using System.Linq.Expressions;
using FluentValidation;
using Wynn.Booking.Application.Common;

namespace Wynn.Booking.Application.Common.Validation;

public static class StayDateValidationRules
{
    public const string CheckInPastMessage = ApplicationMessages.Validation.CheckInCannotBePast;
    public const string CheckOutAfterCheckInMessage =
        ApplicationMessages.Validation.CheckOutAfterCheckIn;

    public static void ApplyRequiredStayDates<T>(
        AbstractValidator<T> validator,
        Expression<Func<T, string>> checkInSelector,
        Expression<Func<T, string>> checkOutSelector)
    {
        var resolveCheckIn = checkInSelector.Compile();
        var resolveCheckOut = checkOutSelector.Compile();

        validator.RuleFor(checkInSelector)
            .Must(ValidationRules.IsValidDateOnly)
            .WithMessage(ApplicationMessages.Validation.ValidCheckInDate);

        validator.RuleFor(checkInSelector)
            .Must(ValidationRules.IsTodayOrFutureDateOnly)
            .WithMessage(ApplicationMessages.Validation.CheckInCannotBePast);

        validator.RuleFor(checkOutSelector)
            .Must(ValidationRules.IsValidDateOnly)
            .WithMessage(ApplicationMessages.Validation.ValidCheckOutDate);

        validator.RuleFor(checkOutSelector)
            .Must(ValidationRules.IsTodayOrFutureDateOnly)
            .WithMessage(ApplicationMessages.Validation.CheckOutCannotBePast);

        validator.RuleFor(x => x)
            .Must(request =>
            {
                var checkIn = DateHelpers.ParseDateOnly(resolveCheckIn(request));
                var checkOut = DateHelpers.ParseDateOnly(resolveCheckOut(request));
                return checkIn is not null && checkOut is not null && checkOut > checkIn;
            })
            .WithMessage(ApplicationMessages.Validation.CheckOutAfterCheckIn);
    }
}
