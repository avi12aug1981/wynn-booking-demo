using MimeKit;

namespace Wynn.Booking.Infrastructure.Services;

internal static class EmailAddressParser
{
    /// <summary>
    /// Parses RFC5322 forms ("Display Name &lt;user@domain.com&gt;") or a bare addr-spec.
    /// </summary>
    public static MailboxAddress ParseRequired(string value, string fieldName)
    {
        var trimmed = value.Trim();

        if (string.IsNullOrWhiteSpace(trimmed))
        {
            throw new FormatException($"{fieldName} is empty.");
        }

        try
        {
            return MailboxAddress.Parse(trimmed);
        }
        catch (ParseException ex)
        {
            throw new FormatException(
                $"{fieldName} is not a valid email address: \"{trimmed}\".",
                ex);
        }
    }
}
