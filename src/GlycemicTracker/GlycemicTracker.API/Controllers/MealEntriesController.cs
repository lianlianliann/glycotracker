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
            return CreatedAtAction(nameof(GetToday), new { userId = dto.UserId }, new
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
                IngredientName = entry.Ingredient.Name,
                PrepMethodName = entry.PrepMethod.MethodName,
                GiMultiplier = entry.PrepMethod.GiMultiplier,
            });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    // GET /api/meal-entries?date=today
    [HttpGet(Name = "GetTodayEntries")]
    public async Task<IActionResult> GetToday([FromQuery] Guid userId)
    {
        var entries = await _gl.GetTodayEntriesAsync(userId);
        return Ok(entries.Select(e => new
        {
            e.EntryId,
            e.GramsConsumed,
            e.NetCarbs,
            e.ModifiedGI,
            e.FinalGL,
            e.MealType,
            e.LoggedAt,
            e.Notes,
            IngredientName = e.Ingredient.Name,
            LocalName = e.Ingredient.LocalName,
            BaseGI = e.Ingredient.BaseGI,
            PrepMethodName = e.PrepMethod.MethodName,
            GiMultiplier = e.PrepMethod.GiMultiplier,
        }));
    }

    // DELETE /api/meal-entries/{id}
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
    }
}