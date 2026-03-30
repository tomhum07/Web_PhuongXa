using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Text;
using System.Threading.Tasks;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Domain.Entities;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticleController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        public ArticleController(PhuongXaDbContext context)
        {
            _context = context;
        }

        // Tạo Slug từ Title
        private string GenerateSlug(string title)
        {
            if (string.IsNullOrWhiteSpace(title)) return "";
            
            // Xóa dấu tiếng Việt
            string str = title.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();
            foreach (var c in str)
            {
                if (char.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }
            str = sb.ToString().Normalize(NormalizationForm.FormC);
            
            // Chuyển thành chữ thường và thay khoảng trắng bằng gạch ngang
            str = str.ToLowerInvariant();
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = Regex.Replace(str, @"\s+", "-").Trim('-');

            // Đảm bảo slug là duy nhất (có thể thêm thời gian hoặc guid nếu trùng)
            return $"{str}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        }

        // 1. Lấy danh sách toàn bộ bài viết (có thể thêm logic phân trang/lọc nếu cần)
        [HttpGet]
        public async Task<IActionResult> GetAllArticles()
        {
            var articles = await _context.Articles
                .Include(a => a.Category)
                .Include(a => a.Author)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    a.ArticleId,
                    a.Title,
                    a.Slug,
                    a.Summary,
                    a.ThumbnailUrl,
                    a.ViewCount,
                    a.Status,
                    a.CreatedAt,
                    CategoryName = a.Category != null ? a.Category.Name : null,
                    AuthorName = a.Author != null ? a.Author.FullName : null
                })
                .ToListAsync();

            return Ok(articles);
        }

        // 2. Lấy chi tiết 1 bài viết theo ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetArticleById(int id)
        {
            var article = await _context.Articles
                .Include(a => a.Category)
                .Include(a => a.Author)
                .FirstOrDefaultAsync(a => a.ArticleId == id);

            if (article == null)
            {
                return NotFound(new { Message = "Không tìm thấy bài viết!" });
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
                article.Content, // Trả về HTML cho WYSIWYG
                article.ThumbnailUrl,
                article.ViewCount,
                article.Status,
                article.PublishedAt,
                article.CreatedAt,
                article.UpdatedAt
            });
        }

        // 3. (Create) Tạo mới bài viết
        [HttpPost]
        public async Task<IActionResult> CreateArticle([FromBody] ArticleRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { Message = "Tiêu đề và nội dung bài viết không được để trống!" });
            }

            // Kiểm tra Category có tồn tại không
            var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryId == request.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(new { Message = "Danh mục không hợp lệ!" });
            }

            var newArticle = new Article
            {
                CategoryId = request.CategoryId,
                AuthorId = request.AuthorId, // Trong thực tế nên lấy authorId từ thông tin Token (User.Identity)
                Title = request.Title,
                Slug = GenerateSlug(request.Title),
                Summary = request.Summary,
                Content = request.Content, // ND html từ WYSIWYG editor
                ThumbnailUrl = request.ThumbnailUrl,
                Status = request.Status, // Thường truyền "Draft" hoặc "PendingApproval"
                ViewCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.Articles.Add(newArticle);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Tạo bài viết thành công!", Article = newArticle });
        }

        // 4. (Update) Chỉnh sửa bài viết
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateArticle(int id, [FromBody] ArticleRequestDto request)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null)
            {
                return NotFound(new { Message = "Không tìm thấy bài viết!" });
            }

            if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { Message = "Tiêu đề và nội dung bài viết không được để trống!" });
            }

            // Cập nhật thông tin
            article.CategoryId = request.CategoryId;
            article.Title = request.Title;
            article.Summary = request.Summary;
            article.Content = request.Content;
            article.ThumbnailUrl = request.ThumbnailUrl;
            article.Status = request.Status;
            article.UpdatedAt = DateTime.UtcNow;

            _context.Articles.Update(article);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật bài viết thành công!", Article = article });
        }

        // 5. (Delete) Xóa bài viết
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArticle(int id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null)
            {
                return NotFound(new { Message = "Không tìm thấy bài viết!" });
            }

            _context.Articles.Remove(article);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa bài viết thành công!" });
        }
    }
}