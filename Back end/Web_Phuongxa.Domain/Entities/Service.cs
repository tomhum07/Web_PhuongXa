using System;
using System.Collections.Generic;

namespace Web_Phuongxa.Domain.Entities;

public partial class Service
{
    public int ServiceId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string? ProcedureDetails { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
}
