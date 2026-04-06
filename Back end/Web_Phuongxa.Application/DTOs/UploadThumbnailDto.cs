using Microsoft.AspNetCore.Http;

namespace Web_Phuongxa.Application.DTOs
{
    public class UploadThumbnailDto
    {
        public IFormFile? File { get; set; }
    }
}
