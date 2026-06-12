namespace GlycemicTracker.API.Models;

public class CreateMealEntryDto
{
    public Guid UserId { get; set; }
    public Guid IngredientId { get; set; }
    public short PrepMethodId { get; set; }
    public decimal GramsConsumed { get; set; }
    public string? MealType { get; set; }
    public string? Notes { get; set; }
}