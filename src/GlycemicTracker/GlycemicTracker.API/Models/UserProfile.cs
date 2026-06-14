namespace GlycemicTracker.API.Models;

public class UserProfile
{
	public Guid UserId { get; set; }
	public string? DisplayName { get; set; }
	public decimal DailyGlTarget { get; set; } = 100;
	public string? DiabetesType { get; set; }
	public string Timezone { get; set; } = "Asia/Manila";
	public DateTimeOffset CreatedAt { get; set; }

	// Added columns
	public decimal? Height { get; set; }
	public decimal? Weight { get; set; }
	public string? ActivityLevel { get; set; }
	public decimal? DailyGiTarget { get; set; }
}