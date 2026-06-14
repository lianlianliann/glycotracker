namespace GlycemicTracker.API.Models;

public class MealEntry
{
	public Guid EntryId { get; set; }
	public Guid UserId { get; set; }
	public Guid IngredientId { get; set; }
	public short PrepMethodId { get; set; }
	public decimal GramsConsumed { get; set; }
	public decimal NetCarbs { get; set; }
	public decimal ModifiedGI { get; set; }
	public decimal FinalGL { get; set; }
	public string? MealType { get; set; }
	public DateTimeOffset LoggedAt { get; set; }
	public string? Notes { get; set; }

	// Snapshot of nutrients actually consumed for this entry
	public decimal? CaloriesConsumed { get; set; }
	public decimal? ProteinConsumed { get; set; }
	public decimal? FatConsumed { get; set; }

	public Ingredient Ingredient { get; set; } = null!;
	public PreparationMethod PrepMethod { get; set; } = null!;

	public void ComputeGlycemicValues()
	{
		var netCarbsPer100g = Ingredient.CarbsPer100g - Ingredient.FiberPer100g;
		NetCarbs = (netCarbsPer100g / 100m) * GramsConsumed;
		ModifiedGI = Ingredient.BaseGI * PrepMethod.GiMultiplier;
		FinalGL = (ModifiedGI * NetCarbs) / 100m;

		var scale = GramsConsumed / 100m;
		CaloriesConsumed = Ingredient.CaloriesPer100g is decimal cal ? Math.Round(cal * scale, 2) : null;
		ProteinConsumed = Ingredient.ProteinPer100g is decimal prot ? Math.Round(prot * scale, 2) : null;
		FatConsumed = Ingredient.FatPer100g is decimal fat ? Math.Round(fat * scale, 2) : null;
	}
}