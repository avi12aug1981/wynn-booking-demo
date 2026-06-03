namespace Wynn.Booking.Api.Extensions;

public static class HttpContextExtensions
{
    public const string CorrelationHeaderName = "X-Correlation-Id";

    public const string ClientOperationHeaderName = "X-Client-Operation";

    public const string TraceIdItemKey = "Wynn.ApiTraceId";

    public const string ClientOperationItemKey = "Wynn.ClientOperation";

    /// <summary>
    /// Returns the stable request trace id assigned by CorrelationIdMiddleware.
    /// Does not use <see cref="HttpContext.TraceIdentifier"/> alone because hosting/Activity
    /// can overwrite it later in the pipeline.
    /// </summary>
    public static string GetTraceId(this HttpContext context)
    {
        if (context.Items.TryGetValue(TraceIdItemKey, out var value) && value is string traceId)
        {
            return traceId;
        }

        return context.TraceIdentifier;
    }
}
