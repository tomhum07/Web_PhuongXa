using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Domain.Entities;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        public CommentController(PhuongXaDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateComment([FromBody] CommentRequestDto request)
        {
            if (request.ArticleId <= 0 || request.UserId <= 0 || string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { Message = "Thiếu dữ liệu comment hợp lệ!" });
            }

            var articleExists = await _context.Articles.AnyAsync(a => a.ArticleId == request.ArticleId);
            if (!articleExists)
            {
                return BadRequest(new { Message = "Bài viết không tồn tại!" });
            }

            var userExists = await _context.Users.AnyAsync(u => u.UserId == request.UserId);
            if (!userExists)
            {
                return BadRequest(new { Message = "Người dùng không tồn tại!" });
            }

            var comment = new Comment
            {
                ArticleId = request.ArticleId,
                UserId = request.UserId,
                Content = request.Content.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Tạo comment thành công!",
                Comment = new
                {
                    comment.CommentId,
                    comment.ArticleId,
                    comment.UserId,
                    comment.Content,
                    Status = comment.IsActive == true ? 1 : 0,
                    comment.HiddenById,
                    comment.CreatedAt,
                    comment.UpdatedAt
                }
            });
        }

        [HttpPut("{id}/hide")]
        public async Task<IActionResult> HideComment(int id, [FromBody] HideCommentRequestDto request)
        {
            if (request.HiddenById <= 0)
            {
                return BadRequest(new { Message = "HiddenById không hợp lệ!" });
            }

            var hiddenByExists = await _context.Users.AnyAsync(u => u.UserId == request.HiddenById);
            if (!hiddenByExists)
            {
                return BadRequest(new { Message = "Người ẩn comment không tồn tại!" });
            }

            var comment = await _context.Comments.Include(c => c.User).FirstOrDefaultAsync(c => c.CommentId == id);
            if (comment == null)
            {
                return NotFound(new { Message = "Không tìm thấy comment!" });
            }

            comment.IsActive = false;
            comment.HiddenById = request.HiddenById;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Ẩn comment thành công!",
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
                    comment.UpdatedAt
                }
            });
        }

        [HttpPut("{id}/show")]
        public async Task<IActionResult> ShowComment(int id)
        {
            var comment = await _context.Comments.Include(c => c.User).FirstOrDefaultAsync(c => c.CommentId == id);
            if (comment == null)
            {
                return NotFound(new { Message = "Không tìm thấy comment!" });
            }

            if (comment.IsActive == true)
            {
                return Ok(new
                {
                    Message = "Comment đã ở trạng thái hiển thị.",
                    Comment = new
                    {
                        comment.CommentId,
                        comment.ArticleId,
                        comment.UserId,
                        UserName = comment.User.FullName,
                        comment.Content,
                        Status = 1,
                        comment.HiddenById,
                        comment.CreatedAt,
                        comment.UpdatedAt
                    }
                });
            }

            comment.IsActive = true;
            comment.HiddenById = null;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Hiển thị lại comment thành công!",
                Comment = new
                {
                    comment.CommentId,
                    comment.ArticleId,
                    comment.UserId,
                    UserName = comment.User.FullName,
                    comment.Content,
                    Status = 1,
                    comment.HiddenById,
                    comment.CreatedAt,
                    comment.UpdatedAt
                }
            });
        }

        [HttpGet("article/{articleId}")]
        public async Task<IActionResult> GetCommentsByArticle(int articleId)
        {
            var articleExists = await _context.Articles.AnyAsync(a => a.ArticleId == articleId);
            if (!articleExists)
            {
                return NotFound(new { Message = "Không tìm thấy bài viết!" });
            }

            var comments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.ArticleId == articleId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    c.CommentId,
                    c.ArticleId,
                    c.UserId,
                    UserName = c.User.FullName,
                    c.Content,
                    Status = c.IsActive == true ? 1 : 0,
                    c.HiddenById,
                    c.CreatedAt,
                    c.UpdatedAt
                })
                .ToListAsync();

            return Ok(comments);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchComments([FromQuery] int articleId, [FromQuery] string? commenterName, [FromQuery] string? content)
        {
            var query = _context.Comments
                .Include(c => c.User)
                .Where(c => c.ArticleId == articleId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(commenterName))
            {
                var keywordName = commenterName.Trim().ToLower();
                query = query.Where(c => c.User.FullName.ToLower().Contains(keywordName));
            }

            if (!string.IsNullOrWhiteSpace(content))
            {
                var keywordContent = content.Trim().ToLower();
                query = query.Where(c => c.Content.ToLower().Contains(keywordContent));
            }

            var comments = await query
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    c.CommentId,
                    c.ArticleId,
                    c.UserId,
                    UserName = c.User.FullName,
                    c.Content,
                    Status = c.IsActive == true ? 1 : 0,
                    c.HiddenById,
                    c.CreatedAt,
                    c.UpdatedAt
                })
                .ToListAsync();

            return Ok(comments);
        }
    }
}