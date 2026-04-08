using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
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

        private static DateTime GetVnNow() => DateTime.UtcNow.AddHours(7);

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

        private static string NormalizeApplicationStatus(string? status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return string.Empty;
            }

            var normalized = status.Trim().ToLowerInvariant();
            return normalized switch
            {
                "submitted" or "danop" or "da nop" or "đã nộp" => "Da nop",
                "processing" or "dangu ly" or "dang xu ly" or "đang xử lý" => "Dang xu ly",
                "approved" or "hoan thanh" or "hoàn thành" => "Hoan thanh",
                "rejected" or "từ chối" or "tu choi" or "tu chối" => "Tu choi",
                _ => string.Empty
            };
        }

        private static string GetStatusText(string? status)
        {
            var normalized = NormalizeApplicationStatus(status);
            return string.IsNullOrWhiteSpace(normalized)
                ? string.IsNullOrWhiteSpace(status) ? string.Empty : status
                : normalized;
        }

        private static bool IsValidApplicationStatus(string? status)
        {
            return !string.IsNullOrWhiteSpace(NormalizeApplicationStatus(status));
        }

        private static AdminApplicationDto MapApplication(Web_Phuongxa.Domain.Entities.Application application)
        {
            return new AdminApplicationDto
            {
                ApplicationId = application.ApplicationId,
                ServiceId = application.ServiceId,
                ServiceCode = application.Service != null ? application.Service.ServiceCode : null,
                ServiceName = application.Service != null ? application.Service.Name : null,
                CategoryName = application.Service != null && application.Service.ServiceCategory != null ? application.Service.ServiceCategory.Name : null,
                ApplicationCode = application.ApplicationCode,
                ApplicantName = EF.Property<string>(application, "ApplicantName") ?? string.Empty,
                IdentityNumber = EF.Property<string>(application, "IdentityNumber") ?? string.Empty,
                DateOfBirth = EF.Property<DateTime?>(application, "DateOfBirth"),
                Address = EF.Property<string>(application, "Address") ?? string.Empty,
                AttachedFileUrl = EF.Property<string>(application, "AttachedFileUrl"),
                Status = application.Status,
                StatusText = GetStatusText(application.Status),
                HandlerId = application.HandlerId,
                CreatedAt = EF.Property<DateTime?>(application, "CreatedAt")
            };
        }

        private IQueryable<AdminApplicationDto> ProjectApplications(IQueryable<Web_Phuongxa.Domain.Entities.Application> query)
        {
            return query.Select(application => new AdminApplicationDto
            {
                ApplicationId = application.ApplicationId,
                ServiceId = application.ServiceId,
                ServiceCode = application.Service != null ? application.Service.ServiceCode : null,
                ServiceName = application.Service != null ? application.Service.Name : null,
                CategoryName = application.Service != null && application.Service.ServiceCategory != null ? application.Service.ServiceCategory.Name : null,
                ApplicationCode = application.ApplicationCode,
                ApplicantName = EF.Property<string>(application, "ApplicantName") ?? string.Empty,
                IdentityNumber = EF.Property<string>(application, "IdentityNumber") ?? string.Empty,
                DateOfBirth = EF.Property<DateTime?>(application, "DateOfBirth"),
                Address = EF.Property<string>(application, "Address") ?? string.Empty,
                AttachedFileUrl = EF.Property<string>(application, "AttachedFileUrl"),
                Status = application.Status,
                StatusText = GetStatusText(application.Status),
                HandlerId = application.HandlerId,
                CreatedAt = EF.Property<DateTime?>(application, "CreatedAt")
            });
        }

        [HttpGet("applications")]
        [HttpGet]
        public async Task<IActionResult> GetApplications([FromQuery] string? status = null)
        {
            var query = _context.Applications
                .AsNoTracking()
                .Include(a => a.Service)
                    .ThenInclude(s => s.ServiceCategory)
                .AsQueryable();

            var normalizedStatus = NormalizeApplicationStatus(status);
            if (!string.IsNullOrWhiteSpace(normalizedStatus))
            {
                query = normalizedStatus switch
                {
                    "Da nop" => query.Where(a => a.Status != null && (a.Status == "Da nop" || a.Status == "Submitted")),
                    "Dang xu ly" => query.Where(a => a.Status != null && (a.Status == "Dang xu ly" || a.Status == "Processing")),
                    "Hoan thanh" => query.Where(a => a.Status != null && (a.Status == "Hoan thanh" || a.Status == "Approved")),
                    "Tu choi" => query.Where(a => a.Status != null && (a.Status == "Tu choi" || a.Status == "Rejected")),
                    _ => query
                };
            }

            var applications = await ProjectApplications(query)
                .OrderByDescending(a => a.CreatedAt)
                .ThenByDescending(a => a.ApplicationId)
                .ToListAsync();

            return Ok(applications);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetApplicationById(int id)
        {
            var application = await ProjectApplications(
                    _context.Applications
                        .AsNoTracking()
                        .Include(a => a.Service)
                            .ThenInclude(s => s.ServiceCategory)
                        .Where(a => a.ApplicationId == id))
                .FirstOrDefaultAsync();

            if (application == null)
            {
                return NotFound(new { Message = "Không tìm thấy hồ sơ!" });
            }

            return Ok(application);
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateApplicationStatus(int id, [FromBody] AdminApplicationStatusUpdateDto request)
        {
            var normalizedStatus = NormalizeApplicationStatus(request.Status);
            if (string.IsNullOrWhiteSpace(normalizedStatus))
            {
                return BadRequest(new { Message = "Trang thai khong hop le. Chi chap nhan: Da nop, Dang xu ly, Hoan thanh, Tu choi." });
            }

            if (request.HandlerId.HasValue)
            {
                var handlerExists = await _context.Users.AnyAsync(u => u.UserId == request.HandlerId.Value);
                if (!handlerExists)
                {
                    return BadRequest(new { Message = "HandlerId khong ton tai." });
                }
            }

            var application = await _context.Applications.FirstOrDefaultAsync(a => a.ApplicationId == id);
            if (application == null)
            {
                return NotFound(new { Message = "Không tìm thấy hồ sơ!" });
            }

            application.Status = normalizedStatus;
            application.HandlerId = request.HandlerId;
            await _context.SaveChangesAsync();

            var refreshed = await ProjectApplications(
                    _context.Applications
                        .AsNoTracking()
                        .Include(a => a.Service)
                            .ThenInclude(s => s.ServiceCategory)
                        .Where(a => a.ApplicationId == id))
                .FirstAsync();

            return Ok(new
            {
                Message = "Cập nhật trạng thái hồ sơ thành công!",
                ApplicationId = id,
                Status = normalizedStatus,
                StatusText = GetStatusText(normalizedStatus),
                Application = refreshed
            });
        }

        [HttpGet("fields")]
        public async Task<IActionResult> GetFields()
        {
            var fields = await _context.ServiceCategories
                .AsNoTracking()
                .Where(c => c.IsActive == true)
                .Select(c => new
                {
                    c.ServiceCategoryId,
                    c.CategoryCode,
                    FieldName = c.Name,
                    c.Description,
                    ProcedureCount = c.Services.Count(s => s.IsActive == true),
                    c.CreatedAt
                })
                .Where(x => x.ProcedureCount > 0)
                .OrderBy(x => x.FieldName)
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
                CreatedAt = GetVnNow()
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

            var services = await _context.Services.Where(s => s.ServiceCategoryId == id).ToListAsync();
            foreach (var service in services)
            {
                service.IsActive = true;
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Hiển thị lĩnh vực thành công!", FieldId = id, Status = 1 });
        }

        [HttpGet("procedures")]
        public async Task<IActionResult> GetProcedures([FromQuery] int? serviceCategoryId)
        {
            var query = _context.Services
                .AsNoTracking()
                .Include(s => s.ServiceCategory)
                .Where(s => s.IsActive == true && s.ServiceCategory != null && s.ServiceCategory.IsActive == true)
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
                .Include(s => s.ServiceCategory)
                .Where(s => s.ServiceCategoryId == serviceCategoryId && s.IsActive == true && s.ServiceCategory != null && s.ServiceCategory.IsActive == true)
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
                CreatedAt = GetVnNow()
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
                CreatedAt = GetVnNow()
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
