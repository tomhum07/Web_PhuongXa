using System;

namespace Web_Phuongxa.Application.DTOs
{
    public class FeedbackRequestDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
