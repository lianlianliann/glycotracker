namespace GlycemicTracker.API.Models;

public class DailyGlSummary
{
    public Guid SummaryId { get; set; }
    public Guid UserId { get; set; }
    public DateOnly SummaryDate { get; set; }
    public decimal TotalGl { get; set; }
    public short EntryCount { get; set; }
}