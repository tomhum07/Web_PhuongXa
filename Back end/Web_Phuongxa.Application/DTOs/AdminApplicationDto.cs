using System;

namespace Web_Phuongxa.Application.DTOs
{
    public class AdminApplicationDto
    {
        public int ApplicationId { get; set; }
        public int ServiceId { get; set; }
        public string? ServiceCode { get; set; }
        public string? ServiceName { get; set; }
        public string? CategoryName { get; set; }
        public string ApplicationCode { get; set; } = string.Empty;
        public string ApplicantName { get; set; } = string.Empty;
        public string IdentityNumber { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string Address { get; set; } = string.Empty;
        public string? AttachedFileUrl { get; set; }
        public string? Status { get; set; }
        public string? StatusText { get; set; }
        public int? HandlerId { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
