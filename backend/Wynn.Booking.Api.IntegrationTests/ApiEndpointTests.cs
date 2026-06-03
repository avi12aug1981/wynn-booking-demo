using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Wynn.Booking.Api.IntegrationTests;

public sealed class ApiEndpointTests(WynnBookingApiFactory factory) : IClassFixture<WynnBookingApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task SearchRooms_WithPastCheckIn_ReturnsBadRequest()
    {
        var response = await _client.GetAsync(
            "/api/rooms?checkInDate=2020-01-01&checkOutDate=2020-01-03&guestCount=2");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var json = await response.Content.ReadFromJsonAsync<ApiEnvelope<object>>();
        Assert.NotNull(json);
        Assert.False(json!.Success);
    }

    [Fact]
    public async Task CreateBookingSession_WithPastCheckIn_ReturnsBadRequest()
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/booking-sessions")
        {
            Content = JsonContent.Create(new
            {
                roomId = 1,
                checkInDate = "2019-06-01",
                checkOutDate = "2019-06-03",
                guestCount = 2,
            }),
        };
        request.Headers.Add("x-api-key", "wynn-demo-2026");

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetRoomDetails_WithSameCheckInAndCheckOut_ReturnsBadRequest()
    {
        var response = await _client.GetAsync(
            "/api/rooms/1?checkInDate=2026-12-10&checkOutDate=2026-12-10");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var json = await response.Content.ReadFromJsonAsync<ApiEnvelope<object>>();
        Assert.NotNull(json);
        Assert.False(json!.Success);
    }

    [Fact]
    public async Task GetRoomDetails_WithPastCheckIn_ReturnsBadRequest()
    {
        var response = await _client.GetAsync(
            "/api/rooms/1?checkInDate=2020-01-01&checkOutDate=2020-01-03");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetRoomDetails_WithOnlyOneDate_ReturnsBadRequest()
    {
        var response = await _client.GetAsync("/api/rooms/1?checkInDate=2026-12-10");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetRoomDetails_WithValidDates_ReturnsPricingFields()
    {
        var response = await _client.GetAsync(
            "/api/rooms/1?checkInDate=2026-12-10&checkOutDate=2026-12-12");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadFromJsonAsync<ApiEnvelope<RoomDetailsData>>();
        Assert.NotNull(json);
        Assert.True(json!.Success);
        Assert.NotNull(json.Data);
        Assert.Equal(2, json.Data!.NumberOfNights);
        Assert.NotNull(json.Data.EstimatedSubtotal);
    }

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
            new { email = "demo.member@wynn.local", password = "demo.member" });

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
    public async Task GetMemberBookings_WithValidToken_ReturnsSuccessEnvelope()
    {
        var loginResponse = await _client.PostAsJsonAsync(
            "/api/auth/login",
            new { email = "demo.member@wynn.local", password = "demo.member" });

        var loginJson = await loginResponse.Content.ReadFromJsonAsync<ApiEnvelope<LoginData>>();
        Assert.NotNull(loginJson?.Data?.AccessToken);
        Assert.False(string.IsNullOrWhiteSpace(loginJson!.Data!.AccessToken));

        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/Bookings/me");
        request.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue(
                "Bearer",
                loginJson!.Data!.AccessToken);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadFromJsonAsync<ApiEnvelope<MemberBookingsData>>();
        Assert.NotNull(json);
        Assert.True(json!.Success);
        Assert.NotNull(json.Data?.Bookings);
    }

    [Fact]
    public async Task CreateBooking_WithInvalidJson_ReturnsApiEnvelopeWithShortTraceId()
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/Bookings")
        {
            Content = new StringContent(
                """{ "bookingSessionToken": 'bad', "roomId": 1 }""",
                System.Text.Encoding.UTF8,
                "application/json"),
        };

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("\"type\":", body);
        Assert.Contains("\"success\":false", body.Replace(" ", ""));

        var json = await response.Content.ReadFromJsonAsync<ApiEnvelope<object>>();
        Assert.NotNull(json);
        Assert.False(json!.Success);
        Assert.False(string.IsNullOrWhiteSpace(json.TraceId));
        Assert.DoesNotContain('-', json.TraceId!);
    }

    [Fact]
    public async Task CreateBooking_WithoutSessionToken_ReturnsBadRequest()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/Bookings",
            new
            {
                bookingSessionToken = (string?)null,
                roomId = 1,
                bookingType = 0,
                firstName = "Jane",
                lastName = "Guest",
                gender = 1,
                contactEmail = "jane@example.com",
                adultCount = 2,
                checkInDate = "2026-10-01",
                checkOutDate = "2026-10-03",
                addressLine1 = "123 Main St",
                city = "Las Vegas",
                state = "NV",
                zipCode = "89109",
                country = "USA",
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var json = await response.Content.ReadFromJsonAsync<ApiEnvelope<object>>();
        Assert.NotNull(json);
        Assert.False(json!.Success);
        Assert.False(string.IsNullOrWhiteSpace(json.TraceId));
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
        public string? TraceId { get; init; }
    }

    private sealed class RoomSearchData
    {
        public object[]? Rooms { get; init; }
    }

    private sealed class RoomDetailsData
    {
        public int? NumberOfNights { get; init; }
        public decimal? EstimatedSubtotal { get; init; }
    }

    private sealed class LoginData
    {
        public string? AccessToken { get; init; }
    }

    private sealed class MemberBookingsData
    {
        public object[]? Bookings { get; init; }
    }
}
