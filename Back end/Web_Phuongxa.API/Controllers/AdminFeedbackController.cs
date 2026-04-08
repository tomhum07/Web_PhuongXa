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
                "chuadoc" or "chua doc" or "chưa đọc" or "unread" or "cho xu ly" or "chờ xử lý" => "Chưa đọc",
                "dadoc" or "da doc" or "đã đọc" or "read" => "Đã đọc",
                "daphanhoi" or "da phan hoi" or "đã phản hồi" or "phan hoi" or "phản hồi" or "replied" => "Đã phản hồi",
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
                var normalizedKeyword = keyword.Trim().ToLower();
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
                    return BadRequest(new { Message = "Trạng thái không hợp lệ. Chỉ chấp nhận: Chưa đọc, Đã đọc, Đã phản hồi." });
                }

                query = normalizedStatus switch
                {
                    "Chưa đọc" => query.Where(f => f.Status != null &&
                        (f.Status == "Chưa đọc" || f.Status == "Chua doc" || f.Status == "Cho xu ly" || f.Status == "Chờ xử lý")),
                    "Đã đọc" => query.Where(f => f.Status != null &&
                        (f.Status == "Đã đọc" || f.Status == "Da doc")),
                    "Đã phản hồi" => query.Where(f => f.Status != null &&
                        (f.Status == "Đã phản hồi" || f.Status == "Da phan hoi" || f.Status == "Da phan hoi ")),
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
                return BadRequest(new { Message = "Trạng thái không được để trống." });
            }

            var targetStatus = NormalizeFeedbackStatus(request.Status);

            if (string.IsNullOrWhiteSpace(targetStatus))
            {
                return BadRequest(new { Message = "Trạng thái không hợp lệ. Chỉ chấp nhận: Chưa đọc, Đã đọc, Đã phản hồi." });
            }

            var feedback = await _context.Feedbacks.FirstOrDefaultAsync(f => f.FeedbackId == id);
            if (feedback == null)
            {
                return NotFound(new { Message = "Không tìm thấy phản ánh." });
            }

            feedback.Status = targetStatus;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Cập nhật trạng thái thành công.",
                feedback.FeedbackId,
                feedback.Status
            });
        }
    }
}
