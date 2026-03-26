using System;
using System.Collections.Generic;

namespace Web_Phuongxa.Domain.Entities;

public partial class Feedback
{
    public int FeedbackId { get; set; }

    public string SenderName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Content { get; set; } = null!;

    public string? ReplyContent { get; set; }

    public int? RepliedById { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? RepliedBy { get; set; }
}
