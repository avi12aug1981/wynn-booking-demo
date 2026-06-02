using Microsoft.AspNetCore.Mvc;
using Wynn.Booking.Application.Common;
using Wynn.Booking.Api.Extensions;

namespace Wynn.Booking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    protected string TraceId => HttpContext.GetTraceId();

    protected IActionResult FromServiceResult<T>(ServiceResult<T> result)
    {
        if (result.Success)
        {
            return StatusCode(result.StatusCode, ApiResponse<T>.Ok(result.Data!, traceId: TraceId));
        }

        return StatusCode(
            result.StatusCode,
            ApiResponse<T>.Fail(
                result.Message ?? "Request failed.",
                result.Errors.Count > 0 ? result.Errors : null,
                TraceId));
    }
}
