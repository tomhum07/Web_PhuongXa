using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Domain.Entities;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublicCommentController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        public PublicCommentController(PhuongXaDbContext context)
        {
            _context = context;
        }

        // Lấy bình luận công khai của 1 bài viết đã xuất bản
        [HttpGet("article/{articleId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCommentsByArticle(int articleId)
        {
            var publishedArticleExists = await _context.Articles
                .AsNoTracking()
                .AnyAsync(a => a.ArticleId == articleId && a.Status != null && a.Status.ToLower() == "published");

            if (!publishedArticleExists)
            {
                return NotFound(new { Message = "Không tìm thấy bài viết đã xuất bản!" });
            }

            var comments = await _context.Comments
                .AsNoTracking()
                .Include(c => c.User)
                .Where(c => c.ArticleId == articleId && c.IsActive == true)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    c.CommentId,
                    c.ArticleId,
                    c.UserId,
                    UserName = c.User.FullName,
                    c.Content,
                    c.CreatedAt,
                    c.UpdatedAt
                })
                .ToListAsync();

            return Ok(comments);
        }

        // Người dùng bình luận khi đang xem chi tiết bài viết
        [HttpPost]
        public async Task<IActionResult> CreateComment([FromBody] PublicCommentCreateRequestDto request)
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new { Message = "Bạn cần đăng nhập để bình luận." });
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (!string.Equals(role, "User", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(role, "Người dùng", StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            if (request.ArticleId <= 0 || string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { Message = "Thiếu dữ liệu comment hợp lệ!" });
            }

            var articleExists = await _context.Articles
                .AnyAsync(a => a.ArticleId == request.ArticleId && a.Status != null && a.Status.ToLower() == "published");
            if (!articleExists)
            {
                return BadRequest(new { Message = "Bài viết không tồn tại hoặc chưa được xuất bản!" });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return Unauthorized(new { Message = "Không xác định được thông tin người dùng đăng nhập." });
            }

            var comment = new Comment
            {
                ArticleId = request.ArticleId,
                UserId = userId,
                Content = request.Content.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            var userName = User.FindFirst("FullName")?.Value;

            return Ok(new
            {
                Message = "Bình luận thành công!",
                Comment = new
                {
                    comment.CommentId,
                    comment.ArticleId,
                    comment.UserId,
                    UserName = userName,
                    comment.Content,
                    Status = comment.IsActive == true ? 1 : 0,
                    comment.HiddenById,
                    comment.CreatedAt,
                    comment.UpdatedAt
                }
            });
        }
    }
}
