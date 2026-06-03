using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Wynn.Booking.Api.Http;
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
            JsonException json => (
                StatusCodes.Status400BadRequest,
                ApplicationMessages.Common.InvalidJsonBody,
                new[] { json.Message } as IReadOnlyList<string>),
            BadHttpRequestException badRequest => (
                StatusCodes.Status400BadRequest,
                ApplicationMessages.Common.InvalidRequestBody,
                new[] { badRequest.Message } as IReadOnlyList<string>),
            _ => (500, ApplicationMessages.Common.UnexpectedError, null),
        };

        if (statusCode >= 500)
        {
            logger.LogError(exception, "Unhandled exception: {ExceptionMessage}", message);
        }
        else if (exception is ValidationException validationException &&
                 validationException.Errors.Count > 0)
        {
            logger.LogWarning(
                exception,
                "Validation failed ({StatusCode}): {ValidationErrors}",
                statusCode,
                string.Join("; ", validationException.Errors));
        }
        else
        {
            logger.LogWarning(
                exception,
                "Handled domain exception ({StatusCode}): {ExceptionMessage}",
                statusCode,
                message);
        }

        await ApiErrorResponses.WriteAsync(context, statusCode, message, errors);
    }
}
