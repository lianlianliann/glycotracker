using GlycemicTracker.API.Controllers;
using GlycemicTracker.API.Models;
using GlycemicTracker.API.Services;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace GlycemicTracker.Tests;


[TestFixture]
public class GlPreviewControllerTests
{
    private GlPreviewController _controller = null!;

    [SetUp]
    public void SetUp()
    {

        var service = new GlycemicService(null!);
        _controller = new GlPreviewController(service);
    }



    [Test]
    public void Preview_ValidInput_Returns200WithCorrectValues()
    {
        var dto = new GlPreviewDto
        {
            BaseGI = 72,
            CarbsPer100g = 28,
            FiberPer100g = 0.4m,
            GiMultiplier = 0.800m,
            GramsConsumed = 200
        };

        var result = _controller.Preview(dto) as OkObjectResult;

        Assert.That(result, Is.Not.Null, "Should return OkObjectResult");
        Assert.That(result!.StatusCode, Is.EqualTo(200), "Status code should be 200");

        var value = result.Value as GlPreviewResult;
        Assert.That(value, Is.Not.Null, "Body should be GlPreviewResult");
        Assert.That(value!.NetCarbs, Is.EqualTo(55.20m), "NetCarbs mismatch");
        Assert.That(value.ModifiedGI, Is.EqualTo(57.60m), "ModifiedGI mismatch");
        Assert.That(value.FinalGL, Is.EqualTo(31.80m), "FinalGL mismatch");
        Assert.That(value.GlLevel, Is.EqualTo("High"), "GlLevel should be High");
    }

    [Test]
    public void Preview_LowGLFood_ReturnsGlLevelLow()
    {
        var dto = new GlPreviewDto
        {
            BaseGI = 28,
            CarbsPer100g = 27.4m,
            FiberPer100g = 7.6m,
            GiMultiplier = 1.0m,
            GramsConsumed = 100
        };

        var result = _controller.Preview(dto) as OkObjectResult;
        var value = result!.Value as GlPreviewResult;

        Assert.That(value!.GlLevel, Is.EqualTo("Low"), "Chickpeas should be classified as Low GL");
    }

    [Test]
    public void Preview_MediumGLFood_ReturnsGlLevelMedium()
    {

        var dto = new GlPreviewDto
        {
            BaseGI = 55,
            CarbsPer100g = 27,
            FiberPer100g = 4,
            GiMultiplier = 1.0m,
            GramsConsumed = 100
        };

        var result = _controller.Preview(dto) as OkObjectResult;
        var value = result!.Value as GlPreviewResult;

        Assert.That(value!.GlLevel, Is.EqualTo("Medium"), "Oats at 100g should be Medium GL");
    }

    // ── Validation failure tests ───────────────────────────────────────────────

    [Test]
    [Description("Zero grams consumed returns 400 Bad Request")]
    public void Preview_ZeroGrams_Returns400()
    {
        var dto = new GlPreviewDto
        {
            BaseGI = 72,
            CarbsPer100g = 28,
            FiberPer100g = 0.4m,
            GiMultiplier = 1.0m,
            GramsConsumed = 0       // ← invalid
        };

        var result = _controller.Preview(dto) as BadRequestObjectResult;

        Assert.That(result, Is.Not.Null, "Should return BadRequestObjectResult");
        Assert.That(result!.StatusCode, Is.EqualTo(400), "Status code should be 400");
    }

    [Test]
    [Description("Negative grams consumed returns 400 Bad Request")]
    public void Preview_NegativeGrams_Returns400()
    {
        var dto = new GlPreviewDto
        {
            BaseGI = 72,
            CarbsPer100g = 28,
            FiberPer100g = 0.4m,
            GiMultiplier = 1.0m,
            GramsConsumed = -50     // ← invalid
        };

        var result = _controller.Preview(dto) as BadRequestObjectResult;

        Assert.That(result, Is.Not.Null, "Negative grams should return BadRequest");
    }

    [Test]
    [Description("Fiber exceeding carbs returns 400 Bad Request")]
    public void Preview_FiberExceedsCarbs_Returns400()
    {
        var dto = new GlPreviewDto
        {
            BaseGI = 50,
            CarbsPer100g = 5,
            FiberPer100g = 8,      // ← fiber > carbs, invalid
            GiMultiplier = 1.0m,
            GramsConsumed = 100
        };

        var result = _controller.Preview(dto) as BadRequestObjectResult;

        Assert.That(result, Is.Not.Null, "Fiber > carbs should return BadRequest");
        Assert.That(result!.StatusCode, Is.EqualTo(400), "Status code should be 400");
    }

    [Test]
    [Description("Zero GI multiplier returns 400 Bad Request")]
    public void Preview_ZeroGiMultiplier_Returns400()
    {
        var dto = new GlPreviewDto
        {
            BaseGI = 72,
            CarbsPer100g = 28,
            FiberPer100g = 0.4m,
            GiMultiplier = 0,      // ← invalid
            GramsConsumed = 200
        };

        var result = _controller.Preview(dto) as BadRequestObjectResult;

        Assert.That(result, Is.Not.Null, "Zero GI multiplier should return BadRequest");
    }

    [Test]
    [Description("Negative carbs returns 400 Bad Request")]
    public void Preview_NegativeCarbs_Returns400()
    {
        var dto = new GlPreviewDto
        {
            BaseGI = 72,
            CarbsPer100g = -5,     // ← invalid
            FiberPer100g = 0,
            GiMultiplier = 1.0m,
            GramsConsumed = 100
        };

        var result = _controller.Preview(dto) as BadRequestObjectResult;

        Assert.That(result, Is.Not.Null, "Negative carbs should return BadRequest");
    }

    [Test]
    [Description("Fiber equals carbs (edge) — valid input, GL should be 0")]
    public void Preview_FiberEqualsCarbs_Returns200WithZeroGL()
    {
        var dto = new GlPreviewDto
        {
            BaseGI = 50,
            CarbsPer100g = 10,
            FiberPer100g = 10,     // fiber == carbs is technically valid (net carbs = 0)
            GiMultiplier = 1.0m,
            GramsConsumed = 100
        };

        var result = _controller.Preview(dto) as OkObjectResult;
        var value = result!.Value as GlPreviewResult;

        Assert.That(result, Is.Not.Null, "Fiber == carbs is a valid edge case");
        Assert.That(value!.NetCarbs, Is.EqualTo(0m), "NetCarbs should be 0");
        Assert.That(value.FinalGL, Is.EqualTo(0m), "FinalGL should be 0");
        Assert.That(value.GlLevel, Is.EqualTo("Low"), "GL Level should be Low when GL=0");
    }
}