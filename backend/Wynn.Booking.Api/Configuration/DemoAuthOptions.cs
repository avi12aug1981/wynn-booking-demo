namespace Wynn.Booking.Api.Configuration;

public sealed class DemoAuthOptions
{
    public const string SectionName = "DemoAuth";

    public IReadOnlyList<DemoMemberAccount> Members { get; init; } = [];
}

public sealed class DemoMemberAccount
{
    public int MemberId { get; init; }

    public string Email { get; init; } = string.Empty;

    public string Password { get; init; } = string.Empty;

    public string FirstName { get; init; } = string.Empty;

    public string LastName { get; init; } = string.Empty;

    public string Tier { get; init; } = "Gold";
}
