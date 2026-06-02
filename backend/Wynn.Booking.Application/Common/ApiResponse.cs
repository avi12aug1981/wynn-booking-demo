namespace Wynn.Booking.Application.Common;

/// <summary>
/// Matches the Next.js API envelope so the React app can integrate later without contract changes.
/// </summary>
public sealed class ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }
    public IReadOnlyList<string>? Errors { get; init; }
    public string? TraceId { get; init; }

    public static ApiResponse<T> Ok(T data, string? message = null, string? traceId = null) =>
        new()
        {
            Success = true,
            Data = data,
            Message = message,
            TraceId = traceId,
        };

    public static ApiResponse<T> Fail(
        string message,
        IReadOnlyList<string>? errors = null,
        string? traceId = null) =>
        new()
        {
            Success = false,
            Message = message,
            Errors = errors,
            TraceId = traceId,
        };
}

public sealed class ServiceResult<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }
    public IReadOnlyList<string> Errors { get; init; } = [];
    public int StatusCode { get; init; } = 200;

    public static ServiceResult<T> Ok(T data, int statusCode = 200) =>
        new() { Success = true, Data = data, StatusCode = statusCode };

    public static ServiceResult<T> Fail(string message, int statusCode = 400, IReadOnlyList<string>? errors = null) =>
        new()
        {
            Success = false,
            Message = message,
            StatusCode = statusCode,
            Errors = errors ?? [],
        };
}
