using Microsoft.AspNetCore.Http;
using System;

namespace Web_Phuongxa.Application.DTOs
{
    public class PublicApplicationSubmitDto
    {
        public int ServiceId { get; set; }
        public string ApplicantName { get; set; } = string.Empty;
        public string IdentityNumber { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string Address { get; set; } = string.Empty;
        public IFormFile? AttachedFile { get; set; }
    }
}
