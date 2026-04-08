using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Web_Phuongxa.Application.Interfaces;
using Web_Phuongxa.Infrastructure;
using Web_Phuongxa.Infrastructure.Storage;

var builder = WebApplication.CreateBuilder(args);

static string GetRequiredJwtSetting(WebApplicationBuilder builder, string key)
{
    var value = builder.Configuration[key];
    if (!string.IsNullOrWhiteSpace(value))
    {
        return value;
    }

    if (builder.Environment.IsDevelopment())
    {
        return key switch
        {
            "Authentication:Jwt:Issuer" => "PhuongxaAPI",
            "Authentication:Jwt:Audience" => "PhuongxaClient",
            "Authentication:Jwt:Key" => "SuperSecretKeyThatIsAtLeast32BytesLong123!",
            _ => throw new InvalidOperationException($"Missing {key} configuration.")
        };
    }

    throw new InvalidOperationException($"Missing {key} configuration.");
}

// ==========================================
// PHẦN 1: THÊM DỊCH VỤ (Khu vực của 'builder')
// ==========================================
builder.Services.AddControllers();
builder.Services.AddScoped<IFileStorageService, AzureBlobStorageService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Web_Phuongxa API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập JWT token vào đây (không cần gõ 'Bearer').",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer")] = new List<string>()
    });
});

var jwtIssuer = GetRequiredJwtSetting(builder, "Authentication:Jwt:Issuer");
var jwtAudience = GetRequiredJwtSetting(builder, "Authentication:Jwt:Audience");
var jwtKey = GetRequiredJwtSetting(builder, "Authentication:Jwt:Key");

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

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Hỗ trợ cả 2 kiểu nhập trên Swagger:
                // 1) token thuần
                // 2) Bearer <token>
                var authorization = context.Request.Headers.Authorization.ToString();
                if (!string.IsNullOrWhiteSpace(authorization))
                {
                    const string bearerPrefix = "Bearer ";
                    if (authorization.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
                    {
                        var raw = authorization.Substring(bearerPrefix.Length).Trim();
                        if (raw.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
                        {
                            raw = raw.Substring(bearerPrefix.Length).Trim();
                        }

                        context.Token = raw;
                    }
                }

                return Task.CompletedTask;
            }
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
//if (app.Environment.IsDevelopment())
//{
app.UseSwagger();
app.UseSwaggerUI();
//}

app.UseCors("AllowNextJS");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();