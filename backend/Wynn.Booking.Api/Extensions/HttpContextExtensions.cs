namespace Wynn.Booking.Api.Extensions;

public static class HttpContextExtensions
{
    public const string CorrelationHeaderName = "X-Correlation-Id";

    public static string GetTraceId(this HttpContext context)
    {
        if (context.Request.Headers.TryGetValue(CorrelationHeaderName, out var header) &&
            !string.IsNullOrWhiteSpace(header))
        {
            return header.ToString();
        }

        return context.TraceIdentifier;
    }
}
