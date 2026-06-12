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

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? search)
    {
        var query = _context.Ingredients.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(i =>
                i.Name.ToLower().Contains(search.ToLower()) ||
                (i.LocalName != null && i.LocalName.ToLower().Contains(search.ToLower()))
            );

        var results = await query
            .Select(i => new {
                i.IngredientId,
                i.Name,
                i.LocalName,
                i.BaseGI,
                i.CarbsPer100g,
                i.FiberPer100g
            })
            .Take(20)
            .ToListAsync();

        return Ok(results);
    }
}