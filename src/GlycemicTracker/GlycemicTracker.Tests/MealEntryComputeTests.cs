using GlycemicTracker.API.Models;
using NUnit.Framework;

namespace GlycemicTracker.Tests;


[TestFixture]
public class MealEntryComputeTests
{

    private static MealEntry BuildEntry(
        decimal baseGI,
        decimal carbsPer100g,
        decimal fiberPer100g,
        decimal giMultiplier,
        decimal grams)
    {
        var ingredient = new Ingredient
        {
            IngredientId = Guid.NewGuid(),
            Name = "Test Ingredient",
            BaseGI = baseGI,
            CarbsPer100g = carbsPer100g,
            FiberPer100g = fiberPer100g,
        };

        var prepMethod = new PreparationMethod
        {
            PrepMethodId = 1,
            MethodName = "Test Method",
            GiMultiplier = giMultiplier,
        };

        return new MealEntry
        {
            EntryId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            GramsConsumed = grams,
            Ingredient = ingredient,
            PrepMethod = prepMethod,
            IngredientId = ingredient.IngredientId,
            PrepMethodId = prepMethod.PrepMethodId,
        };
    }

    // ── Happy-path tests ───────────────────────────────────────────────────────

    [Test]
    public void Compute_WhiteRice_FreshlyCookied_200g_ReturnsCorrectValues()
    {
        
        var entry = BuildEntry(baseGI: 72, carbsPer100g: 28, fiberPer100g: 0.4m,
                               giMultiplier: 1.0m, grams: 200);

        entry.ComputeGlycemicValues();

       
        Assert.That(entry.NetCarbs, Is.EqualTo(55.20m).Within(0.01m), "NetCarbs mismatch");
       
        Assert.That(entry.ModifiedGI, Is.EqualTo(72.00m).Within(0.01m), "ModifiedGI mismatch");
       
        Assert.That(entry.FinalGL, Is.EqualTo(39.74m).Within(0.01m), "FinalGL mismatch");
    }

    [Test]
    public void Compute_WhiteRice_FrozenOvernight_200g_ReturnsLowerGL()
    {
        
        var entry = BuildEntry(baseGI: 72, carbsPer100g: 28, fiberPer100g: 0.4m,
                               giMultiplier: 0.800m, grams: 200);

        entry.ComputeGlycemicValues();

        Assert.That(entry.NetCarbs, Is.EqualTo(55.20m).Within(0.01m), "NetCarbs mismatch");
        
        Assert.That(entry.ModifiedGI, Is.EqualTo(57.60m).Within(0.01m), "ModifiedGI mismatch");
        
        Assert.That(entry.FinalGL, Is.EqualTo(31.80m).Within(0.01m), "FinalGL mismatch");
    }

    [Test]
    public void Compute_WhiteRice_Fried_200g_ReturnsHigherGL()
    {
        var entry = BuildEntry(baseGI: 72, carbsPer100g: 28, fiberPer100g: 0.4m,
                               giMultiplier: 1.150m, grams: 200);

        entry.ComputeGlycemicValues();

        Assert.That(entry.ModifiedGI, Is.EqualTo(82.80m).Within(0.01m), "ModifiedGI mismatch");
        Assert.That(entry.FinalGL, Is.EqualTo(45.71m).Within(0.01m), "FinalGL mismatch");
    }

    [Test]
    public void Compute_HalfPortion_ProducesHalfGL()
    {
        var entry200 = BuildEntry(72, 28, 0.4m, 1.0m, 200);
        var entry100 = BuildEntry(72, 28, 0.4m, 1.0m, 100);

        entry200.ComputeGlycemicValues();
        entry100.ComputeGlycemicValues();

        Assert.That(entry100.FinalGL,
            Is.EqualTo(entry200.FinalGL / 2).Within(0.01m),
            "100g entry should have exactly half the GL of 200g entry");
    }

    [Test]
    public void Compute_ZeroFiber_NetCarbsEqualsCarbs()
    {
        var entry = BuildEntry(baseGI: 100, carbsPer100g: 100, fiberPer100g: 0,
                               giMultiplier: 1.0m, grams: 100);

        entry.ComputeGlycemicValues();

        Assert.That(entry.NetCarbs, Is.EqualTo(100m).Within(0.01m));
        Assert.That(entry.ModifiedGI, Is.EqualTo(100m).Within(0.01m));
        Assert.That(entry.FinalGL, Is.EqualTo(100m).Within(0.01m));
    }

