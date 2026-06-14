using GlycemicTracker.API.Data;
using GlycemicTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GlycemicTracker.API.Services;

public class GlycemicService
{
    private readonly AppDbContext _context;

    public GlycemicService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<MealEntry> LogMealEntryAsync(CreateMealEntryDto dto)
    {

        var ingredient = await _context.Ingredients
            .FindAsync(dto.IngredientId)
            ?? throw new ArgumentException($"Ingredient {dto.IngredientId} not found.");

        var prepMethod = await _context.PreparationMethods
            .FindAsync(dto.PrepMethodId)
            ?? throw new ArgumentException($"Prep method {dto.PrepMethodId} not found.");

        var entry = new MealEntry
        {
            EntryId = Guid.NewGuid(),
            UserId = dto.UserId,
            IngredientId = dto.IngredientId,
            PrepMethodId = dto.PrepMethodId,
            GramsConsumed = dto.GramsConsumed,
            MealType = dto.MealType,
            LoggedAt = DateTimeOffset.UtcNow,
            Notes = dto.Notes,
            Ingredient = ingredient,
            PrepMethod = prepMethod,
        };

        entry.ComputeGlycemicValues();

        _context.MealEntries.Add(entry);

        await UpsertDailyGlSummaryAsync(dto.UserId, entry.FinalGL, isAdd: true);

        await _context.SaveChangesAsync();

        return entry;
    }

    public async Task DeleteMealEntryAsync(Guid entryId, Guid userId)
    {
        var entry = await _context.MealEntries
            .FirstOrDefaultAsync(e => e.EntryId == entryId && e.UserId == userId)
            ?? throw new ArgumentException("Entry not found or does not belong to user.");

        _context.MealEntries.Remove(entry);

        await UpsertDailyGlSummaryAsync(userId, entry.FinalGL, isAdd: false);

        await _context.SaveChangesAsync();
    }

    public async Task<MealEntry> UpdateMealEntryAsync(Guid entryId, Guid userId, UpdateMealEntryDto dto)
    {
        var entry = await _context.MealEntries
            .Include(e => e.Ingredient)
            .Include(e => e.PrepMethod)
            .FirstOrDefaultAsync(e => e.EntryId == entryId && e.UserId == userId)
            ?? throw new ArgumentException("Entry not found or does not belong to user.");

        var oldGl = entry.FinalGL;

        if (dto.IngredientId is Guid ingredientId && ingredientId != entry.IngredientId)
        {
            var ingredient = await _context.Ingredients.FindAsync(ingredientId)
                ?? throw new ArgumentException($"Ingredient {ingredientId} not found.");
            entry.IngredientId = ingredientId;
            entry.Ingredient = ingredient;
        }

        if (dto.PrepMethodId is short prepMethodId && prepMethodId != entry.PrepMethodId)
        {
            var prepMethod = await _context.PreparationMethods.FindAsync(prepMethodId)
                ?? throw new ArgumentException($"Prep method {prepMethodId} not found.");
            entry.PrepMethodId = prepMethodId;
            entry.PrepMethod = prepMethod;
        }

        if (dto.GramsConsumed is decimal grams) entry.GramsConsumed = grams;
        if (dto.MealType is not null) entry.MealType = dto.MealType;
        if (dto.Notes is not null) entry.Notes = dto.Notes;

        entry.ComputeGlycemicValues();

        // Adjust today's running total by the difference between old and new GL
        var glDelta = entry.FinalGL - oldGl;
        if (glDelta != 0)
            await AdjustDailyGlSummaryAsync(userId, glDelta);

        await _context.SaveChangesAsync();

        return entry;
    }

    private static readonly TimeSpan ManilaOffset = TimeSpan.FromHours(8);

