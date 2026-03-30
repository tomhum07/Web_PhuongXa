using System;

namespace Web_Phuongxa.Application.DTOs
{
    public class ArticleRequestDto
    {
        public int CategoryId { get; set; }
        public int AuthorId { get; set; } // Nên lấy từ Token auth trong thực tế
        public string Title { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string Status { get; set; } = "Draft"; // Draft, PendingApproval, Published, Rejected
    }
}