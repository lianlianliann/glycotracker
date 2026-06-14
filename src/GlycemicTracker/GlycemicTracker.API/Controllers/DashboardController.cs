using GlycemicTracker.API.Data;
using GlycemicTracker.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GlycemicTracker.API.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly GlycemicService _gl;
    private readonly AppDbContext _context;

    public DashboardController(GlycemicService gl, AppDbContext context)
    {
        _gl = gl;
        _context = context;
    }

    // GET /api/dashboard/weekly?userId=...
    // Returns the last 7 days of GL totals for the chart
    [HttpGet("weekly")]
    public async Task<IActionResult> GetWeekly([FromQuery] Guid userId)
    {
        var summaries = await _gl.GetWeeklySummaryAsync(userId);

        // Fill in missing days with 0 so the chart always has 7 points
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var result = Enumerable.Range(0, 7)
            .Select(i =>
            {
                var date = today.AddDays(-6 + i);
                var match = summaries.FirstOrDefault(s => s.SummaryDate == date);
                return new
                {
                    Date = date.ToString("yyyy-MM-dd"),
                    TotalGl = match?.TotalGl ?? 0m
                };
            })
            .ToList();

        return Ok(result);
    }

    // GET /api/dashboard/today?userId=...
    // Returns today's GL total + user's target for the ring
    [HttpGet("today")]
    public async Task<IActionResult> GetToday([FromQuery] Guid userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var summary = await _context.DailyGlSummaries
            .FirstOrDefaultAsync(s => s.UserId == userId && s.SummaryDate == today);

        var profile = await _context.UserProfiles.FindAsync(userId);

        return Ok(new
        {
            TotalGl = summary?.TotalGl ?? 0m,
            DailyGlTarget = profile?.DailyGlTarget ?? 100m,
        });
    }
}