using Wynn.Booking.Api.Extensions;

namespace Wynn.Booking.Api.Middleware;

public sealed class CorrelationIdMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[HttpContextExtensions.CorrelationHeaderName].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(correlationId))
        {
            correlationId = Guid.NewGuid().ToString("N");
        }

        context.Items[HttpContextExtensions.TraceIdItemKey] = correlationId;
        context.Response.Headers[HttpContextExtensions.CorrelationHeaderName] = correlationId;
        context.TraceIdentifier = correlationId;

        var clientOperation = context.Request.Headers[HttpContextExtensions.ClientOperationHeaderName]
            .FirstOrDefault();

        if (!string.IsNullOrWhiteSpace(clientOperation))
        {
            context.Items[HttpContextExtensions.ClientOperationItemKey] = clientOperation;
        }

        using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
        using (Serilog.Context.LogContext.PushProperty("TraceId", correlationId))
        using (Serilog.Context.LogContext.PushProperty(
            "Operation",
            string.IsNullOrWhiteSpace(clientOperation) ? null : clientOperation))
        {
            await next(context);
        }
    }
}
