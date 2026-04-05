using Microsoft.AspNetCore.Http;

namespace Web_Phuongxa.Application.DTOs
{
    public class UploadApplicationFileDto
    {
        public IFormFile? File { get; set; }
        public string? FileName { get; set; }
    }
}
