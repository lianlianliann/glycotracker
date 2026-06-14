using GlycemicTracker.API.Data;
using GlycemicTracker.API.Models;
using GlycemicTracker.API.Services;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace GlycemicTracker.Tests;

[TestFixture]
public class GlycemicServiceTests
{

    private static readonly Guid TestUserId = Guid.NewGuid();
    private static readonly Guid TestIngredientId = Guid.NewGuid();
    private const short TestPrepMethodId = 1;

    private static AppDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        var context = new AppDbContext(options);

        context.Ingredients.Add(new Ingredient
        {
            IngredientId = TestIngredientId,
            Name = "White Rice",
            LocalName = "Kanin",
            BaseGI = 72,
            CarbsPer100g = 28,
            FiberPer100g = 0.4m,
        });

        context.PreparationMethods.AddRange(
            new PreparationMethod
            {
                PrepMethodId = 1,
                MethodName = "Freshly Cooked",
                GiMultiplier = 1.000m,
            },
            new PreparationMethod
            {
                PrepMethodId = 2,
                MethodName = "Frozen Overnight",
                GiMultiplier = 0.800m,
            }
        );

        context.SaveChanges();
        return context;
    }

    private static GlycemicService CreateService(AppDbContext context)
        => new GlycemicService(context);

    private static CreateMealEntryDto BuildDto(
        short prepMethodId = TestPrepMethodId,
        decimal grams = 200,
        string? mealType = "Lunch")
        => new CreateMealEntryDto
        {
            UserId = TestUserId,
            IngredientId = TestIngredientId,
            PrepMethodId = prepMethodId,
            GramsConsumed = grams,
            MealType = mealType,
        };


    [Test]
    [Description("Logging a valid meal entry saves it to the database")]
    public async Task LogMealEntry_ValidDto_SavesEntryToDatabase()
    {
        using var context = CreateContext(nameof(LogMealEntry_ValidDto_SavesEntryToDatabase));
        var service = CreateService(context);

        var entry = await service.LogMealEntryAsync(BuildDto());

        var saved = await context.MealEntries.FindAsync(entry.EntryId);
        Assert.That(saved, Is.Not.Null, "Entry should be persisted in the database");
        Assert.That(saved!.UserId, Is.EqualTo(TestUserId));
        Assert.That(saved.IngredientId, Is.EqualTo(TestIngredientId));
        Assert.That(saved.GramsConsumed, Is.EqualTo(200m));
    }

    [Test]
    [Description("LogMealEntry correctly computes GL values and stamps them on the entry")]
    public async Task LogMealEntry_ValidDto_ComputesCorrectGLValues()
    {
        using var context = CreateContext(nameof(LogMealEntry_ValidDto_ComputesCorrectGLValues));
        var service = CreateService(context);

        var entry = await service.LogMealEntryAsync(BuildDto(prepMethodId: 1, grams: 200));

        Assert.That(entry.NetCarbs, Is.EqualTo(55.20m).Within(0.01m), "NetCarbs mismatch");
        Assert.That(entry.ModifiedGI, Is.EqualTo(72.00m).Within(0.01m), "ModifiedGI mismatch");
        Assert.That(entry.FinalGL, Is.EqualTo(39.74m).Within(0.01m), "FinalGL mismatch");
    }

    [Test]
    [Description("LogMealEntry with Frozen Overnight prep method produces lower GL than Freshly Cooked")]
    public async Task LogMealEntry_FrozenOvernight_ProducesLowerGLThanFreshlyCoooked()
    {
        using var context = CreateContext(nameof(LogMealEntry_FrozenOvernight_ProducesLowerGLThanFreshlyCoooked));
        var service = CreateService(context);

        var fresh = await service.LogMealEntryAsync(BuildDto(prepMethodId: 1, grams: 200));
        var frozen = await service.LogMealEntryAsync(BuildDto(prepMethodId: 2, grams: 200));

        Assert.That(frozen.FinalGL, Is.LessThan(fresh.FinalGL),
            "Frozen Overnight (0.8x) should produce lower GL than Freshly Cooked (1.0x)");
    }

    [Test]
    [Description("LogMealEntry creates a DailyGlSummary row for the user")]
    public async Task LogMealEntry_CreatesOrUpdatesDailyGlSummary()
    {
        using var context = CreateContext(nameof(LogMealEntry_CreatesOrUpdatesDailyGlSummary));
        var service = CreateService(context);

        var entry = await service.LogMealEntryAsync(BuildDto());

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var summary = await context.DailyGlSummaries
            .FirstOrDefaultAsync(s => s.UserId == TestUserId && s.SummaryDate == today);

        Assert.That(summary, Is.Not.Null, "DailyGlSummary row should be created");
        Assert.That(summary!.TotalGl, Is.EqualTo(entry.FinalGL).Within(0.01m),
            "DailyGlSummary TotalGl should equal the entry's FinalGL");
    }

    [Test]
    [Description("Logging two entries accumulates both GL values in DailyGlSummary")]
    public async Task LogMealEntry_TwoEntries_AccumulatesGLInDailySummary()
    {
        using var context = CreateContext(nameof(LogMealEntry_TwoEntries_AccumulatesGLInDailySummary));
        var service = CreateService(context);

        var first = await service.LogMealEntryAsync(BuildDto(grams: 200));
        var second = await service.LogMealEntryAsync(BuildDto(grams: 100));

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var summary = await context.DailyGlSummaries
            .FirstOrDefaultAsync(s => s.UserId == TestUserId && s.SummaryDate == today);

        Assert.That(summary!.TotalGl,
            Is.EqualTo(first.FinalGL + second.FinalGL).Within(0.01m),
            "TotalGl should be the sum of both entries");
    }

    [Test]
    [Description("LogMealEntry throws ArgumentException when ingredient ID does not exist")]
    public void LogMealEntry_InvalidIngredientId_ThrowsArgumentException()
    {
        using var context = CreateContext(nameof(LogMealEntry_InvalidIngredientId_ThrowsArgumentException));
        var service = CreateService(context);

        var dto = new CreateMealEntryDto
        {
            UserId = TestUserId,
            IngredientId = Guid.NewGuid(), // non-existent
            PrepMethodId = 1,
            GramsConsumed = 200,
        };

        Assert.ThrowsAsync<ArgumentException>(
            () => service.LogMealEntryAsync(dto),
            "Should throw ArgumentException for unknown ingredient");
    }

    [Test]
    [Description("LogMealEntry throws ArgumentException when prep method ID does not exist")]
    public void LogMealEntry_InvalidPrepMethodId_ThrowsArgumentException()
    {
        using var context = CreateContext(nameof(LogMealEntry_InvalidPrepMethodId_ThrowsArgumentException));
        var service = CreateService(context);

        var dto = new CreateMealEntryDto
        {
            UserId = TestUserId,
            IngredientId = TestIngredientId,
            PrepMethodId = 999,            // non-existent
            GramsConsumed = 200,
        };

        Assert.ThrowsAsync<ArgumentException>(
            () => service.LogMealEntryAsync(dto),
            "Should throw ArgumentException for unknown prep method");
    }

    // ── DeleteMealEntryAsync tests ─────────────────────────────────────────────

    [Test]
    [Description("Deleting a meal entry removes it from the database")]
    public async Task DeleteMealEntry_ValidEntry_RemovesFromDatabase()
    {
        using var context = CreateContext(nameof(DeleteMealEntry_ValidEntry_RemovesFromDatabase));
        var service = CreateService(context);

        var entry = await service.LogMealEntryAsync(BuildDto());
        await service.DeleteMealEntryAsync(entry.EntryId, TestUserId);

        var deleted = await context.MealEntries.FindAsync(entry.EntryId);
        Assert.That(deleted, Is.Null, "Entry should be removed from database after delete");
    }

    [Test]
    [Description("Deleting an entry decrements DailyGlSummary TotalGl by the entry's FinalGL")]
    public async Task DeleteMealEntry_DecrementsGLInDailySummary()
    {
        using var context = CreateContext(nameof(DeleteMealEntry_DecrementsGLInDailySummary));
        var service = CreateService(context);

        var first = await service.LogMealEntryAsync(BuildDto(grams: 200));
        var second = await service.LogMealEntryAsync(BuildDto(grams: 100));

        await service.DeleteMealEntryAsync(first.EntryId, TestUserId);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var summary = await context.DailyGlSummaries
            .FirstOrDefaultAsync(s => s.UserId == TestUserId && s.SummaryDate == today);

        Assert.That(summary!.TotalGl,
            Is.EqualTo(second.FinalGL).Within(0.01m),
            "TotalGl should only reflect the remaining entry after deletion");
    }

    [Test]
    [Description("Deleting all entries clamps DailyGlSummary TotalGl to 0, never negative")]
    public async Task DeleteMealEntry_AllEntries_TotalGlClampsToZero()
    {
        using var context = CreateContext(nameof(DeleteMealEntry_AllEntries_TotalGlClampsToZero));
        var service = CreateService(context);

        var entry = await service.LogMealEntryAsync(BuildDto());
        await service.DeleteMealEntryAsync(entry.EntryId, TestUserId);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var summary = await context.DailyGlSummaries
            .FirstOrDefaultAsync(s => s.UserId == TestUserId && s.SummaryDate == today);

        Assert.That(summary!.TotalGl, Is.EqualTo(0m),
            "TotalGl should be 0 after all entries are deleted, never negative");
    }

    [Test]
    [Description("Deleting an entry belonging to a different user throws ArgumentException")]
    public async Task DeleteMealEntry_WrongUserId_ThrowsArgumentException()
    {
        using var context = CreateContext(nameof(DeleteMealEntry_WrongUserId_ThrowsArgumentException));
        var service = CreateService(context);

        var entry = await service.LogMealEntryAsync(BuildDto());
        var wrongUser = Guid.NewGuid();

        Assert.ThrowsAsync<ArgumentException>(
            () => service.DeleteMealEntryAsync(entry.EntryId, wrongUser),
            "Should not allow deleting another user's entry");
    }

    [Test]
    [Description("Deleting a non-existent entry throws ArgumentException")]
    public void DeleteMealEntry_NonExistentId_ThrowsArgumentException()
    {
        using var context = CreateContext(nameof(DeleteMealEntry_NonExistentId_ThrowsArgumentException));
        var service = CreateService(context);

        Assert.ThrowsAsync<ArgumentException>(
            () => service.DeleteMealEntryAsync(Guid.NewGuid(), TestUserId),
            "Should throw ArgumentException for non-existent entry ID");
    }
}