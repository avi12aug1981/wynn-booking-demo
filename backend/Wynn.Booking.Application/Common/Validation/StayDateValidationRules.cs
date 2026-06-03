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

    /// <summary>
    /// When both stay dates are supplied, apply the same rules as required endpoints.
    /// Omit both to skip pricing validation (room catalog only).
    /// </summary>
    public static void ApplyOptionalStayDates<T>(
        AbstractValidator<T> validator,
        Expression<Func<T, string?>> checkInSelector,
        Expression<Func<T, string?>> checkOutSelector)
    {
        var resolveCheckIn = checkInSelector.Compile();
        var resolveCheckOut = checkOutSelector.Compile();

        validator.RuleFor(x => x)
            .Must(request =>
            {
                var hasCheckIn = !string.IsNullOrWhiteSpace(resolveCheckIn(request));
                var hasCheckOut = !string.IsNullOrWhiteSpace(resolveCheckOut(request));
                return hasCheckIn == hasCheckOut;
            })
            .WithMessage(ApplicationMessages.Validation.ValidStayDates);

        validator.When(
            request =>
                !string.IsNullOrWhiteSpace(resolveCheckIn(request))
                && !string.IsNullOrWhiteSpace(resolveCheckOut(request)),
            () =>
            {
                validator.RuleFor(checkInSelector)
                    .Must(value => !string.IsNullOrWhiteSpace(value) && ValidationRules.IsValidDateOnly(value))
                    .WithMessage(ApplicationMessages.Validation.ValidCheckInDate);

                validator.RuleFor(checkInSelector)
                    .Must(value => !string.IsNullOrWhiteSpace(value) && ValidationRules.IsTodayOrFutureDateOnly(value))
                    .WithMessage(ApplicationMessages.Validation.CheckInCannotBePast);

                validator.RuleFor(checkOutSelector)
                    .Must(value => !string.IsNullOrWhiteSpace(value) && ValidationRules.IsValidDateOnly(value))
                    .WithMessage(ApplicationMessages.Validation.ValidCheckOutDate);

                validator.RuleFor(checkOutSelector)
                    .Must(value => !string.IsNullOrWhiteSpace(value) && ValidationRules.IsTodayOrFutureDateOnly(value))
                    .WithMessage(ApplicationMessages.Validation.CheckOutCannotBePast);

                validator.RuleFor(x => x)
                    .Must(request =>
                    {
                        var checkIn = DateHelpers.ParseDateOnly(resolveCheckIn(request)!);
                        var checkOut = DateHelpers.ParseDateOnly(resolveCheckOut(request)!);
                        return checkIn is not null && checkOut is not null && checkOut > checkIn;
                    })
                    .WithMessage(ApplicationMessages.Validation.CheckOutAfterCheckIn);
            });
    }
}
