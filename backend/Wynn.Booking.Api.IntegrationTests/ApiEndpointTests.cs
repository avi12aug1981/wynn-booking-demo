using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Wynn.Booking.Api.IntegrationTests;

public sealed class ApiEndpointTests(WynnBookingApiFactory factory) : IClassFixture<WynnBookingApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task SearchRooms_ReturnsSuccessEnvelope()
    {
        var response = await _client.GetAsync(
            "/api/rooms?checkInDate=2026-06-10&checkOutDate=2026-06-12&guestCount=2");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadFromJsonAsync<ApiEnvelope<RoomSearchData>>();
        Assert.NotNull(json);
        Assert.True(json!.Success);
        Assert.NotNull(json.Data);
    }

    [Fact]
    public async Task CreateBookingSession_WithoutApiKey_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/booking-sessions",
            new { roomId = 1, checkInDate = "2026-06-10", checkOutDate = "2026-06-12", guestCount = 2 });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsAccessToken()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/auth/login",
            new { email = "demo.member@wynn.local", password = "DemoMember2026!" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadFromJsonAsync<ApiEnvelope<LoginData>>();
        Assert.NotNull(json);
        Assert.True(json!.Success);
        Assert.False(string.IsNullOrWhiteSpace(json.Data?.AccessToken));
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/auth/login",
            new { email = "demo.member@wynn.local", password = "wrong-password" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CancelBooking_WithoutJwt_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/bookings/WYN-TEST/cancel",
            new { cancellationReason = "test" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateBookingSession_WithApiKey_ReturnsCreatedOrBusinessError()
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/booking-sessions")
        {
            Content = JsonContent.Create(new
            {
                roomId = 1,
                checkInDate = "2026-06-10",
                checkOutDate = "2026-06-12",
                guestCount = 2,
            }),
        };
        request.Headers.Add("x-api-key", "wynn-demo-2026");

        var response = await _client.SendAsync(request);

        Assert.True(
            response.StatusCode is HttpStatusCode.Created or HttpStatusCode.NotFound or HttpStatusCode.Conflict or HttpStatusCode.BadRequest,
            $"Unexpected status: {response.StatusCode}");
    }

    private sealed class ApiEnvelope<T>
    {
        public bool Success { get; init; }
        public T? Data { get; init; }
    }

    private sealed class RoomSearchData
    {
        public object[]? Rooms { get; init; }
    }

    private sealed class LoginData
    {
        public string? AccessToken { get; init; }
    }
}
