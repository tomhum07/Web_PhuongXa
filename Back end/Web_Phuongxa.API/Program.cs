using Microsoft.EntityFrameworkCore;
using Web_Phuongxa.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// PHẦN 1: THÊM DỊCH VỤ (Khu vực của 'builder')
// Mọi lệnh builder.Services... PHẢI nằm ở đây
// ==========================================
builder.Services.AddControllers();

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

// ... các cấu hình builder.Services khác (nếu có) ...
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

// Nếu có app.MapOpenApi() thì nó phải nằm ở phần này
// app.MapOpenApi(); 

// Kích hoạt CORS (Phải gọi đúng tên Policy đã tạo ở trên)
// LƯU Ý: Phải đặt UseCors TRƯỚC UseAuthorization
app.UseCors("AllowNextJS");

app.UseAuthorization();
app.MapControllers();

app.Run();