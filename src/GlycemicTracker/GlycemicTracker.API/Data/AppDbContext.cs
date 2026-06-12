using Microsoft.EntityFrameworkCore;
using GlycemicTracker.API.Models;

namespace GlycemicTracker.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<PreparationMethod> PreparationMethods { get; set; }
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<MealEntry> MealEntries { get; set; }

    public DbSet<DailyGlSummary> DailyGlSummaries { get; set; }

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Ingredient>(e => {
            e.ToTable("ingredients");
            e.HasKey(i => i.IngredientId);
            e.Property(i => i.IngredientId).HasColumnName("ingredient_id");
            e.Property(i => i.Name).HasColumnName("name").IsRequired();
            e.Property(i => i.LocalName).HasColumnName("local_name");
            e.Property(i => i.BaseGI).HasColumnName("base_gi").HasPrecision(5, 2);
            e.Property(i => i.CaloriesPer100g).HasColumnName("calories_per_100g").HasPrecision(6, 2);
            e.Property(i => i.CarbsPer100g).HasColumnName("carbs_per_100g").HasPrecision(6, 2);
            e.Property(i => i.ProteinPer100g).HasColumnName("protein_per_100g").HasPrecision(6, 2);
            e.Property(i => i.FatPer100g).HasColumnName("fat_per_100g").HasPrecision(6, 2);
            e.Property(i => i.FiberPer100g).HasColumnName("fiber_per_100g").HasPrecision(6, 2);
            e.Property(i => i.CreatedAt).HasColumnName("created_at");
        });

        mb.Entity<PreparationMethod>(e => {
            e.ToTable("preparation_methods");
            e.HasKey(p => p.PrepMethodId);
            e.Property(p => p.PrepMethodId).HasColumnName("prep_method_id");
            e.Property(p => p.MethodName).HasColumnName("method_name").IsRequired();
            e.Property(p => p.GiMultiplier).HasColumnName("gi_multiplier").HasPrecision(4, 3);
            e.Property(p => p.Description).HasColumnName("description");
            e.Property(p => p.IconKey).HasColumnName("icon_key");
        });

        mb.Entity<UserProfile>(e => {
            e.ToTable("user_profiles");
            e.HasKey(u => u.UserId);
            e.Property(u => u.UserId).HasColumnName("user_id");
            e.Property(u => u.DisplayName).HasColumnName("display_name");
            e.Property(u => u.DailyGlTarget).HasColumnName("daily_gl_target").HasPrecision(5, 1);
            e.Property(u => u.DiabetesType).HasColumnName("diabetes_type");
            e.Property(u => u.Timezone).HasColumnName("timezone");
            e.Property(u => u.CreatedAt).HasColumnName("created_at");
        });

        mb.Entity<MealEntry>(e => {
            e.ToTable("meal_entries");
            e.HasKey(m => m.EntryId);
            e.Property(m => m.EntryId).HasColumnName("entry_id");
            e.Property(m => m.UserId).HasColumnName("user_id");
            e.Property(m => m.IngredientId).HasColumnName("ingredient_id");
            e.Property(m => m.PrepMethodId).HasColumnName("prep_method_id");
            e.Property(m => m.GramsConsumed).HasColumnName("grams_consumed").HasPrecision(6, 1);
            e.Property(m => m.NetCarbs).HasColumnName("net_carbs").HasPrecision(6, 2);
            e.Property(m => m.ModifiedGI).HasColumnName("modified_gi").HasPrecision(5, 2);
            e.Property(m => m.FinalGL).HasColumnName("final_gl").HasPrecision(6, 2);
            e.Property(m => m.MealType).HasColumnName("meal_type");
            e.Property(m => m.LoggedAt).HasColumnName("logged_at");
            e.Property(m => m.Notes).HasColumnName("notes");
            e.HasOne(m => m.Ingredient)
             .WithMany(i => i.MealEntries)
             .HasForeignKey(m => m.IngredientId);
            e.HasOne(m => m.PrepMethod)
             .WithMany(p => p.MealEntries)
             .HasForeignKey(m => m.PrepMethodId);
            e.HasIndex(m => new { m.UserId, m.LoggedAt });
        });

        mb.Entity<DailyGlSummary>(e => {
            e.ToTable("daily_gl_summaries");
            e.HasKey(s => new { s.UserId, s.SummaryDate });
            e.Property(s => s.UserId).HasColumnName("user_id");
            e.Property(s => s.SummaryDate).HasColumnName("summary_date");
            e.Property(s => s.TotalGl).HasColumnName("total_gl").HasPrecision(6, 2);
        });
    }
}