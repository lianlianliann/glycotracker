# 🌿 GlycoTrack — Glycemic Optimization & Meal Prep Tracker

> *Eat smarter. Track glycemic load.*

A web application that tracks the **glycemic impact of how you cook your food** — not just what you eat. Built for Filipinos managing blood sugar, GlycoTrack introduces a biochemically-aware **Prep-Modifier Algorithm** that adjusts the Glycemic Index of a food item based on its preparation method.

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Team](#team)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [GL Formula](#gl-formula)
- [Prep Method Multipliers](#prep-method-multipliers)

---

## 📖 About the Project

Traditional nutrition apps focus on calories and macros — but ignore how the **same ingredient** produces different blood sugar responses depending on how it's prepared. Freezing rice overnight creates resistant starch through retrogradation, significantly lowering its glycemic impact. Frying the same rice raises it.

GlycoTrack accounts for this. Every meal entry computes a **final Glycemic Load (GL)** score using a preparation multiplier applied to the base Glycemic Index of the food.

> Built for **COMP 018 – Web Development**  
> Polytechnic University of the Philippines | College of Computer and Information Sciences | June 2026

---

## ✨ Features

| Feature | Description |
|---|---|
| **Prep-Modifier Algorithm** | Dynamically adjusts GI based on cooking/storage method |
| **Filipino Food Database** | 500+ Filipino and foreign foods, searchable in English and Filipino (e.g. Kanin, Bangus, Kamote) |
| **Real-Time GL Preview** | Live computation of Net Carbs, Modified GI, and Final GL before logging |
| **Dashboard & GL Ring** | Circular progress ring with traffic-light color system (Green / Amber / Red) |
| **Food Diary** | Full daily log grouped by meal type with edit and delete support |
| **7-Day GL Trend Chart** | Bar chart with dashed target line showing weekly glycemic patterns |
| **Monthly GL Heatmap** | Calendar-style intensity map of daily GL totals |
| **Onboarding Flow** | 3-step profile setup (Biodata → Health Status → Personalized Targets) |
| **Personalized Targets** | Daily GL, calorie, and protein targets calculated using the Mifflin-St Jeor equation |
| **Settings & Preferences** | Toggle Filipino names, notification preferences, export data as CSV |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | Component-driven UI |
| Vite 8 | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Accessible UI component library |
| React Router DOM v6 | Client-side routing |
| Recharts | GL trend and analytics charts |
| Tabler Icons | Prep method badges and feature icons |
| Supabase JS | Auth client integration |

### Backend
| Technology | Purpose |
|---|---|
| ASP.NET Core (.NET 8) | REST API, GL algorithm engine, business logic |
| Entity Framework Core | ORM bridging backend to Supabase PostgreSQL |
| Npgsql | PostgreSQL driver for EF Core |
| Swagger / Swashbuckle | API documentation and testing |

### Database & Infrastructure
| Technology | Purpose |
|---|---|
| Supabase (PostgreSQL) | Hosted relational database with Row-Level Security |
| Supabase Auth | JWT-based user authentication |

---

## 👥 Team

| Name | Role |
|---|---|
| **Lasam, Vince Michael** | Backend Development — ASP.NET Core API, Prep-Modifier Algorithm engine, GL computation |
| **Mercado, Jeff Petterson** | Database Engineering — Supabase/PostgreSQL schema, EF Core migrations, RLS policies, CSV seeding |
| **Nicolas, John Rich** | Backend Development — ASP.NET Core API, Prep-Modifier Algorithm engine, GL computation |
| **Paredes, Lian Luigi** | UI/UX Design & Frontend Development — React component architecture, food logger, real-time GL preview |

---

## 📁 Project Structure

```
GlycoTrack/
├── src/
│   ├── GlycemicTracker/                    # Backend solution
│   │   ├── GlycemicTracker.sln
│   │   └── GlycemicTracker.API/
│   │       ├── Controllers/               # API endpoint controllers
│   │       ├── Data/                      # AppDbContext (EF Core)
│   │       ├── Models/                    # C# data models
│   │       ├── Services/                  # GL algorithm service layer
│   │       ├── Program.cs
│   │       └── appsettings.json
│   └── GlycemicTracker.Frontend/          # React + TypeScript frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/            # Shared components (Navbar, Sidebar, etc.)
│       │   │   ├── pages/                 # One file per page
│       │   │   │   ├── Landing.tsx
│       │   │   │   ├── Login.tsx
│       │   │   │   ├── Register.tsx
│       │   │   │   ├── Onboarding.tsx
│       │   │   │   ├── Dashboard.tsx
│       │   │   │   ├── Diary.tsx
│       │   │   │   ├── LogFood.tsx
│       │   │   │   ├── Analytics.tsx
│       │   │   │   └── Settings.tsx
│       │   │   ├── App.tsx
│       │   │   └── routes.ts
│       │   └── styles/
│       ├── package.json
│       └── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js LTS](https://nodejs.org) — verify with `node -v`
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) — verify with `dotnet --version`
- [Visual Studio 2022](https://visualstudio.microsoft.com/vs/community/) (for backend)
- [VS Code](https://code.visualstudio.com/) (for frontend)
- A Supabase project with the schema applied (see [Database Schema](#database-schema))

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/GlycoTrack.git
cd GlycoTrack
```

---

### 2. Backend setup

Open `src/GlycemicTracker/GlycemicTracker.sln` in **Visual Studio 2022**.

Add your Supabase connection string to `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=YOUR_SUPABASE_HOST;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;Port=5432"
  }
}
```

> ⚠️ Never commit your real connection string. Use `appsettings.Development.json` locally or environment variables.

Run the API:

```bash
cd src/GlycemicTracker/GlycemicTracker.API
dotnet run
```

Backend runs at: `http://localhost:5208`  
Swagger UI available at: `http://localhost:5208/swagger`

---

### 3. Frontend setup

```bash
cd src/GlycemicTracker.Frontend
npm install
```

Create a `.env.local` file (this is gitignored — never commit it):

```
VITE_API_URL=http://localhost:5208
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Start the dev server:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

### 4. Run both together

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd src/GlycemicTracker/GlycemicTracker.API
dotnet run
```

**Terminal 2 — Frontend:**
```bash
cd src/GlycemicTracker.Frontend
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🗄 Database Schema

The application uses **5 relational tables** in Supabase PostgreSQL. All computed GL fields are stamped by the backend — never trusted from client input.

| Table | Description |
|---|---|
| `ingredients` | Read-only food dataset seeded from `Filipino_Foreign_Foods_Plus_StreetFoods.csv`. Supports fuzzy search on `name` and `local_name`. |
| `preparation_methods` | Static lookup of 13 cooking/storage methods with GI multipliers. |
| `user_profiles` | One-to-one with Supabase Auth users. Stores daily GL target, diabetes type, timezone. |
| `meal_entries` | Main transaction log. Stores raw inputs + 3 backend-computed GL fields per entry. |
| `daily_gl_summaries` | Pre-aggregated daily GL totals per user. Updated via upsert on every insert/delete. |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ingredients?search=` | Fuzzy search ingredients by name or Filipino term |
| `GET` | `/api/preparation-methods` | Returns all 13 prep methods with multipliers |
| `POST` | `/api/meal-entries` | Logs a meal entry; backend computes and stamps GL values |
| `GET` | `/api/meal-entries?date=today` | Returns authenticated user's entries for the current day |
| `DELETE` | `/api/meal-entries/{id}` | Deletes an entry and updates daily GL summary |
| `GET` | `/api/dashboard` | Returns GL ring data, stats, and today's entries |
| `GET` | `/api/analytics` | Returns 7-day trend and monthly heatmap data |
| `PUT` | `/api/user-profiles` | Updates display name, daily GL target, and preferences |

---

## 🧮 GL Formula

```
Net Carbs     = (carbs_per_100g − fiber_per_100g) / 100 × grams_consumed
Modified GI   = base_gi × gi_multiplier
Final GL      = (modified_gi × net_carbs) / 100
```

All three values are computed **server-side** in `MealEntry.ComputeGlycemicValues()` and stored immutably on the meal entry row.

---

## 🍳 Prep Method Multipliers

| Method | Multiplier | Effect |
|---|---|---|
| Frozen Overnight | ×0.80 | Highest resistant starch formation |
| Refrigerated Overnight | ×0.85 | High resistant starch |
| Raw | ×0.85 | Uncooked baseline |
| Stewing | ×0.92 | Moist heat, moderate reduction |
| Boiling / Cooled | ×0.95 | Slight resistant starch increase |
| Steaming | ×0.98 | Minimal impact, near-baseline |
| Smoking | ×1.00 | Minimal impact on starch structure |
| Standard / Newly Cooked | ×1.00 | Baseline — no modification |
| Grilling | ×1.03 | Slight concentration effect |
| Sautéing / Roasting | ×1.05 | Dry heat concentrates sugars |
| Baked | ×1.10 | Moderate GI increase |
| Frying / Deep Fried | ×1.15 | Significant GI increase |
| Stir-Fried | ×1.20 | Highest GI increase |

> Multipliers below ×1.00 are shown in **green**. Multipliers above ×1.00 are shown in **terracotta** throughout the UI.

---

## 📄 License

This project was created for academic purposes as a final project submission for **COMP 018 – Web Development** at the Polytechnic University of the Philippines, June 2026.

---

<p align="center">
  Built with 🌿 by Group 6 — BSCS 3-1, PUP College of Computer and Information Sciences
</p>
