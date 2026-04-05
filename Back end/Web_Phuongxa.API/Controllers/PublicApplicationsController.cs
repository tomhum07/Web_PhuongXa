using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/public/applications")]
    [ApiController]
    [AllowAnonymous]
    public class PublicApplicationsController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        public PublicApplicationsController(PhuongXaDbContext context)
        {
            _context = context;
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
    }
}
