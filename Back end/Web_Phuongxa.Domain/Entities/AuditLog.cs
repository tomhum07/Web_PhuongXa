using System;
using System.Collections.Generic;

namespace Web_Phuongxa.Domain.Entities;

public partial class AuditLog
{
    public int LogId { get; set; }

    public int UserId { get; set; }

    public string ActionType { get; set; } = null!;

    public string TableName { get; set; } = null!;

    public int? RecordId { get; set; }

    public string? IpAddress { get; set; }

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
