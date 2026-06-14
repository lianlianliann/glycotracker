using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GlycemicTracker.API.Data;

namespace GlycemicTracker.API.Controllers;

[ApiController]
[Route("api/ingredients")]
public class IngredientsController : ControllerBase
{
    private readonly AppDbContext _context;

    public IngredientsController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/ingredients?search=...
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? search)
    {
        var query = _context.Ingredients.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(i =>
                i.Name.ToLower().Contains(term) ||
                (i.LocalName != null && i.LocalName.ToLower().Contains(term))
            );
        }

        var results = await query
            .OrderBy(i => i.Name)
            .Select(i => new
            {
                i.IngredientId,
                i.Name,
                i.LocalName,
                i.BaseGI,
                i.CaloriesPer100g,
                i.CarbsPer100g,
                i.ProteinPer100g,
                i.FatPer100g,
                i.FiberPer100g
            })
            .Take(20)
            .ToListAsync();

        return Ok(results);
    }

    // GET /api/ingredients/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var ingredient = await _context.Ingredients.FindAsync(id);
        if (ingredient is null) return NotFound(new { error = "Ingredient not found." });
        return Ok(ingredient);
    }
}