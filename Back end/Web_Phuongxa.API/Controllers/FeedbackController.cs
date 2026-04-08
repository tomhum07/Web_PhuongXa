using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Linq;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Domain.Entities;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        private static DateTime GetVnNow() => DateTime.UtcNow.AddHours(7);

        public FeedbackController(PhuongXaDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitFeedback([FromBody] FeedbackRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.FullName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { Message = "Vui lòng nhập đầy đủ họ tên, email và nội dung phản ánh/kiến nghị!" });
            }

            // Ghi chú: Bảng Feedback trong DB hiện không có trường PhoneNumber, 
            // nên ta có thể ghép số điện thoại (nếu có) vào phần Content để lưu lại.
            string finalContent = string.IsNullOrWhiteSpace(request.PhoneNumber)
                ? request.Content
                : $"[SDT: {request.PhoneNumber}] {request.Content}";

            var newFeedback = new Feedback
            {
                SenderName = request.FullName,
                Email = request.Email,
                Content = finalContent,
                Status = "Chua doc",
                CreatedAt = GetVnNow()
            };

            _context.Feedbacks.Add(newFeedback);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Gửi phản ánh/kiến nghị thành công! Cảm ơn bạn đã đóng góp ý kiến." });
        }

        // 1. API cho Admin lấy danh sách toàn bộ phản ánh/kiến nghị 
        [HttpGet]
        public async Task<IActionResult> GetAllFeedbacks()
        {
            var feedbacks = await _context.Feedbacks
                .OrderByDescending(f => f.CreatedAt) // Sắp xếp phản ánh mới nhất lên trên
                .Select(f => new
                {
                    f.FeedbackId,
                    f.SenderName,
                    f.Email,
                    f.Content,
                    f.ReplyContent,
                    f.Status,
                    f.CreatedAt
                })
                .ToListAsync();

            return Ok(feedbacks);
        }

        // 2. API cho Admin duyệt, trả lời và đổi trạng thái kiến nghị
        [HttpPut("{id}/reply")]
        public async Task<IActionResult> ReplyFeedback(int id, [FromBody] ReplyFeedbackDto request)
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
            {
                return NotFound(new { Message = "Không tìm thấy phản ánh/kiến nghị này!" });
            }

            if (string.IsNullOrWhiteSpace(request.ReplyContent))
            {
                return BadRequest(new { Message = "Nội dung trả lời không được để trống!" });
            }

            // Cập nhật thông tin phản hồi
            feedback.ReplyContent = request.ReplyContent;
            feedback.RepliedById = request.RepliedById;
            feedback.Status = "Da phan hoi "; // Đổi trạng thái

            _context.Feedbacks.Update(feedback);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã trả lời và cập nhật trạng thái thành công!", Feedback = feedback });
        }
    }
}
