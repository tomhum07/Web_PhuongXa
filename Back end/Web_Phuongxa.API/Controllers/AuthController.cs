using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Bắt buộc thêm để dùng FirstOrDefaultAsync và Include
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Infrastructure;
using Web_Phuongxa.Domain.Entities;


namespace Web_Phuongxa.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        // 1. Tiêm (Inject) DbContext vào Controller
        public AuthController(PhuongXaDbContext context)
        {
            _context = context;
        }

        // Hàm mã hóa mật khẩu (dùng khi tạo mới người dùng)
        [NonAction]
        public string HashPassword(string password)
        {
            // Trả về mật khẩu đã được băm bằng BCrypt
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        // Hàm kiểm tra mật khẩu đã mã hóa
        [NonAction]
        public bool VerifyPassword(string password, string storedHash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, storedHash);
            }
            catch
            {
                return false;
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            // 2. Truy vấn User từ Database, cho phép đăng nhập bằng cả Username hoặc Email
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => (u.Username == request.Username || u.Email == request.Username) && u.IsActive == true);

            // 3. Kiểm tra User có tồn tại và mật khẩu có khớp không
            // Sử dụng hàm VerifyPassword để so sánh mật khẩu người dùng nhập với Hash trong DB
            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { Message = "Sai tài khoản, mật khẩu hoặc tài khoản đã bị khóa!" });
            }

            // 4. Đưa thông tin THẬT từ DB vào Claims của Token
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()), // Chứa ID người dùng
                new Claim(ClaimTypes.Name, user.Username),                    // Tên đăng nhập
                new Claim(ClaimTypes.Role, user.Role.RoleName),               // Quyền (Admin, Editor...) lấy từ DB
                new Claim("FullName", user.FullName)                          // Tên hiển thị
            };

            // 5. Khởi tạo Token (Lưu ý: Chuyển SecretKey vào appsettings.json sau)
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SuperSecretKeyThatIsAtLeast32BytesLong123!"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: "PhuongxaAPI",
                audience: "PhuongxaClient",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);

            // 6. Trả về Token và thông tin cơ bản cho Next.js sử dụng
            return Ok(new
            {
                Token = tokenString,
                Message = "Đăng nhập thành côngggggggggggggggggggggggggggggg!",
                UserInfo = new
                {
                    user.UserId,
                    user.FullName,
                    Role = user.Role.RoleName
                }
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.FullName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.ConfirmPassword))
            {
                return BadRequest(new { Message = "Vui lòng nhập đầy đủ thông tin!" });
            }

            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest(new { Message = "Mật khẩu và xác nhận mật khẩu không khớp. Vui lòng nhập lại!" });
            }

            var userExists = await _context.Users.AnyAsync(u => u.Email == request.Email || u.Username == request.Email);
            if (userExists)
            {
                return Conflict(new { Message = "Email này đã được sử dụng!" });
            }

            // Lấy role mặc định cho người dùng mới (ví dụ: RoleId = 5)
            var defaultRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Người dùng" || r.RoleName == "User");
            int roleId = defaultRole?.RoleId ?? 5;

            var newUser = new User
            {
                Username = request.Email, // Dùng Email làm Username luôn vì Username là bắt buộc trong database
                PasswordHash = HashPassword(request.Password),
                FullName = request.FullName,
                Email = request.Email,
                RoleId = roleId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đăng ký thành công!" });
        }
    }
}