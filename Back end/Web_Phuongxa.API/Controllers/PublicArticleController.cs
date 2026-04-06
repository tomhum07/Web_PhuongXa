using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class PublicArticleController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        public PublicArticleController(PhuongXaDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách bài viết đã xuất bản
        [HttpGet]
        public async Task<IActionResult> GetPublishedArticles([FromQuery] int? categoryId, [FromQuery] string? search)
        {
            var query = _context.Articles
                .AsNoTracking()
                .Include(a => a.Category)
                .Include(a => a.Author)
                .Where(a => a.Status != null && a.Status.ToLower() == "published");

            if (categoryId.HasValue)
            {
                query = query.Where(a => a.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var keyword = search.Trim();
                query = query.Where(a => a.Title != null && a.Title.Contains(keyword));
            }

            var articles = await query
                .OrderByDescending(a => a.PublishedAt ?? a.CreatedAt)
                .Select(a => new
                {
                    a.ArticleId,
                    a.CategoryId,
                    a.Title,
                    a.Slug,
                    a.Summary,
                    a.ThumbnailUrl,
                    a.ViewCount,
                    a.Status,
                    a.PublishedAt,
                    a.CreatedAt,
                    CategoryName = a.Category != null ? a.Category.Name : null,
                    AuthorName = a.Author != null ? a.Author.FullName : null
                })
                .ToListAsync();

            return Ok(articles);
        }

        // 2. Lấy 5 bài viết mới nhất đã xuất bản
        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestPublishedArticles([FromQuery] int? categoryId, [FromQuery] string? search)
        {
            var query = _context.Articles
                .AsNoTracking()
                .Include(a => a.Category)
                .Include(a => a.Author)
                .Where(a => a.Status != null && a.Status.ToLower() == "published");

            if (categoryId.HasValue)
            {
                query = query.Where(a => a.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var keyword = search.Trim();
                query = query.Where(a => a.Title != null && a.Title.Contains(keyword));
            }

            var articles = await query
                .OrderByDescending(a => a.PublishedAt ?? a.CreatedAt)
                .Take(5)
                .Select(a => new
                {
                    a.ArticleId,
                    a.CategoryId,
                    a.Title,
                    a.Slug,
                    a.Summary,
                    a.ThumbnailUrl,
                    a.ViewCount,
                    a.Status,
                    a.PublishedAt,
                    a.CreatedAt,
                    CategoryName = a.Category != null ? a.Category.Name : null,
                    AuthorName = a.Author != null ? a.Author.FullName : null
                })
                .ToListAsync();
            return Ok(articles);
        }

        // 3. Xem chi tiết một bài viết đã xuất bản
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPublishedArticleById(int id)
        {
            var article = await _context.Articles
                .AsNoTracking()
                .Include(a => a.Category)
                .Include(a => a.Author)
                .FirstOrDefaultAsync(a => a.ArticleId == id && a.Status != null && a.Status.ToLower() == "published");

            if (article == null)
            {
                return NotFound(new { Message = "Không tìm thấy bài viết đã xuất bản!" });
            }

            return Ok(new
            {
                article.ArticleId,
                article.CategoryId,
                CategoryName = article.Category?.Name,
                article.AuthorId,
                AuthorName = article.Author?.FullName,
                article.Title,
                article.Slug,
                article.Summary,
                article.Content,
                article.ThumbnailUrl,
                article.ViewCount,
                article.Status,
                article.PublishedAt,
                article.CreatedAt,
                article.UpdatedAt
            });
        }
    }
}
