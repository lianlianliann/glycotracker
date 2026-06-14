using GlycemicTracker.API.Models;
using GlycemicTracker.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace GlycemicTracker.API.Controllers;

[ApiController]
[Route("api/gl-preview")]
public class GlPreviewController : ControllerBase
{
    private readonly GlycemicService _gl;

    public GlPreviewController(GlycemicService gl)
    {
        _gl = gl;
    }

    // POST /api/gl-preview
    [HttpPost]
    public IActionResult Preview([FromBody] GlPreviewDto dto)
    {
        if (dto.GramsConsumed <= 0)
            return BadRequest(new { error = "Grams consumed must be greater than 0." });

        if (dto.CarbsPer100g < 0 || dto.FiberPer100g < 0)
            return BadRequest(new { error = "Carb and fiber values cannot be negative." });

        if (dto.FiberPer100g > dto.CarbsPer100g)
            return BadRequest(new { error = "Fiber cannot exceed total carbs." });

        if (dto.GiMultiplier <= 0)
            return BadRequest(new { error = "GI multiplier must be greater than 0." });

        var result = _gl.PreviewGL(dto);
        return Ok(result);
    }
}