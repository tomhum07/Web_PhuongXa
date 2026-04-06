using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Linq;
using System.Text;
using Web_Phuongxa.Application.Interfaces;
using Web_Phuongxa.Infrastructure;
using Web_Phuongxa.Infrastructure.Storage;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// PHẦN 1: THÊM DỊCH VỤ (Khu vực của 'builder')
// ==========================================
builder.Services.AddControllers();
builder.Services.AddScoped<IFileStorageService, AzureBlobStorageService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtIssuer = builder.Configuration["Authentication:Jwt:Issuer"]
    ?? (builder.Environment.IsDevelopment() ? "PhuongxaAPI" : throw new InvalidOperationException("Missing Authentication:Jwt:Issuer configuration."));
var jwtAudience = builder.Configuration["Authentication:Jwt:Audience"]
    ?? (builder.Environment.IsDevelopment() ? "PhuongxaClient" : throw new InvalidOperationException("Missing Authentication:Jwt:Audience configuration."));
var jwtKey = builder.Configuration["Authentication:Jwt:Key"]
    ?? (builder.Environment.IsDevelopment() ? "SuperSecretKeyThatIsAtLeast32BytesLong123!" : throw new InvalidOperationException("Missing Authentication:Jwt:Key configuration."));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin", "Quản trị viên", "Quan tri vien"));
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? (builder.Environment.IsDevelopment()
        ? ["http://localhost:3000"]
        : Array.Empty<string>());

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJS", policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            policy.AllowAnyHeader().AllowAnyMethod();
            return;
        }

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<PhuongXaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// ==========================================
// PHẦN 2: CẤU HÌNH PIPELINE (Khu vực của 'app')
// ==========================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowNextJS");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();