using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/admin/feedbacks")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class AdminFeedbackController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        private static string NormalizeFeedbackStatus(string? status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return string.Empty;
            }

            var normalized = status.Trim().ToLowerInvariant();
            return normalized switch
            {
                "chuadoc" or "chua doc" or "chua_doc" or "unread" or "cho xu ly" or "cho_xu_ly" => "Chua doc",
                "dadoc" or "da doc" or "da_doc" or "read" => "Da doc",
                "daphanhoi" or "da phan hoi" or "da_phan_hoi" or "phan hoi" or "phan_hoi" or "replied" => "Da phan hoi",
                _ => string.Empty
            };
        }

        public AdminFeedbackController(PhuongXaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetFeedbacks([FromQuery] string? keyword, [FromQuery] string? status)
        {
            var query = _context.Feedbacks
                .AsNoTracking()
                .Include(f => f.RepliedBy)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var normalizedKeyword = keyword.Trim().ToLowerInvariant();
                query = query.Where(f =>
                    f.SenderName.ToLower().Contains(normalizedKeyword) ||
                    f.Email.ToLower().Contains(normalizedKeyword) ||
                    f.Content.ToLower().Contains(normalizedKeyword));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = NormalizeFeedbackStatus(status);
                if (string.IsNullOrWhiteSpace(normalizedStatus))
                {
                    return BadRequest(new { Message = "Trang thai khong hop le. Chi chap nhan: Chua doc, Da doc, Da phan hoi." });
                }

                query = normalizedStatus switch
                {
                    "Chua doc" => query.Where(f => f.Status != null &&
                        (f.Status == "Chua doc" || f.Status == "Cho xu ly")),
                    "Da doc" => query.Where(f => f.Status != null &&
                        f.Status == "Da doc"),
                    "Da phan hoi" => query.Where(f => f.Status != null &&
                        f.Status == "Da phan hoi"),
                    _ => query
                };
            }

            var feedbacks = await query
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new
                {
                    f.FeedbackId,
                    f.SenderName,
                    f.Email,
                    f.Content,
                    f.ReplyContent,
                    Status = NormalizeFeedbackStatus(f.Status),
                    f.CreatedAt,
                    f.RepliedById,
                    RepliedByName = f.RepliedBy != null ? f.RepliedBy.FullName : null
                })
                .ToListAsync();

            return Ok(feedbacks);
        }

        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateFeedbackStatus(int id, [FromBody] UpdateFeedbackStatusDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Status))
            {
                return BadRequest(new { Message = "Trang thai khong duoc de trong." });
            }

            var targetStatus = NormalizeFeedbackStatus(request.Status);

            if (string.IsNullOrWhiteSpace(targetStatus))
            {
                return BadRequest(new { Message = "Trang thai khong hop le. Chi chap nhan: Chua doc, Da doc, Da phan hoi." });
            }

            var feedback = await _context.Feedbacks.FirstOrDefaultAsync(f => f.FeedbackId == id);
            if (feedback == null)
            {
                return NotFound(new { Message = "Khong tim thay phan anh." });
            }

            feedback.Status = targetStatus;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Cap nhat trang thai thanh cong.",
                feedback.FeedbackId,
                feedback.Status
            });
        }
    }
}
