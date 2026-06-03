namespace Wynn.Booking.Infrastructure.Configuration;

public sealed class ReservationEmailOptions
{
    public const string SectionName = "ReservationEmail";

    public string ClientBaseUrl { get; init; } = "http://localhost:3000";

    public string? FromAddress { get; init; }

    public SmtpOptions Smtp { get; init; } = new();

    public bool IsSmtpConfigured()
    {
        var hasCredentials =
            !string.IsNullOrWhiteSpace(Smtp.User) &&
            !string.IsNullOrWhiteSpace(Smtp.Password);

        if (Smtp.IsGmail())
        {
            return hasCredentials;
        }

        return hasCredentials && !string.IsNullOrWhiteSpace(Smtp.Host);
    }

    public string ResolveFromAddress() =>
        string.IsNullOrWhiteSpace(FromAddress)
            ? Smtp.User?.Trim() ?? "reservations@wynn-booking-demo.local"
            : FromAddress.Trim();
}

public sealed class SmtpOptions
{
    public string? Service { get; init; }

    public string? Host { get; init; }

    public int Port { get; init; } = 587;

    public bool Secure { get; init; }

    public string? User { get; init; }

    public string? Password { get; init; }

    public bool IsGmail()
    {
        var service = Service?.Trim().ToLowerInvariant();
        var host = Host?.Trim().ToLowerInvariant();

        return service == "gmail" || host == "smtp.gmail.com";
    }

    public string ResolveHost() =>
        IsGmail() ? "smtp.gmail.com" : Host?.Trim() ?? string.Empty;
}
