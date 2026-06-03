namespace Wynn.Booking.Api.Configuration;

public sealed class AuditLogOptions
{
    public const string SectionName = "AuditLog";

    /// <summary>Relative to API content root or absolute path.</summary>
    public string Path { get; set; } = "../../logs/wynn-booking-audit.jsonl";

    /// <summary>File (default) or Database — Database reserved for Serilog MSSqlServer sink.</summary>
    public string Sink { get; set; } = "File";
}
