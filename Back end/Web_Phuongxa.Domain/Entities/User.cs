using System;
using System.Collections.Generic;

namespace Web_Phuongxa.Domain.Entities;

public partial class User
{
    public int UserId { get; set; }

    public int RoleId { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string? Email { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? ResetOtp { get; set; }

    public DateTime? ResetOtpExpiry { get; set; }

    public virtual ICollection<Application> ApplicationApplicants { get; set; } = new List<Application>();

    public virtual ICollection<Application> ApplicationApprovers { get; set; } = new List<Application>();

    public virtual ICollection<Application> ApplicationHandlers { get; set; } = new List<Application>();

    public virtual ICollection<Article> ArticleApprovers { get; set; } = new List<Article>();

    public virtual ICollection<Article> ArticleAuthors { get; set; } = new List<Article>();

    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public virtual ICollection<Comment> CommentHiddenBies { get; set; } = new List<Comment>();

    public virtual ICollection<Comment> CommentUsers { get; set; } = new List<Comment>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual Role Role { get; set; } = null!;
}
