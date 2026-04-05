using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/categories")]
    [ApiController]
    [AllowAnonymous]
    public class PublicCategoriesController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        public PublicCategoriesController(PhuongXaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .AsNoTracking()
                .Include(c => c.Parent)
                .Where(c => c.IsActive == true && (!c.ParentId.HasValue || c.Parent.IsActive == true))
                .OrderBy(c => c.CategoryId)
                .Select(c => new
                {
                    c.CategoryId,
                    c.Name,
                    c.Slug,
                    c.ParentId,
                    Status = 1,
                    ParentName = c.Parent != null ? c.Parent.Name : null,
                    ParentSlug = c.Parent != null ? c.Parent.Slug : null
                })
                .ToListAsync();

            return Ok(categories);
        }
    }
}
