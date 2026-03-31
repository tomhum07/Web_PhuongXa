using Microsoft.AspNetCore.Http;

namespace Web_Phuongxa.Application.DTOs
{
    public class UploadImageDto
    {
        public IFormFile File { get; set; } = null!;
        public string Section { get; set; } = string.Empty;
        public string? Title { get; set; }
        public int UploaderId { get; set; }
    }
}