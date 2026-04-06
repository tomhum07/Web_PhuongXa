using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Infrastructure;
using Web_Phuongxa.Domain.Entities;
// Bổ sung 2 thư viện của SendGrid
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;
        private readonly IConfiguration _configuration; // Khai báo thêm IConfiguration

        // 1. Tiêm (Inject) DbContext và IConfiguration vào Controller
        public AuthController(PhuongXaDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ==========================================
        // CÁC HÀM TIỆN ÍCH (BĂM MẬT KHẨU BCRYPT)
        // ==========================================
        [NonAction]
        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

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

        // ==========================================
        // API 1: ĐĂNG NHẬP
        // ==========================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive == true);

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { Message = "Sai email, mật khẩu hoặc tài khoản đã bị khóa!" });
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.RoleName),
                new Claim("FullName", user.FullName)
            };

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

        // ==========================================
        // API 2: ĐĂNG KÝ
        // ==========================================
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

            var defaultRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Người dùng" || r.RoleName == "User");
            int roleId = defaultRole?.RoleId ?? 3;

            var newUser = new User
            {
                Username = request.Email,
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

        // ==========================================
        // API 3: QUÊN MẬT KHẨU (GỬI OTP QUA EMAIL)
        // ==========================================
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                // Trả về OK kể cả khi không tìm thấy email để tránh hacker dò rỉ tài khoản
                return Ok(new { Message = "Nếu email tồn tại, hệ thống đã gửi mã xác nhận." });
            }

            // Tạo mã OTP 6 số ngẫu nhiên
            string otp = new Random().Next(100000, 999999).ToString();

            // Lưu OTP và thời gian hết hạn (10 phút) vào DB
            user.ResetOtp = otp;
            user.ResetOtpExpiry = DateTime.Now.AddMinutes(10);
            await _context.SaveChangesAsync();

            // Gửi Email bằng SendGrid
            try
            {
                var apiKey = _configuration["SendGrid:ApiKey"];
                var client = new SendGridClient(apiKey);

                var fromEmail = new EmailAddress(_configuration["SendGrid:FromEmail"], _configuration["SendGrid:FromName"]);
                var toEmail = new EmailAddress(user.Email, user.FullName);

                var subject = "Mã xác nhận khôi phục mật khẩu";
                var plainTextContent = $"Mã OTP đặt lại mật khẩu của bạn là: {otp}. Mã này có hiệu lực trong 10 phút.";

                var htmlContent = $@"
                <div style='font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
                    <div style='background-color: #0056b3; padding: 20px; text-align: center; color: #ffffff;'>
                        <h2 style='margin: 0; font-size: 24px;'>Yêu Cầu Đặt Lại Mật Khẩu</h2>
                    </div>
                    <div style='padding: 30px; background-color: #ffffff;'>
                        <p style='font-size: 16px;'>Chào <strong>{user.FullName}</strong>,</p>
                        <p style='font-size: 16px;'>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã xác nhận (OTP) dưới đây để tiếp tục:</p>
                        <div style='text-align: center; margin: 35px 0;'>
                            <span style='display: inline-block; padding: 15px 40px; font-size: 28px; font-weight: bold; color: #0056b3; background-color: #f0f7ff; border: 2px dashed #0056b3; border-radius: 6px; letter-spacing: 5px;'>{otp}</span>
                        </div>
                        <p style='font-size: 15px; color: #d9534f; margin-bottom: 5px;'><strong>Lưu ý:</strong> Mã này chỉ có hiệu lực trong vòng <strong>10 phút</strong>.</p>
                        <p style='font-size: 15px;'>Nếu bạn không yêu cầu đặt lại mật khẩu, xin vui lòng bỏ qua email này. Tuyệt đối <strong>không chia sẻ</strong> mã này cho bất kỳ ai để đảm bảo an toàn cho tài khoản của bạn.</p>
                    </div>
                    <div style='background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 13px; color: #6c757d; border-top: 1px solid #e0e0e0;'>
                        <p style='margin: 0 0 5px 0;'>© {DateTime.Now.Year} Ban Quản Trị Hệ Thống Phường Cao Lãnh.</p>
                        <p style='margin: 0;'>Đây là email tự động, vui lòng không trả lời thư này.</p>
                    </div>
                </div>";

                var msg = MailHelper.CreateSingleEmail(fromEmail, toEmail, subject, plainTextContent, htmlContent);
                var response = await client.SendEmailAsync(msg);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode(500, new { Message = "Hệ thống email đang bận, vui lòng thử lại sau." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi gửi email: " + ex.Message });
            }

            return Ok(new { Message = "Mã xác nhận đã được gửi đến email của bạn." });
        }

        // ==========================================
        // API 4: XÁC MINH OTP
        // ==========================================
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequestDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || user.ResetOtp != request.Otp)
            {
                return BadRequest(new { Message = "Mã xác minh không hợp lệ." });
            }

            if (user.ResetOtpExpiry < DateTime.Now)
            {
                return BadRequest(new { Message = "Mã xác minh đã hết hạn. Vui lòng yêu cầu mã mới." });
            }

            return Ok(new { Message = "Xác minh mã thành công." });
        }

        // ==========================================
        // API 5: CẬP NHẬT MẬT KHẨU MỚI
        // ==========================================
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(new { Message = "Mật khẩu và xác nhận mật khẩu không khớp hoặc bị trống." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || user.ResetOtp != request.Otp)
            {
                return BadRequest(new { Message = "Yêu cầu không hợp lệ hoặc phiên đổi mật khẩu đã hết hạn." });
            }

            if (user.ResetOtpExpiry < DateTime.Now)
            {
                return BadRequest(new { Message = "Phiên đổi mật khẩu đã hết hạn. Vui lòng yêu cầu lại mã từ đầu." });
            }

            // Cập nhật mật khẩu mới (Đã băm bằng BCrypt)
            user.PasswordHash = HashPassword(request.NewPassword);

            // Xóa mã OTP để không bị dùng lại (Bảo mật 1 lần)
            user.ResetOtp = null;
            user.ResetOtpExpiry = null;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật mật khẩu thành công!" });
        }
    }
}