    [Test]
    public void Compute_HighFiber_ReducesNetCarbsAndGL()
    {
        var entry = BuildEntry(baseGI: 28, carbsPer100g: 27.4m, fiberPer100g: 7.6m,
                               giMultiplier: 1.0m, grams: 150);

        entry.ComputeGlycemicValues();

        Assert.That(entry.NetCarbs, Is.EqualTo(29.70m).Within(0.01m));
        // Final GL = (28 * 29.70) / 100 = 8.316
        Assert.That(entry.FinalGL, Is.LessThan(10m), "High-fiber food should produce low GL");
    }


    [Test]
    public void Compute_BaseGIIsZero_AllResultsAreZero()
    {
        var entry = BuildEntry(baseGI: 0, carbsPer100g: 28, fiberPer100g: 0.4m,
                               giMultiplier: 1.0m, grams: 200);

        entry.ComputeGlycemicValues();

        Assert.That(entry.NetCarbs, Is.EqualTo(55.20m).Within(0.01m), "NetCarbs should not be affected by BaseGI=0");
        Assert.That(entry.ModifiedGI, Is.EqualTo(0m), "ModifiedGI should be 0 when BaseGI=0");
        Assert.That(entry.FinalGL, Is.EqualTo(0m), "FinalGL should be 0 when ModifiedGI=0");
    }

    [Test]
    public void Compute_BaseGIIs100_ProducesMaximumGI()
    {
        var entry = BuildEntry(baseGI: 100, carbsPer100g: 50, fiberPer100g: 0,
                               giMultiplier: 1.0m, grams: 100);

        entry.ComputeGlycemicValues();

        Assert.That(entry.ModifiedGI, Is.EqualTo(100m), "ModifiedGI at boundary GI=100 should be exactly 100");
        Assert.That(entry.FinalGL, Is.EqualTo(50m).Within(0.01m));
    }

    [Test]
    [Description("Edge case: fiber equals carbs — net carbs should be 0, GL should be 0")]
    public void Compute_FiberEqualsCarbs_NetCarbsIsZero()
    {
        var entry = BuildEntry(baseGI: 50, carbsPer100g: 10, fiberPer100g: 10,
                               giMultiplier: 1.0m, grams: 100);

        entry.ComputeGlycemicValues();

        Assert.That(entry.NetCarbs, Is.EqualTo(0m), "NetCarbs should be 0 when fiber equals carbs");
        Assert.That(entry.FinalGL, Is.EqualTo(0m), "FinalGL should be 0 when NetCarbs is 0");
    }

    [Test]
    [Description("Edge case: 1g portion — very small amount should still compute correctly")]
    public void Compute_OneGramPortion_StillComputesCorrectly()
    {
        var entry = BuildEntry(baseGI: 72, carbsPer100g: 28, fiberPer100g: 0.4m,
                               giMultiplier: 1.0m, grams: 1);

        entry.ComputeGlycemicValues();

        Assert.That(entry.NetCarbs, Is.EqualTo(0.276m).Within(0.001m));
        Assert.That(entry.FinalGL, Is.GreaterThan(0m), "GL should be positive even for 1g portion");
    }

    // ── Multiplier correctness tests ───────────────────────────────────────────

    [Test]
    [Description("All 11 prep method multipliers produce the correct Modified GI for a known base")]
    [TestCase(1.000, 72.000, Description = "Freshly Cooked")]
    [TestCase(0.800, 57.600, Description = "Frozen Overnight")]
    [TestCase(0.850, 61.200, Description = "Refrigerated")]
    [TestCase(1.150, 82.800, Description = "Fried")]
    [TestCase(1.100, 79.200, Description = "Roasted")]
    [TestCase(0.900, 64.800, Description = "Steamed")]
    [TestCase(0.950, 68.400, Description = "Boiled")]
    [TestCase(1.050, 75.600, Description = "Baked")]
    [TestCase(1.200, 86.400, Description = "Deep Fried")]
    [TestCase(0.750, 54.000, Description = "Raw")]
    [TestCase(0.870, 62.640, Description = "Pressure Cooked")]
    public void Compute_AllPrepMultipliers_ProduceCorrectModifiedGI(
        double multiplier, double expectedModifiedGI)
    {
        var entry = BuildEntry(baseGI: 72, carbsPer100g: 28, fiberPer100g: 0.4m,
                               giMultiplier: (decimal)multiplier, grams: 200);

        entry.ComputeGlycemicValues();

        Assert.That((double)entry.ModifiedGI,
            Is.EqualTo(expectedModifiedGI).Within(0.01),
            $"Multiplier {multiplier}x should produce ModifiedGI of {expectedModifiedGI}");
    }
}