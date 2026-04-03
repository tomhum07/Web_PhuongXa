using System;
using System.Collections.Generic;

namespace Web_Phuongxa.Domain.Entities;

public partial class Comment
{
    public int CommentId { get; set; }

    public int ArticleId { get; set; }

    public int UserId { get; set; }

    public string Content { get; set; } = null!;

    public bool? IsActive { get; set; }

    public int? HiddenById { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Article Article { get; set; } = null!;

    public virtual User? HiddenBy { get; set; }

    public virtual User User { get; set; } = null!;
}
