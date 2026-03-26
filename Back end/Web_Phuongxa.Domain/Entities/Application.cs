using System;
using System.Collections.Generic;

namespace Web_Phuongxa.Domain.Entities;

public partial class Application
{
    public int ApplicationId { get; set; }

    public int ServiceId { get; set; }

    public int ApplicantId { get; set; }

    public int? HandlerId { get; set; }

    public int? ApproverId { get; set; }

    public string ApplicationCode { get; set; } = null!;

    public string? Status { get; set; }

    public string? AdminNote { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User Applicant { get; set; } = null!;

    public virtual ICollection<ApplicationFile> ApplicationFiles { get; set; } = new List<ApplicationFile>();

    public virtual User? Approver { get; set; }

    public virtual User? Handler { get; set; }

    public virtual Service Service { get; set; } = null!;
}
