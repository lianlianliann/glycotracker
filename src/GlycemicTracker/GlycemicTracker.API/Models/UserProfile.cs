namespace GlycemicTracker.API.Models;

public class UserProfile
{
	public Guid UserId { get; set; }
	public string? DisplayName { get; set; }
	public decimal DailyGlTarget { get; set; } = 100;
	public string? DiabetesType { get; set; }
	public string Timezone { get; set; } = "Asia/Manila";
	public DateTimeOffset CreatedAt { get; set; }
}