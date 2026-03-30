using System;

namespace Web_Phuongxa.Application.DTOs
{
    public class ReplyFeedbackDto
    {
        public string ReplyContent { get; set; } = string.Empty;
        public int RepliedById { get; set; }
    }
}
