using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GlycemicTracker.API.Data;

namespace GlycemicTracker.API.Controllers;

[ApiController]
[Route("api/preparation-methods")]
public class PreparationMethodsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PreparationMethodsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var methods = await _context.PreparationMethods
            .OrderBy(p => p.PrepMethodId)
            .Select(p => new {
                p.PrepMethodId,
                p.MethodName,
                p.GiMultiplier,
                p.Description,
                p.IconKey
            })
            .ToListAsync();

        return Ok(methods);
    }
}