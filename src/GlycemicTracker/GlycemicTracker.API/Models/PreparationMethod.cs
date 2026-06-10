namespace GlycemicTracker.API.Models;

public class PreparationMethod
{
    public short PrepMethodId { get; set; }
    public string MethodName { get; set; } = string.Empty;
    public decimal GiMultiplier { get; set; }
    public string? Description { get; set; }
    public string? IconKey { get; set; }

    public ICollection<MealEntry> MealEntries { get; set; } = [];
}