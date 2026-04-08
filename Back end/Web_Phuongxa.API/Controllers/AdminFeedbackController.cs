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
                var normalizedStatus = status.Trim().ToLower();

                query = normalizedStatus switch
                {
                    "chuadoc" or "chua doc" or "unread" => query.Where(f => f.Status != null && f.Status.ToLower() == "chua doc"),
                    "dadoc" or "da doc" or "read" => query.Where(f => f.Status != null && f.Status.ToLower() == "da doc"),
                    _ => query.Where(f => f.Status != null && f.Status.ToLower() == normalizedStatus)
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
                    f.Status,
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

            var normalizedStatus = request.Status.Trim().ToLower();
            var targetStatus = normalizedStatus switch
            {
                "chuadoc" or "chua doc" or "unread" => "Chua doc",
                "dadoc" or "da doc" or "read" => "Da doc",
                _ => string.Empty
            };

            if (string.IsNullOrWhiteSpace(targetStatus))
            {
                return BadRequest(new { Message = "Trạng thái không hợp lệ. Chỉ chấp nhận: Chua doc, Da doc." });
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
