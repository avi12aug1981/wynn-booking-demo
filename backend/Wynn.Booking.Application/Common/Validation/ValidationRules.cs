using System.Text.RegularExpressions;

namespace Wynn.Booking.Application.Common.Validation;

public static partial class ValidationRules
{
    public static bool IsValidEmail(string value) =>
        EmailRegex().IsMatch(value.Trim());

    public static bool IsSafeText(string value) =>
        SafeTextRegex().IsMatch(value);

    public static bool IsValidDateOnly(string value) =>
        DateOnly.TryParse(value, out _);

    [GeneratedRegex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", RegexOptions.CultureInvariant)]
    private static partial Regex EmailRegex();

    [GeneratedRegex(@"^[a-zA-Z0-9\s.,'-]+$", RegexOptions.CultureInvariant)]
    private static partial Regex SafeTextRegex();
}
