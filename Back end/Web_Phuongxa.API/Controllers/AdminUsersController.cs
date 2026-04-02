using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/admin/users")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]
    public class AdminUsersController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        public AdminUsersController(PhuongXaDbContext context)
        {
            _context = context;
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles
                .OrderBy(r => r.RoleId)
                .Select(r => new
                {
                    r.RoleId,
                    r.RoleName,
                    r.Description
                })
                .ToListAsync();

            return Ok(roles);
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers(
            [FromQuery] int? roleId,
            [FromQuery] int? isActive,
            [FromQuery] string? name,
            [FromQuery] string? email)
        {
            var query = _context.Users
                .Include(x => x.Role)
                .AsQueryable();

            if (roleId.HasValue)
            {
                query = query.Where(x => x.RoleId == roleId.Value);
            }

            if (isActive.HasValue)
            {
                var activeValue = isActive.Value == 1;
                query = query.Where(x => x.IsActive == activeValue);
            }

            if (!string.IsNullOrWhiteSpace(name))
            {
                var normalizedName = name.Trim().ToLower();
                query = query.Where(x => x.FullName.ToLower().Contains(normalizedName));
            }

            if (!string.IsNullOrWhiteSpace(email))
            {
                var normalizedEmail = email.Trim().ToLower();
                query = query.Where(x => x.Email != null && x.Email.ToLower().Contains(normalizedEmail));
            }

            var users = await query
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new
                {
                    x.UserId,
                    FullName = x.FullName,
                    x.Username,
                    x.Email,
                    Status = x.IsActive == true ? 1 : 0,
                    x.CreatedAt,
                    x.RoleId,
                    RoleName = x.Role.RoleName
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPut("{id}/lock")]
        public async Task<IActionResult> LockUser(int id)
        {
            var user = await _context.Users.Include(x => x.Role).FirstOrDefaultAsync(x => x.UserId == id);
            if (user == null)
            {
                return NotFound(new { Message = "Không tìm thấy người dùng!" });
            }

            user.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đã khóa tài khoản người dùng.",
                User = new
                {
                    user.UserId,
                    FullName = user.FullName,
                    user.Email,
                    user.Username,
                    Status = user.IsActive == true ? 1 : 0,
                    RoleId = user.RoleId,
                    RoleName = user.Role.RoleName
                }
            });
        }

        [HttpPut("{id}/unlock")]
        public async Task<IActionResult> UnlockUser(int id)
        {
            var user = await _context.Users.Include(x => x.Role).FirstOrDefaultAsync(x => x.UserId == id);
            if (user == null)
            {
                return NotFound(new { Message = "Không tìm thấy người dùng!" });
            }

            user.IsActive = true;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đã mở khóa tài khoản người dùng.",
                User = new
                {
                    user.UserId,
                    FullName = user.FullName,
                    user.Email,
                    user.Username,
                    Status = user.IsActive == true ? 1 : 0,
                    RoleId = user.RoleId,
                    RoleName = user.Role.RoleName
                }
            });
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeUserRoleDto? request)
        {
            if (request == null)
            {
                return BadRequest(new { Message = "Dữ liệu cập nhật vai trò không hợp lệ!" });
            }

            if (request.RoleId <= 0)
            {
                return BadRequest(new { Message = "RoleId không hợp lệ!" });
            }

            var user = await _context.Users.Include(x => x.Role).FirstOrDefaultAsync(x => x.UserId == id);
            if (user == null)
            {
                return NotFound(new { Message = "Không tìm thấy người dùng!" });
            }

            var newRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleId == request.RoleId);
            if (newRole == null)
            {
                return BadRequest(new { Message = "RoleId không hợp lệ!" });
            }

            if (user.RoleId == request.RoleId)
            {
                return Ok(new
                {
                    Message = "Người dùng đã có vai trò này.",
                    User = new
                    {
                        user.UserId,
                        FullName = user.FullName,
                        user.Email,
                        user.Username,
                        Status = user.IsActive == true ? 1 : 0,
                        RoleId = user.RoleId,
                        RoleName = user.Role.RoleName
                    }
                });
            }

            user.RoleId = request.RoleId;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đã cập nhật vai trò người dùng.",
                User = new
                {
                    user.UserId,
                    FullName = user.FullName,
                    user.Email,
                    user.Username,
                    Status = user.IsActive == true ? 1 : 0,
                    RoleId = user.RoleId,
                    RoleName = newRole.RoleName
                }
            });
        }
    }
}