using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Application.Interfaces;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/public/applications")]
    [ApiController]
    [AllowAnonymous]
    public class PublicApplicationsController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;
        private readonly IFileStorageService _fileStorageService;

        private static DateTime GetVnNow() => DateTime.UtcNow.AddHours(7);

        public PublicApplicationsController(PhuongXaDbContext context, IFileStorageService fileStorageService)
        {
            _context = context;
            _fileStorageService = fileStorageService;
        }

        private static string BuildApplicationCodePrefix(int year) => $"HS-{year}-";

        private static int TryParseApplicationSequence(string applicationCode, string prefix)
        {
            if (string.IsNullOrWhiteSpace(applicationCode) || !applicationCode.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                return 0;
            }

            var sequencePart = applicationCode.Substring(prefix.Length);
            return int.TryParse(sequencePart, out var sequence) ? sequence : 0;
        }

        private async Task<string> GenerateNextApplicationCodeAsync()
        {
            var year = GetVnNow().Year;
            var prefix = BuildApplicationCodePrefix(year);

            var applicationCodes = await _context.Applications
                .AsNoTracking()
                .Where(a => a.ApplicationCode.StartsWith(prefix))
                .Select(a => a.ApplicationCode)
                .ToListAsync();

            var maxSequence = applicationCodes
                .Select(code => TryParseApplicationSequence(code, prefix))
                .DefaultIfEmpty(0)
                .Max();

            return $"{prefix}{(maxSequence + 1):D4}";
        }

        [HttpGet("track")]
        public async Task<IActionResult> TrackApplication([FromQuery] string applicationCode)
        {
            if (string.IsNullOrWhiteSpace(applicationCode))
            {
                return BadRequest(new { Message = "Vui lòng nhập mã ApplicationCode." });
            }

            var normalizedCode = applicationCode.Trim();

            var application = await _context.Applications
                .AsNoTracking()
                .Include(a => a.Service)
                    .ThenInclude(s => s.ServiceCategory)
                .Where(a => a.ApplicationCode == normalizedCode)
                .Select(a => new
                {
                    a.ApplicationId,
                    a.ServiceId,
                    a.ApplicationCode,
                    ApplicantName = EF.Property<string>(a, "ApplicantName"),
                    IdentityNumber = EF.Property<string>(a, "IdentityNumber"),
                    DateOfBirth = EF.Property<DateTime?>(a, "DateOfBirth"),
                    Address = EF.Property<string>(a, "Address"),
                    AttachedFileUrl = EF.Property<string>(a, "AttachedFileUrl"),
                    a.Status,
                    a.HandlerId,
                    CreatedAt = EF.Property<DateTime?>(a, "CreatedAt"),
                    ServiceName = a.Service != null ? a.Service.Name : null,
                    CategoryName = a.Service != null && a.Service.ServiceCategory != null ? a.Service.ServiceCategory.Name : null
                })
                .FirstOrDefaultAsync();

            if (application == null)
            {
                return NotFound(new { Message = "Không tìm thấy hồ sơ theo mã ApplicationCode." });
            }

            var statusText = application.Status?.ToLowerInvariant() switch
            {
                "submitted" => "Đã nộp",
                "processing" => "Đang xử lý",
                "approved" => "Đã duyệt",
                "rejected" => "Từ chối",
                _ => application.Status ?? string.Empty
            };

            return Ok(new
            {
                application.ApplicationId,
                application.ServiceId,
                application.ApplicationCode,
                application.ApplicantName,
                application.IdentityNumber,
                application.DateOfBirth,
                application.Address,
                application.AttachedFileUrl,
                Status = application.Status,
                StatusText = statusText,
                application.HandlerId,
                application.CreatedAt,
                application.ServiceName,
                application.CategoryName
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

        [HttpGet("fields/{serviceCategoryId}/procedures")]
        public async Task<IActionResult> GetProceduresByField(int serviceCategoryId)
        {
            var fieldExists = await _context.ServiceCategories
                .AsNoTracking()
                .AnyAsync(c => c.ServiceCategoryId == serviceCategoryId && c.IsActive == true);

            if (!fieldExists)
            {
                return NotFound(new { Message = "Không tìm thấy lĩnh vực!" });
            }

            var procedures = await _context.Services
                .AsNoTracking()
                .Include(s => s.ServiceCategory)
                .Where(s => s.ServiceCategoryId == serviceCategoryId
                    && s.IsActive == true
                    && s.ServiceCategory != null
                    && s.ServiceCategory.IsActive == true)
                .OrderBy(s => s.ServiceId)
                .Select(s => new
                {
                    s.ServiceId,
                    s.ServiceCategoryId,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.Name : null,
                    s.ServiceCode,
                    ProcedureName = s.Name,
                    s.Description,
                    s.ProcedureFileUrl,
                    s.TemplateFileUrl,
                    s.CreatedAt,
                    DetailUrl = $"{Request.Scheme}://{Request.Host}/api/public/applications/{s.ServiceId}"
                })
                .ToListAsync();

            return Ok(procedures);
        }

        [HttpGet]
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
                    ProcedureName = s.Name,
                    s.Description,
                    s.ProcedureFileUrl,
                    s.TemplateFileUrl,
                    s.CreatedAt
                })
                .ToListAsync();

            return Ok(procedures);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProcedureById(int id)
        {
            var procedure = await _context.Services
                .AsNoTracking()
                .Include(s => s.ServiceCategory)
                .Where(s => s.ServiceId == id && s.IsActive == true && s.ServiceCategory != null && s.ServiceCategory.IsActive == true)
                .Select(s => new
                {
                    s.ServiceId,
                    s.ServiceCategoryId,
                    CategoryName = s.ServiceCategory != null ? s.ServiceCategory.Name : null,
                    s.ServiceCode,
                    ProcedureName = s.Name,
                    s.Description,
                    s.ProcedureFileUrl,
                    s.TemplateFileUrl,
                    s.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (procedure == null)
            {
                return NotFound(new { Message = "Không tìm thấy thủ tục!" });
            }

            return Ok(procedure);
        }

        [HttpPost("submit")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> SubmitApplication([FromForm] PublicApplicationSubmitDto request)
        {
            if (request.ServiceId <= 0)
            {
                return BadRequest(new { Message = "ServiceId là bắt buộc." });
            }

            if (string.IsNullOrWhiteSpace(request.ApplicantName) ||
                string.IsNullOrWhiteSpace(request.IdentityNumber) ||
                string.IsNullOrWhiteSpace(request.Address))
            {
                return BadRequest(new { Message = "Vui lòng nhập đầy đủ thông tin nộp hồ sơ." });
            }

            if (request.AttachedFile == null || request.AttachedFile.Length == 0)
            {
                return BadRequest(new { Message = "Vui lòng đính kèm file hồ sơ." });
            }

            var service = await _context.Services
               .AsNoTracking()
               .FirstOrDefaultAsync(s => s.ServiceId == request.ServiceId && s.IsActive == true);

            if (service == null)
            {
                return BadRequest(new { Message = "Thủ tục không tồn tại hoặc đang bị ẩn." });
            }

            var attachedFileUrl = await _fileStorageService.UploadImageAsync(request.AttachedFile, $"applications/{GetVnNow():yyyy}");
            if (string.IsNullOrWhiteSpace(attachedFileUrl))
            {
                return StatusCode(500, new { Message = "Không thể upload file hồ sơ lên hệ thống lưu trữ." });
            }

            var applicationCode = await GenerateNextApplicationCodeAsync();
            var status = "Submitted";
            var createdAt = GetVnNow();

            var application = new Web_Phuongxa.Domain.Entities.Application
            {
                ServiceId = request.ServiceId,
                HandlerId = null,
                ApplicationCode = applicationCode,
                Status = status
            };

            _context.Applications.Add(application);

            var entry = _context.Entry(application);
            entry.Property("ApplicantName").CurrentValue = request.ApplicantName.Trim();
            entry.Property("IdentityNumber").CurrentValue = request.IdentityNumber.Trim();
            entry.Property("DateOfBirth").CurrentValue = request.DateOfBirth;
            entry.Property("Address").CurrentValue = request.Address.Trim();
            entry.Property("AttachedFileUrl").CurrentValue = attachedFileUrl;
            entry.Property("CreatedAt").CurrentValue = createdAt;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Nộp hồ sơ thành công!",
                ApplicationId = application.ApplicationId,
                ApplicationCode = applicationCode,
                AttachedFileUrl = attachedFileUrl
            });
        }
    }
}
