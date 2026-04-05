using System;
using System.Collections.Generic;

namespace Web_Phuongxa.Domain.Entities;

public partial class ServiceCategory
{
    public int ServiceCategoryId { get; set; }

    public string CategoryCode { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public bool? IsActive { get; set; }

    public int? ChildCount { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Service> Services { get; set; } = new List<Service>();
}
