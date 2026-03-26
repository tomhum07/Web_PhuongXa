using System;
using System.Collections.Generic;

namespace Web_Phuongxa.Domain.Entities;

public partial class ApplicationFile
{
    public int FileId { get; set; }

    public int ApplicationId { get; set; }

    public string FileName { get; set; } = null!;

    public string FileUrl { get; set; } = null!;

    public DateTime? UploadedAt { get; set; }

    public virtual Application Application { get; set; } = null!;
}
