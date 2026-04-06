using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Web_Phuongxa.Application.Interfaces;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class GalleryController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;
        private readonly IFileStorageService _fileStorageService;

        public GalleryController(PhuongXaDbContext context, IFileStorageService fileStorageService)
        {
            _context = context;
            _fileStorageService = fileStorageService;
        }

        private string BuildImageApiUrl(int imageId) => $"{Request.Scheme}://{Request.Host}/api/Gallery/{imageId}/image";

        private static string GetContentType(string reference)
        {
            var provider = new FileExtensionContentTypeProvider();
            var path = reference;

            if (Uri.TryCreate(reference, UriKind.Absolute, out var uri))
            {
                path = uri.AbsolutePath;
            }

            if (!provider.TryGetContentType(path, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            return contentType;
        }

        private async Task<bool> ImageExistsAsync(string imageReference)
        {
            return await _fileStorageService.ExistsAsync(imageReference);
        }

        [HttpGet]
        public async Task<IActionResult> GetImages([FromQuery] string? section)
        {
            var query = _context.GalleryImages.AsNoTracking().Where(img => img.IsVisible).AsQueryable();

            if (!string.IsNullOrWhiteSpace(section))
            {
                var normalizedSection = section.Trim().ToLower();
                query = query.Where(img => img.Section.ToLower() == normalizedSection);
            }

            var images = await query
                .OrderByDescending(img => img.CreatedAt)
                .Include(img => img.Uploader)
                .ToListAsync();

            var result = new List<object>();
            foreach (var img in images)
            {
                result.Add(new
                {
                    img.ImageId,
                    img.Section,
                    img.Title,
                    ImageUrl = BuildImageApiUrl(img.ImageId),
                    BlobUrl = img.ImageUrl,
                    HasFile = await ImageExistsAsync(img.ImageUrl),
                    img.UploaderId,
                    UploaderName = img.Uploader != null ? img.Uploader.FullName : null,
                    img.IsVisible,
                    img.CreatedAt
                });
            }

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetImageById(int id)
        {
            var image = await _context.GalleryImages
                .AsNoTracking()
                .Include(img => img.Uploader)
                .FirstOrDefaultAsync(img => img.ImageId == id && img.IsVisible);

            if (image == null)
            {
                return NotFound(new { Message = "Không tìm thấy hình ảnh!" });
            }

            var hasFile = await ImageExistsAsync(image.ImageUrl);

            return Ok(new
            {
                image.ImageId,
                image.Section,
                image.Title,
                ImageUrl = BuildImageApiUrl(image.ImageId),
                BlobUrl = image.ImageUrl,
                HasFile = hasFile,
                image.UploaderId,
                UploaderName = image.Uploader?.FullName,
                image.IsVisible,
                image.CreatedAt
            });
        }

        [HttpGet("{id}/image")]
        public async Task<IActionResult> GetImageFile(int id)
        {
            var image = await _context.GalleryImages.AsNoTracking().FirstOrDefaultAsync(x => x.ImageId == id && x.IsVisible);
            if (image == null)
            {
                return NotFound(new { Message = "Không tìm thấy hình ảnh!" });
            }

            var blobStream = await _fileStorageService.DownloadImageAsync(image.ImageUrl);
            if (blobStream != null)
            {
                return File(blobStream, GetContentType(image.ImageUrl), enableRangeProcessing: true);
            }

            return NotFound(new { Message = "File ảnh không tồn tại trên hệ thống lưu trữ!", ImageId = id, BlobUrl = image.ImageUrl });
        }
    }
}