    public async Task<List<MealEntry>> GetEntriesByDateAsync(Guid userId, DateOnly date, string timezone = "Asia/Manila")
    {
        var dayStart = new DateTimeOffset(date.ToDateTime(TimeOnly.MinValue), ManilaOffset);
        var dayEnd = dayStart.AddDays(1);

        return await _context.MealEntries
            .Include(e => e.Ingredient)
            .Include(e => e.PrepMethod)
            .Where(e => e.UserId == userId
                     && e.LoggedAt >= dayStart
                     && e.LoggedAt < dayEnd)
            .OrderBy(e => e.LoggedAt)
            .ToListAsync();
    }

    public async Task<List<MealEntry>> GetTodayEntriesAsync(Guid userId, string timezone = "Asia/Manila")
    {
        var nowLocal = DateTime.UtcNow + ManilaOffset;
        return await GetEntriesByDateAsync(userId, DateOnly.FromDateTime(nowLocal), timezone);
    }


    private async Task UpsertDailyGlSummaryAsync(Guid userId, decimal glDelta, bool isAdd)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var summary = await _context.DailyGlSummaries
            .FirstOrDefaultAsync(s => s.UserId == userId && s.SummaryDate == today);

        if (summary is null)
        {
            summary = new DailyGlSummary
            {
                SummaryId = Guid.NewGuid(),
                UserId = userId,
                SummaryDate = today,
                TotalGl = 0,
                EntryCount = 0,
            };
            _context.DailyGlSummaries.Add(summary);
        }

        summary.TotalGl += isAdd ? glDelta : -glDelta;
        summary.EntryCount += (short)(isAdd ? 1 : -1);

        if (summary.TotalGl < 0) summary.TotalGl = 0;
        if (summary.EntryCount < 0) summary.EntryCount = 0;
    }

    private async Task AdjustDailyGlSummaryAsync(Guid userId, decimal glDelta)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var summary = await _context.DailyGlSummaries
            .FirstOrDefaultAsync(s => s.UserId == userId && s.SummaryDate == today);

        if (summary is null)
        {
            summary = new DailyGlSummary
            {
                SummaryId = Guid.NewGuid(),
                UserId = userId,
                SummaryDate = today,
                TotalGl = 0,
                EntryCount = 0,
            };
            _context.DailyGlSummaries.Add(summary);
        }

        summary.TotalGl += glDelta;
        if (summary.TotalGl < 0) summary.TotalGl = 0;
    }

    public async Task<List<DailyGlSummary>> GetWeeklySummaryAsync(Guid userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var sevenDaysAgo = today.AddDays(-6); // today + 6 past days = 7 total

        return await _context.DailyGlSummaries
            .Where(s => s.UserId == userId
                     && s.SummaryDate >= sevenDaysAgo
                     && s.SummaryDate <= today)
            .OrderBy(s => s.SummaryDate)
            .ToListAsync();
    }

    public async Task<DailyGlSummary> GetSummaryByDateAsync(Guid userId, DateOnly date)
    {
        var summary = await _context.DailyGlSummaries
            .FirstOrDefaultAsync(s => s.UserId == userId && s.SummaryDate == date);

        return summary ?? new DailyGlSummary
        {
            SummaryId = Guid.Empty,
            UserId = userId,
            SummaryDate = date,
            TotalGl = 0,
            EntryCount = 0,
        };
    }

    public async Task<DailyGlSummary> GetTodaySummaryAsync(Guid userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return await GetSummaryByDateAsync(userId, today);
    }

    public GlPreviewResult PreviewGL(GlPreviewDto dto)
    {
        var netCarbsPer100g = dto.CarbsPer100g - dto.FiberPer100g;
        var netCarbs = (netCarbsPer100g / 100m) * dto.GramsConsumed;
        var modifiedGI = dto.BaseGI * dto.GiMultiplier;
        var finalGL = (modifiedGI * netCarbs) / 100m;

        return new GlPreviewResult
        {
            NetCarbs = Math.Round(netCarbs, 2),
            ModifiedGI = Math.Round(modifiedGI, 2),
            FinalGL = Math.Round(finalGL, 2),
            GlLevel = finalGL switch
            {
                <= 10 => "Low",
                <= 20 => "Medium",
                _ => "High"
            }
        };
    }
}