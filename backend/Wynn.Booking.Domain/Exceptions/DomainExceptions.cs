namespace Wynn.Booking.Domain.Exceptions;

public abstract class DomainException(string message) : Exception(message)
{
    public abstract int StatusCode { get; }
}

public sealed class NotFoundException(string message) : DomainException(message)
{
    public override int StatusCode => 404;
}

public sealed class ConflictException(string message) : DomainException(message)
{
    public override int StatusCode => 409;
}

public sealed class ValidationException(string message, IEnumerable<string>? errors = null)
    : DomainException(message)
{
    public override int StatusCode => 400;

    public IReadOnlyList<string> Errors { get; } = errors?.ToArray() ?? [];
}
