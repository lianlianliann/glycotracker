namespace GlycemicTracker.API.Models;

public class Ingredient
{
	public Guid IngredientId { get; set; }
	public string Name { get; set; } = string.Empty;
	public string? LocalName { get; set; }
	public decimal BaseGI { get; set; }
	public decimal? CaloriesPer100g { get; set; }
	public decimal CarbsPer100g { get; set; }
	public decimal? ProteinPer100g { get; set; }
	public decimal? FatPer100g { get; set; }
	public decimal FiberPer100g { get; set; }
	public DateTimeOffset CreatedAt { get; set; }

	public ICollection<MealEntry> MealEntries { get; set; } = [];
}