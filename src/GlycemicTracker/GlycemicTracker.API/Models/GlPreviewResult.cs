namespace GlycemicTracker.API.Models;

public class GlPreviewResult
{
    public decimal NetCarbs { get; set; }
    public decimal ModifiedGI { get; set; }
    public decimal FinalGL { get; set; }
    public string GlLevel { get; set; } = string.Empty; // "Low" | "Medium" | "High"
}