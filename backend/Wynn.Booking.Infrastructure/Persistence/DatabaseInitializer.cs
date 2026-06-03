using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Wynn.Booking.Domain.Entities;
using Wynn.Booking.Domain.Enums;

namespace Wynn.Booking.Infrastructure.Persistence;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(
        BookingDbContext dbContext,
        ILogger logger,
        IConfiguration? configuration = null,
        CancellationToken cancellationToken = default)
    {
        await dbContext.Database.MigrateAsync(cancellationToken);

        await SeedMembersIfEmptyAsync(dbContext, logger, configuration, cancellationToken);

        if (await dbContext.Rooms.AnyAsync(cancellationToken))
        {
            return;
        }

        logger.LogInformation("Seeding Wynn booking database rooms...");

        var now = DateTime.UtcNow;
        var rooms = new[]
        {
            CreateRoom("Deluxe King Room", "Standard", "Spacious king room with modern amenities.", 189.99m, 2, "WiFi,Smart TV,Coffee Maker", "/images/deluxe-king.jpg", now),
            CreateRoom("Resort Queen Room", "Standard", "Comfortable queen room overlooking the resort.", 209.99m, 4, "WiFi,Smart TV,Mini Fridge", "/images/resort-queen.jpg", now),
            CreateRoom("Panoramic King Room", "Premium", "Panoramic city views with luxury furnishings.", 259.99m, 2, "WiFi,Smart TV,City View", "/images/panoramic-king.jpg", now),
            CreateRoom("Family Double Queen Room", "Family", "Ideal for families with two queen beds.", 279.99m, 5, "WiFi,Smart TV,Mini Fridge", "/images/family-double-queen.jpg", now, petsAllowed: true),
            CreateRoom("Executive Suite", "Suite", "Executive suite with separate living area.", 399.99m, 4, "WiFi,Smart TV,Living Room", "/images/executive-suite.jpg", now),
            CreateRoom("Tower Suite", "Suite", "Luxury suite with premium tower views.", 549.99m, 4, "WiFi,Smart TV,Premium View", "/images/tower-suite.jpg", now),
            CreateRoom("Salon Suite", "Suite", "Elegant suite designed for extended stays.", 799.99m, 6, "WiFi,Smart TV,Dining Area", "/images/salon-suite.jpg", now),
            CreateRoom("Presidential Suite", "Luxury", "Premier luxury accommodation experience.", 1299.99m, 8, "WiFi,Smart TV,Private Lounge", "/images/presidential-suite.jpg", now),
        };

        dbContext.Rooms.AddRange(rooms);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Seeded {RoomCount} rooms.", rooms.Length);
    }

    private static async Task SeedMembersIfEmptyAsync(
        BookingDbContext dbContext,
        ILogger logger,
        IConfiguration? configuration,
        CancellationToken cancellationToken)
    {
        if (await dbContext.Members.AnyAsync(cancellationToken))
        {
            return;
        }

        logger.LogInformation("Seeding Members table...");

        var now = DateTime.UtcNow;
        var seedAccounts = ReadMemberSeedAccounts(configuration);

        foreach (var account in seedAccounts)
        {
            dbContext.Members.Add(new Member
            {
                FirstName = account.FirstName,
                LastName = account.LastName,
                Email = account.Email.Trim(),
                PasswordHash = account.Password,
                Gender = Gender.PreferNotToSay,
                Tier = account.Tier,
                Status = MemberStatus.Active,
                AddressLine1 = "3131 Las Vegas Blvd South",
                City = "Las Vegas",
                State = "NV",
                ZipCode = "89109",
                Country = "USA",
                CreatedAt = now,
                UpdatedAt = now,
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded {MemberCount} members.", seedAccounts.Count);
    }

    private static IReadOnlyList<MemberSeedAccount> ReadMemberSeedAccounts(IConfiguration? configuration)
    {
        var fromConfig = configuration?
            .GetSection("DemoAuth:Members")
            .Get<List<MemberSeedAccount>>();

        if (fromConfig is { Count: > 0 })
        {
            return fromConfig;
        }

        return
        [
            new MemberSeedAccount
            {
                MemberId = 1,
                Email = "demo.member@wynn.local",
                Password = "demo.member",
                FirstName = "Demo",
                LastName = "Member",
                Tier = "Gold",
            },
        ];
    }

    private static Room CreateRoom(
        string name,
        string type,
        string description,
        decimal price,
        int maxGuests,
        string amenities,
        string imageUrl,
        DateTime now,
        bool petsAllowed = false)
    {
        return new Room
        {
            Name = name,
            Type = type,
            Description = description,
            PricePerNight = price,
            MaxGuests = maxGuests,
            Amenities = amenities,
            ImageUrl = imageUrl,
            PetsAllowed = petsAllowed,
            SmokingAllowed = false,
            Rating = 4.5m,
            ReviewCount = 100,
            Status = RoomStatus.Available,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
        };
    }

    private sealed class MemberSeedAccount
    {
        public int MemberId { get; init; }
        public string Email { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public string Tier { get; init; } = "Gold";
    }
}
