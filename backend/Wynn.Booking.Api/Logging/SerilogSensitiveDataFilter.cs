using Serilog.Core;
using Serilog.Events;

namespace Wynn.Booking.Api.Logging;

/// <summary>
/// Drops log events that carry bearer tokens, passwords, or API keys in known property names.
/// </summary>
public sealed class SerilogSensitiveDataFilter : ILogEventFilter
{
    private static readonly HashSet<string> SensitivePropertyNames = new(StringComparer.OrdinalIgnoreCase)
    {
        "Authorization",
        "accessToken",
        "AccessToken",
        "Password",
        "password",
        "Secret",
        "SecretKey",
        "ApiKey",
        "InternalApiKey",
        "PasswordHash",
    };

    public bool IsEnabled(LogEvent logEvent)
    {
        foreach (var property in logEvent.Properties.Keys)
        {
            if (SensitivePropertyNames.Contains(property))
            {
                return false;
            }
        }

        var rendered = logEvent.RenderMessage();

        if (rendered.Contains("Bearer eyJ", StringComparison.OrdinalIgnoreCase)
            || rendered.Contains("accessToken", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return true;
    }
}
