using GlycemicTracker.API.Models;
using GlycemicTracker.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace GlycemicTracker.API.Controllers;

[ApiController]
[Route("api/meal-entries")]
public class MealEntriesController : ControllerBase
{
    private readonly GlycemicService _gl;

    public MealEntriesController(GlycemicService gl)
    {
        _gl = gl;
    }

    // POST /api/meal-entries
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMealEntryDto dto)
    {
        try
        {
            var entry = await _gl.LogMealEntryAsync(dto);
            return CreatedAtAction(nameof(GetEntries), new { userId = dto.UserId }, new
            {
                entry.EntryId,
                entry.IngredientId,
                entry.PrepMethodId,
                entry.GramsConsumed,
                entry.NetCarbs,
                entry.ModifiedGI,
                entry.FinalGL,
                entry.MealType,
                entry.LoggedAt,
                entry.CaloriesConsumed,
                entry.ProteinConsumed,
                entry.FatConsumed,
                IngredientName = entry.Ingredient.Name,
                PrepMethodName = entry.PrepMethod.MethodName,
                GiMultiplier = entry.PrepMethod.GiMultiplier,
            });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            var detail = ex.ToString();
            return StatusCode(500, new { error = "Failed to log entry.", detail });
        }
    }

    // GET /api/meal-entries?userId=...&date=2026-06-14  (date optional, defaults to today)
    [HttpGet(Name = "GetEntries")]
    public async Task<IActionResult> GetEntries([FromQuery] Guid userId, [FromQuery] DateOnly? date)
    {
        try
        {
            var entries = date is DateOnly d
                ? await _gl.GetEntriesByDateAsync(userId, d)
                : await _gl.GetTodayEntriesAsync(userId);

            return Ok(entries.Select(e => new
            {
                e.EntryId,
                e.IngredientId,
                e.PrepMethodId,
                e.GramsConsumed,
                e.NetCarbs,
                e.ModifiedGI,
                e.FinalGL,
                e.MealType,
                e.LoggedAt,
                e.Notes,
                e.CaloriesConsumed,
                e.ProteinConsumed,
                e.FatConsumed,
                IngredientName = e.Ingredient.Name,
                LocalName = e.Ingredient.LocalName,
                BaseGI = e.Ingredient.BaseGI,
                PrepMethodName = e.PrepMethod.MethodName,
                GiMultiplier = e.PrepMethod.GiMultiplier,
            }));
        }
        catch (Exception ex)
        {
            var detail = ex.ToString();
            return StatusCode(500, new { error = "Failed to load entries.", detail });
        }
    }

    // GET /api/meal-entries/summary?userId=...&date=2026-06-14  (date optional, defaults to today)
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] Guid userId, [FromQuery] DateOnly? date)
    {
        try
        {
            var summary = date is DateOnly d
                ? await _gl.GetSummaryByDateAsync(userId, d)
                : await _gl.GetTodaySummaryAsync(userId);

            return Ok(new
            {
                summary.UserId,
                Date = summary.SummaryDate,
                summary.TotalGl,
                summary.EntryCount,
            });
        }
        catch (Exception ex)
        {
            var detail = ex.ToString();
            return StatusCode(500, new { error = "Failed to load summary.", detail });
        }
    }

    // GET /api/meal-entries/weekly?userId=...
    [HttpGet("weekly")]
    public async Task<IActionResult> GetWeekly([FromQuery] Guid userId)
    {
        var summaries = await _gl.GetWeeklySummaryAsync(userId);
        return Ok(summaries.Select(s => new
        {
            Date = s.SummaryDate,
            s.TotalGl,
            s.EntryCount,
        }));
    }

    // PATCH /api/meal-entries/{id}
    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromQuery] Guid userId, [FromBody] UpdateMealEntryDto dto)
    {
        try
        {
            var entry = await _gl.UpdateMealEntryAsync(id, userId, dto);
            return Ok(new
            {
                entry.EntryId,
                entry.IngredientId,
                entry.PrepMethodId,
                entry.GramsConsumed,
                entry.NetCarbs,
                entry.ModifiedGI,
                entry.FinalGL,
                entry.MealType,
                entry.LoggedAt,
                entry.CaloriesConsumed,
                entry.ProteinConsumed,
                entry.FatConsumed,
                entry.Notes,
                IngredientName = entry.Ingredient.Name,
                PrepMethodName = entry.PrepMethod.MethodName,
                GiMultiplier = entry.PrepMethod.GiMultiplier,
            });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            var detail = ex.ToString();
            return StatusCode(500, new { error = "Failed to update entry.", detail });
        }
    }

    // DELETE /api/meal-entries/{id}?userId=...
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] Guid userId)
    {
        try
        {
            await _gl.DeleteMealEntryAsync(id, userId);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            var detail = ex.ToString();
            return StatusCode(500, new { error = "Failed to delete entry.", detail });
        }
    }
}