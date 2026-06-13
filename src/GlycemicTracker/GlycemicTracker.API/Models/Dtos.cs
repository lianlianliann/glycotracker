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

public class CreateUserProfileDto
{
    public Guid UserId { get; set; }
    public string? DisplayName { get; set; }
    public decimal DailyGlTarget { get; set; } = 100;
    public string Timezone { get; set; } = "Asia/Manila";
}

public class UpdateUserProfileDto
{
    public string? DisplayName { get; set; }
    public decimal? DailyGlTarget { get; set; }
    public string? DiabetesType { get; set; }
}

public class GlPreviewDto
{
    public decimal BaseGI { get; set; }
    public decimal CarbsPer100g { get; set; }
    public decimal FiberPer100g { get; set; }
    public decimal GiMultiplier { get; set; }
    public decimal GramsConsumed { get; set; }
}