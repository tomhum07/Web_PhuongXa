using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Domain.Entities;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/admin/categories")]
    [ApiController]
    //[Authorize(Policy = "AdminOnly")]
    public class AdminCategoriesController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        public AdminCategoriesController(PhuongXaDbContext context)
        {
            _context = context;
        }

        private static string GenerateSlug(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return string.Empty;

            var normalized = name.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();

            foreach (var c in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            var slug = sb.ToString().Normalize(NormalizationForm.FormC);
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", string.Empty);
            slug = Regex.Replace(slug, @"\s+", "-").Trim('-');

            return slug;
        }

        private static List<int> GetCategoryTreeIds(int rootId, List<Category> allCategories)
        {
            var ids = new List<int>();
            var queue = new Queue<int>();
            queue.Enqueue(rootId);

            while (queue.Count > 0)
            {
                var currentId = queue.Dequeue();
                ids.Add(currentId);

                var children = allCategories
                    .Where(c => c.ParentId == currentId)
                    .Select(c => c.CategoryId)
                    .ToList();

                foreach (var childId in children)
                {
                    queue.Enqueue(childId);
                }
            }

            return ids;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .Include(c => c.Parent)
                .OrderBy(c => c.CategoryId)
                .Select(c => new
                {
                    c.CategoryId,
                    c.Name,
                    c.Slug,
                    c.ParentId,
                    Status = c.IsActive == true ? 1 : 0,
                    ParentName = c.Parent != null ? c.Parent.Name : null,
                    ParentSlug = c.Parent != null ? c.Parent.Slug : null
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { Message = "Tên danh mục không được để trống!" });
            }

            Category? parentCategory = null;
            if (request.ParentId.HasValue)
            {
                parentCategory = await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == request.ParentId.Value);
                if (parentCategory == null)
                {
                    return BadRequest(new { Message = "Danh mục cha không tồn tại!" });
                }
            }

            var baseSlug = GenerateSlug(request.Name);
            if (string.IsNullOrWhiteSpace(baseSlug))
            {
                return BadRequest(new { Message = "Tên danh mục không hợp lệ để tạo slug!" });
            }

            var slug = baseSlug;
            var index = 2;
            while (await _context.Categories.AnyAsync(c => c.Slug == slug))
            {
                slug = $"{baseSlug}-{index}";
                index++;
            }

            var newCategory = new Category
            {
                ParentId = request.ParentId,
                Name = request.Name.Trim(),
                Slug = slug,
                IsActive = true
            };

            _context.Categories.Add(newCategory);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Thêm danh mục thành công!",
                Category = new
                {
                    newCategory.CategoryId,
                    newCategory.ParentId,
                    ParentName = parentCategory?.Name,
                    ParentSlug = parentCategory?.Slug,
                    newCategory.Name,
                    newCategory.Slug,
                    Status = newCategory.IsActive == true ? 1 : 0
                }
            });
        }

        [HttpPut("{id}/hide")]
        public async Task<IActionResult> HideCategory(int id)
        {
            var allCategories = await _context.Categories.ToListAsync();
            var category = allCategories.FirstOrDefault(c => c.CategoryId == id);

            if (category == null)
            {
                return NotFound(new { Message = "Không tìm thấy danh mục!" });
            }

            var idsToHide = GetCategoryTreeIds(id, allCategories);
            var categoriesToHide = allCategories.Where(c => idsToHide.Contains(c.CategoryId)).ToList();

            foreach (var item in categoriesToHide)
            {
                item.IsActive = false;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Ẩn danh mục thành công!",
                AffectedCount = categoriesToHide.Count
            });
        }

        [HttpPut("{id}/show")]
        public async Task<IActionResult> ShowCategory(int id)
        {
            var allCategories = await _context.Categories.ToListAsync();
            var category = allCategories.FirstOrDefault(c => c.CategoryId == id);

            if (category == null)
            {
                return NotFound(new { Message = "Không tìm thấy danh mục!" });
            }

            var idsToShow = GetCategoryTreeIds(id, allCategories);
            var categoriesToShow = allCategories.Where(c => idsToShow.Contains(c.CategoryId)).ToList();

            foreach (var item in categoriesToShow)
            {
                item.IsActive = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Mở lại danh mục thành công!",
                AffectedCount = categoriesToShow.Count
            });
        }
    }
}
