using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Application.Interfaces;
using Web_Phuongxa.Domain.Entities;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/admin/applications")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class AdminApplicationsController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;
        private readonly IFileStorageService _fileStorageService;

        public AdminApplicationsController(PhuongXaDbContext context, IFileStorageService fileStorageService)
        {
            _context = context;
            _fileStorageService = fileStorageService;
        }

        private static string GenerateCode(string prefix, string input)
        {
            var raw = (input ?? string.Empty).Trim().ToUpperInvariant();
            var sb = new StringBuilder();

            foreach (var c in raw)
            {
                if (char.IsLetterOrDigit(c))
                {
                    sb.Append(c);
                }
                else if (char.IsWhiteSpace(c) || c == '-' || c == '_')
                {
                    sb.Append('_');
                }
            }

            var codePart = sb.ToString().Trim('_');
            if (string.IsNullOrWhiteSpace(codePart))
            {
                codePart = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
            }

            return $"{prefix}_{codePart}";
        }

        [HttpGet("fields")]
        public async Task<IActionResult> GetFields()
        {
            var fields = await _context.ServiceCategories
                .AsNoTracking()
                .OrderBy(x => x.ServiceCategoryId)
                .Select(x => new
                {
                    x.ServiceCategoryId,
                    x.CategoryCode,
                    x.Name,
                    x.Description,
                    Status = x.IsActive == true ? 1 : 0,
                    ChildCount = x.Services.Count(s => s.IsActive == true),
                    x.CreatedAt
                })
                .ToListAsync();

            return Ok(fields);
        }

        [HttpPost("fields")]
        public async Task<IActionResult> CreateField([FromBody] AdminFieldRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { Message = "Tên lĩnh vực không được để trống." });
            }

            var categoryCode = string.IsNullOrWhiteSpace(request.CategoryCode)
                ? GenerateCode("LV", request.Name)
                : request.CategoryCode.Trim().ToUpperInvariant();

            if (await _context.ServiceCategories.AnyAsync(c => c.CategoryCode == categoryCode))
            {
                return BadRequest(new { Message = "CategoryCode đã tồn tại." });
            }

            var category = new ServiceCategory
            {
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                CategoryCode = categoryCode,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.ServiceCategories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Thêm lĩnh vực thành công!", Field = category });
        }

        [HttpPut("fields/{id}")]
        public async Task<IActionResult> UpdateField(int id, [FromBody] AdminFieldRequestDto request)
        {
            var category = await _context.ServiceCategories.FirstOrDefaultAsync(c => c.ServiceCategoryId == id);
            if (category == null)
            {
                return NotFound(new { Message = "Không tìm thấy lĩnh vực!" });
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { Message = "Tên lĩnh vực không được để trống." });
            }

            if (!string.IsNullOrWhiteSpace(request.CategoryCode))
            {
                var newCode = request.CategoryCode.Trim().ToUpperInvariant();
                if (await _context.ServiceCategories.AnyAsync(c => c.CategoryCode == newCode && c.ServiceCategoryId != id))
                {
                    return BadRequest(new { Message = "CategoryCode đã tồn tại." });
                }

                category.CategoryCode = newCode;
            }

            category.Name = request.Name.Trim();
            category.Description = request.Description?.Trim();

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật lĩnh vực thành công!", Field = category });
        }

        [HttpPut("fields/{id}/hide")]
        public async Task<IActionResult> HideField(int id)
        {
            var category = await _context.ServiceCategories.FirstOrDefaultAsync(c => c.ServiceCategoryId == id);
            if (category == null)
            {
                return NotFound(new { Message = "Không tìm thấy lĩnh vực!" });
            }

            category.IsActive = false;
            var services = await _context.Services.Where(s => s.ServiceCategoryId == id).ToListAsync();
            foreach (var service in services)
            {
                service.IsActive = false;
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Ẩn lĩnh vực thành công!", FieldId = id, Status = 0 });
        }

        [HttpPut("fields/{id}/show")]
        public async Task<IActionResult> ShowField(int id)
        {
            var category = await _context.ServiceCategories.FirstOrDefaultAsync(c => c.ServiceCategoryId == id);
            if (category == null)
            {
                return NotFound(new { Message = "Không tìm thấy lĩnh vực!" });
            }

            category.IsActive = true;
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Hiển thị lĩnh vực thành công!", FieldId = id, Status = 1 });
        }

        [HttpGet("procedures")]
        public async Task<IActionResult> GetProcedures([FromQuery] int? serviceCategoryId)
        {
            var query = _context.Services
                .AsNoTracking()
                .Include(s => s.ServiceCategory)
                .AsQueryable();

            if (serviceCategoryId.HasValue)
            {
                query = query.Where(s => s.ServiceCategoryId == serviceCategoryId.Value);
            }

            var procedures = await query
                .OrderBy(s => s.ServiceId)
                .Select(s => new
                {
                    s.ServiceId,
                    s.ServiceCategoryId,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.Name : null,
                    s.ServiceCode,
                    s.Name,
                    s.Description,
                    s.ProcedureFileUrl,
                    s.TemplateFileUrl,
                    Status = s.IsActive == true ? 1 : 0,
                    s.CreatedAt
                })
                .ToListAsync();

            return Ok(procedures);
        }

        [HttpGet("fields/{serviceCategoryId}/procedures")]
        public async Task<IActionResult> GetProceduresByField(int serviceCategoryId)
        {
            var fieldExists = await _context.ServiceCategories.AnyAsync(c => c.ServiceCategoryId == serviceCategoryId && c.IsActive == true);
            if (!fieldExists)
            {
                return NotFound(new { Message = "Không tìm thấy lĩnh vực!" });
            }

            var procedures = await _context.Services
                .AsNoTracking()
                .Where(s => s.ServiceCategoryId == serviceCategoryId)
                .OrderBy(s => s.ServiceId)
                .Select(s => new
                {
                    s.ServiceId,
                    s.ServiceCategoryId,
                    s.ServiceCode,
                    s.Name,
                    s.Description,
                    s.ProcedureFileUrl,
                    s.TemplateFileUrl,
                    Status = s.IsActive == true ? 1 : 0,
                    s.CreatedAt
                })
                .ToListAsync();

            return Ok(procedures);
        }

        [HttpPost("procedures")]
        [Consumes("application/json")]
        public async Task<IActionResult> CreateProcedure([FromBody] AdminServiceRequestDto request)
        {
            var serviceCategoryId = request.ServiceCategoryId;
            if (!serviceCategoryId.HasValue || serviceCategoryId.Value <= 0)
            {
                return BadRequest(new { Message = "ServiceCategoryId là bắt buộc." });
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { Message = "Tên thủ tục không được để trống." });
            }

            var fieldExists = await _context.ServiceCategories.AnyAsync(c => c.ServiceCategoryId == serviceCategoryId.Value && c.IsActive == true);
            if (!fieldExists)
            {
                return BadRequest(new { Message = "Lĩnh vực không tồn tại hoặc đang bị ẩn." });
            }

            var serviceCode = string.IsNullOrWhiteSpace(request.ServiceCode)
                ? GenerateCode("TT", request.Name)
                : request.ServiceCode.Trim().ToUpperInvariant();

            if (await _context.Services.AnyAsync(s => s.ServiceCode == serviceCode))
            {
                return BadRequest(new { Message = "ServiceCode đã tồn tại." });
            }

            var service = new Service
            {
                ServiceCategoryId = serviceCategoryId.Value,
                ServiceCode = serviceCode,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                ProcedureFileUrl = request.ProcedureFileUrl?.Trim(),
                TemplateFileUrl = request.TemplateFileUrl?.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Thêm thủ tục thành công!", Procedure = service });
        }

        [HttpPost("procedures/upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateProcedureWithUpload([FromForm] AdminProcedureUploadDto request)
        {
            var serviceCategoryId = request.ServiceCategoryId;
            if (!serviceCategoryId.HasValue || serviceCategoryId.Value <= 0)
            {
                return BadRequest(new { Message = "ServiceCategoryId là bắt buộc." });
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { Message = "Tên thủ tục không được để trống." });
            }

            if (request.ProcedureFile == null && request.TemplateFile == null)
            {
                return BadRequest(new { Message = "Vui lòng chọn ít nhất 1 file để upload." });
            }

            var fieldExists = await _context.ServiceCategories.AnyAsync(c => c.ServiceCategoryId == serviceCategoryId.Value && c.IsActive == true);
            if (!fieldExists)
            {
                return BadRequest(new { Message = "Lĩnh vực không tồn tại hoặc đang bị ẩn." });
            }

            var serviceCode = string.IsNullOrWhiteSpace(request.ServiceCode)
                ? GenerateCode("TT", request.Name)
                : request.ServiceCode.Trim().ToUpperInvariant();

            if (await _context.Services.AnyAsync(s => s.ServiceCode == serviceCode))
            {
                return BadRequest(new { Message = "ServiceCode đã tồn tại." });
            }

            string? procedureFileUrl = null;
            string? templateFileUrl = null;

            if (request.ProcedureFile != null)
            {
                procedureFileUrl = await _fileStorageService.UploadImageAsync(request.ProcedureFile, "procedures");
                if (string.IsNullOrWhiteSpace(procedureFileUrl))
                {
                    return StatusCode(500, new { Message = "Không thể tải file thủ tục lên hệ thống lưu trữ." });
                }
            }

            if (request.TemplateFile != null)
            {
                templateFileUrl = await _fileStorageService.UploadImageAsync(request.TemplateFile, "procedures");
                if (string.IsNullOrWhiteSpace(templateFileUrl))
                {
                    return StatusCode(500, new { Message = "Không thể tải file biểu mẫu lên hệ thống lưu trữ." });
                }
            }

            var service = new Service
            {
                ServiceCategoryId = serviceCategoryId.Value,
                ServiceCode = serviceCode,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                ProcedureFileUrl = procedureFileUrl,
                TemplateFileUrl = templateFileUrl,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Thêm thủ tục và upload file thành công!",
                Procedure = service
            });
        }

        [HttpPut("procedures/{id}")]
        public async Task<IActionResult> UpdateProcedure(int id, [FromBody] AdminServiceRequestDto request)
        {
            var service = await _context.Services.FirstOrDefaultAsync(s => s.ServiceId == id);
            if (service == null)
            {
                return NotFound(new { Message = "Không tìm thấy thủ tục!" });
            }

            var serviceCategoryId = request.ServiceCategoryId;
            if (!serviceCategoryId.HasValue || serviceCategoryId.Value <= 0)
            {
                return BadRequest(new { Message = "ServiceCategoryId là bắt buộc." });
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { Message = "Tên thủ tục không được để trống." });
            }

            if (string.IsNullOrWhiteSpace(request.ServiceCode))
            {
                return BadRequest(new { Message = "ServiceCode là bắt buộc." });
            }

            var fieldExists = await _context.ServiceCategories.AnyAsync(c => c.ServiceCategoryId == serviceCategoryId.Value && c.IsActive == true);
            if (!fieldExists)
            {
                return BadRequest(new { Message = "Lĩnh vực không tồn tại hoặc đang bị ẩn." });
            }

            var serviceCode = request.ServiceCode.Trim().ToUpperInvariant();
            if (await _context.Services.AnyAsync(s => s.ServiceCode == serviceCode && s.ServiceId != id))
            {
                return BadRequest(new { Message = "ServiceCode đã tồn tại." });
            }

            service.ServiceCategoryId = serviceCategoryId.Value;
            service.ServiceCode = serviceCode;
            service.Name = request.Name.Trim();
            service.Description = request.Description?.Trim();
            service.ProcedureFileUrl = request.ProcedureFileUrl?.Trim();
            service.TemplateFileUrl = request.TemplateFileUrl?.Trim();

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thủ tục thành công!", Procedure = service });
        }

        [HttpPut("procedures/{id}/hide")]
        public async Task<IActionResult> HideProcedure(int id)
        {
            var service = await _context.Services.FirstOrDefaultAsync(s => s.ServiceId == id);
            if (service == null)
            {
                return NotFound(new { Message = "Không tìm thấy thủ tục!" });
            }

            service.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Ẩn thủ tục thành công!", ServiceId = id, Status = 0 });
        }

        [HttpPut("procedures/{id}/show")]
        public async Task<IActionResult> ShowProcedure(int id)
        {
            var service = await _context.Services
                .Include(s => s.ServiceCategory)
                .FirstOrDefaultAsync(s => s.ServiceId == id);
            if (service == null)
            {
                return NotFound(new { Message = "Không tìm thấy thủ tục!" });
            }

            if (service.ServiceCategory?.IsActive != true)
            {
                return BadRequest(new { Message = "Không thể hiện thủ tục khi lĩnh vực đang bị ẩn." });
            }

            service.IsActive = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Hiển thị thủ tục thành công!", ServiceId = id, Status = 1 });
        }
    }
}
