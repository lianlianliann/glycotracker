using GlycemicTracker.API.Data;
using GlycemicTracker.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GlycemicTracker.API.Controllers;

[ApiController]
[Route("api/user-profile")]
public class UserProfileController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserProfileController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/user-profile/{userId}
    [HttpGet("{userId}")]
    public async Task<IActionResult> Get(Guid userId)
    {
        var profile = await _context.UserProfiles.FindAsync(userId);
        if (profile is null) return NotFound(new { error = "Profile not found." });
        return Ok(profile);
    }

    // POST /api/user-profile  (called on first login/register)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserProfileDto dto)
    {
        var existing = await _context.UserProfiles.FindAsync(dto.UserId);
        if (existing is not null) return Ok(existing); // idempotent

        var profile = new UserProfile
        {
            UserId = dto.UserId,
            DisplayName = dto.DisplayName,
            DailyGlTarget = dto.DailyGlTarget,
            Timezone = dto.Timezone,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { userId = profile.UserId }, profile);
    }

    // PATCH /api/user-profile/{userId}
    [HttpPatch("{userId}")]
    public async Task<IActionResult> Update(Guid userId, [FromBody] UpdateUserProfileDto dto)
    {
        var profile = await _context.UserProfiles.FindAsync(userId);
        if (profile is null) return NotFound(new { error = "Profile not found." });

        if (dto.DisplayName is not null) profile.DisplayName = dto.DisplayName;
        if (dto.DailyGlTarget is not null) profile.DailyGlTarget = dto.DailyGlTarget.Value;
        if (dto.DiabetesType is not null) profile.DiabetesType = dto.DiabetesType;

        await _context.SaveChangesAsync();
        return Ok(profile);
    }
}