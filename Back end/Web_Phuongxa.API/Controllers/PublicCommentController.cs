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
        private const int EditableMinutes = 10;
        private readonly PhuongXaDbContext _context;

        public PublicCommentController(PhuongXaDbContext context)
        {
            _context = context;
        }

        private bool TryGetCurrentUserId(out int userId, out IActionResult? errorResult)
        {
            userId = 0;
            errorResult = null;

            if (User?.Identity?.IsAuthenticated != true)
            {
                errorResult = Unauthorized(new { Message = "Bạn cần đăng nhập để thực hiện thao tác này." });
                return false;
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out userId) || userId <= 0)
            {
                errorResult = Unauthorized(new { Message = "Không xác định được thông tin người dùng đăng nhập." });
                return false;
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (!string.Equals(role, "User", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(role, "Người dùng", StringComparison.OrdinalIgnoreCase))
            {
                errorResult = Forbid();
                return false;
            }

            return true;
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

        // Danh sách comment của chính người dùng
        [HttpGet("me")]
        public async Task<IActionResult> GetMyComments()
        {
            if (!TryGetCurrentUserId(out var userId, out var errorResult))
            {
                return errorResult!;
            }

            var comments = await _context.Comments
                .AsNoTracking()
                .Include(c => c.Article)
                .ThenInclude(a => a.Category)
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    c.CommentId,
                    c.ArticleId,
                    ArticleTitle = c.Article != null ? c.Article.Title : null,
                    CategoryName = c.Article != null && c.Article.Category != null ? c.Article.Category.Name : null,
                    c.Content,
                    Status = c.IsActive == true ? 1 : 0,
                    c.HiddenById,
                    c.CreatedAt,
                    c.UpdatedAt,
                    CanEdit = c.IsActive == true
                        && c.CreatedAt != null
                        && EF.Functions.DateDiffMinute(c.CreatedAt.Value, DateTime.UtcNow) <= EditableMinutes
                })
                .ToListAsync();

            return Ok(comments);
        }

        // Người dùng bình luận khi đang xem chi tiết bài viết
        [HttpPost]
        public async Task<IActionResult> CreateComment([FromBody] PublicCommentCreateRequestDto request)
        {
            if (!TryGetCurrentUserId(out var userId, out var errorResult))
            {
                return errorResult!;
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
                    comment.UpdatedAt,
                    CanEdit = true
                }
            });
        }

        // Người dùng sửa bình luận của chính mình
        [HttpPut("{commentId}")]
        public async Task<IActionResult> UpdateOwnComment(int commentId, [FromBody] PublicCommentUpdateRequestDto request)
        {
            if (!TryGetCurrentUserId(out var userId, out var errorResult))
            {
                return errorResult!;
            }

            if (commentId <= 0 || string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { Message = "Thiếu dữ liệu comment hợp lệ!" });
            }

            var comment = await _context.Comments
                .Include(c => c.User)
                .Include(c => c.Article)
                .FirstOrDefaultAsync(c => c.CommentId == commentId);

            if (comment == null)
            {
                return NotFound(new { Message = "Không tìm thấy bình luận!" });
            }

            if (comment.UserId != userId)
            {
                return Forbid();
            }

            if (comment.IsActive != true)
            {
                return BadRequest(new { Message = "Bình luận đang bị ẩn, không thể chỉnh sửa." });
            }

            if (comment.CreatedAt.HasValue && DateTime.UtcNow - comment.CreatedAt.Value > TimeSpan.FromMinutes(EditableMinutes))
            {
                return BadRequest(new { Message = $"Chỉ có thể sửa bình luận trong vòng {EditableMinutes} phút sau khi đăng." });
            }

            if (comment.Article == null || comment.Article.Status == null || comment.Article.Status.ToLower() != "published")
            {
                return BadRequest(new { Message = "Bình luận chỉ có thể sửa trên bài viết đã xuất bản." });
            }

            comment.Content = request.Content.Trim();
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Cập nhật bình luận thành công!",
                Comment = new
                {
                    comment.CommentId,
                    comment.ArticleId,
                    comment.UserId,
                    UserName = comment.User.FullName,
                    comment.Content,
                    Status = comment.IsActive == true ? 1 : 0,
                    comment.HiddenById,
                    comment.CreatedAt,
                    comment.UpdatedAt,
                    CanEdit = true
                }
            });
        }

        // Người dùng xóa bình luận của chính mình
        [HttpDelete("{commentId}")]
        public async Task<IActionResult> DeleteOwnComment(int commentId)
        {
            if (!TryGetCurrentUserId(out var userId, out var errorResult))
            {
                return errorResult!;
            }

            var comment = await _context.Comments
                .Include(c => c.Article)
                .FirstOrDefaultAsync(c => c.CommentId == commentId);

            if (comment == null)
            {
                return NotFound(new { Message = "Không tìm thấy bình luận!" });
            }

            if (comment.UserId != userId)
            {
                return Forbid();
            }

            if (comment.IsActive != true)
            {
                return BadRequest(new { Message = "Bình luận đã ở trạng thái không hiển thị." });
            }

            comment.IsActive = false;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Xóa bình luận thành công!",
                CommentId = comment.CommentId,
                Status = 0
            });
        }
    }
}
