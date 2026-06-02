using System.Text.Json;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Api.Extensions;
using Wynn.Booking.Domain.Exceptions;

namespace Wynn.Booking.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.GetTraceId();

        var (statusCode, message, errors) = exception switch
        {
            ValidationException validation => (
                validation.StatusCode,
                validation.Message,
                validation.Errors as IReadOnlyList<string>),
            DomainException domain => (domain.StatusCode, domain.Message, null),
            _ => (500, "An unexpected error occurred. Please try again later.", null),
        };

        if (statusCode >= 500)
        {
            logger.LogError(exception, "Unhandled exception. TraceId={TraceId}", traceId);
        }
        else
        {
            logger.LogWarning(exception, "Handled domain exception. TraceId={TraceId}", traceId);
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var payload = ApiResponse<object>.Fail(message, errors, traceId);

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            }));
    }
}
