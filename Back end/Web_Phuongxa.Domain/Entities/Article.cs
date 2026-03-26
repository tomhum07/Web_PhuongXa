using System;
using System.Collections.Generic;

namespace Web_Phuongxa.Domain.Entities;

public partial class Article
{
    public int ArticleId { get; set; }

    public int CategoryId { get; set; }

    public int AuthorId { get; set; }

    public int? ApproverId { get; set; }

    public string Title { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Summary { get; set; }

    public string Content { get; set; } = null!;

    public string? ThumbnailUrl { get; set; }

    public int? ViewCount { get; set; }

    public string? Status { get; set; }

    public DateTime? PublishedAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User? Approver { get; set; }

    public virtual User Author { get; set; } = null!;

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
