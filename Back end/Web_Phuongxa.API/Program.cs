using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Web_Phuongxa.Application.Interfaces;
using Web_Phuongxa.Infrastructure;
using Web_Phuongxa.Infrastructure.Storage;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// PHẦN 1: THÊM DỊCH VỤ (Khu vực của 'builder')
// Mọi lệnh builder.Services... PHẢI nằm ở đây
// ==========================================
builder.Services.AddControllers();
builder.Services.AddScoped<IFileStorageService, AzureBlobStorageService>();

// Thêm cấu hình Swagger để sinh tài liệu API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "PhuongxaAPI",
            ValidAudience = "PhuongxaClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SuperSecretKeyThatIsAtLeast32BytesLong123!"))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin", "Quản trị viên", "Quan tri vien"));
});

// ĐẶT ĐOẠN CODE CORS BỊ LỖI VÀO ĐÂY
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJS", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Địa chỉ của Next.js
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<PhuongXaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
// CHỐT SỔ: Khởi tạo ứng dụng
var app = builder.Build();

// =====================================================================
// BẮT ĐẦU ĐOẠN CODE "LÀM NÓNG" (WARM-UP) ENTITY FRAMEWORK
// =====================================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        // 1. Lấy PhuongXaDbContext ra khỏi "hồ chứa" dịch vụ
        var context = services.GetRequiredService<PhuongXaDbContext>();

        // 2. Gõ cửa Database: Lệnh này ép EF Core phải dịch Model và kết nối ngay!
        context.Database.CanConnect();

        // In ra màn hình console (cái bảng đen đen) để bạn biết nó đã chạy xong
        Console.WriteLine("✅ [Thanh cong] Entity Framework da duoc lam nong!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ [Loi] Khong the lam nong DB. Chi tiet: {ex.Message}");
    }
}
// =====================================================================
// KẾT THÚC ĐOẠN CODE WARM-UP
// =====================================================================



// ==========================================
// PHẦN 2: CẤU HÌNH PIPELINE (Khu vực của 'app')
// Mọi lệnh app.Use... hoặc app.Map... PHẢI nằm ở đâ
// ==========================================

// Bật Swagger và UI trong môi trường phát triển (hoặc luôn bật)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Nếu có app.MapOpenApi() thì nó phải nằm ở phần này
// app.MapOpenApi(); 

// Kích hoạt CORS (Phải gọi đúng tên Policy đã tạo ở trên)
// LƯU Ý: Phải đặt UseCors TRƯỚC UseStaticFiles VÀ UseAuthorization để áp dụng CORS cho cả hình ảnh
app.UseCors("AllowNextJS");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();