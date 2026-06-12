namespace GlycemicTracker.API.Models;

public class DailyGlSummary
{
    public Guid UserId { get; set; }
    public DateOnly SummaryDate { get; set; }
    public decimal TotalGl { get; set; }
}