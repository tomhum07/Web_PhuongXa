using System;
using System.Collections.Generic;

namespace Web_Phuongxa.Domain.Entities;

public partial class Service
{
    public int ServiceId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public bool? IsActive { get; set; }

    public int? ServiceCategoryId { get; set; }

    public string? ServiceCode { get; set; }

    public string? ProcedureFileUrl { get; set; }

    public string? TemplateFileUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    public virtual ServiceCategory? ServiceCategory { get; set; }
}
