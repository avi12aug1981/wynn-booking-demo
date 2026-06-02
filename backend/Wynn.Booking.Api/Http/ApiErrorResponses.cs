using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Api.Extensions;

namespace Wynn.Booking.Api.Http;

public static class ApiErrorResponses
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public static IActionResult FromModelState(ActionContext context)
    {
        var errors = CollectModelStateErrors(context);
        var message = errors.Count > 0
            ? "The request body is invalid or failed validation."
            : "The request body is invalid.";

        return new BadRequestObjectResult(
            ApiResponse<object>.Fail(message, errors, context.HttpContext.GetTraceId()));
    }

    public static async Task WriteAsync(
        HttpContext context,
        int statusCode,
        string message,
        IReadOnlyList<string>? errors = null)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var payload = ApiResponse<object>.Fail(message, errors, context.GetTraceId());

        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
    }

    public static IReadOnlyList<string> CollectModelStateErrors(ActionContext context) =>
        context.ModelState
            .Where(entry => entry.Value?.Errors.Count > 0)
            .SelectMany(entry => entry.Value!.Errors.Select(error => FormatModelError(entry.Key, error.ErrorMessage)))
            .Where(message => !string.IsNullOrWhiteSpace(message))
            .Distinct()
            .ToArray();

    private static string FormatModelError(string key, string errorMessage)
    {
        if (string.Equals(key, "command", StringComparison.OrdinalIgnoreCase))
        {
            return errorMessage;
        }

        if (key.StartsWith('$'))
        {
            return errorMessage;
        }

        return $"{key}: {errorMessage}";
    }
}
