using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.StaticFiles;
using Web_Phuongxa.Application.DTOs;
using Web_Phuongxa.Application.Interfaces;
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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

        private static string NormalizeSectionFolder(string section)
        {
            var normalized = section.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();

            foreach (var c in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            var noAccent = sb.ToString().Normalize(NormalizationForm.FormC);
            noAccent = Regex.Replace(noAccent, @"[^a-z0-9\s-]", string.Empty);
            return Regex.Replace(noAccent, @"\s+", "-").Trim('-');
        }

        private static string GetLegacyPhysicalPath(string imageUrl)
        {
            var relativePath = imageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            return Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);
        }

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
            if (await _fileStorageService.ExistsAsync(imageReference))
            {
                return true;
            }

            var legacyPath = GetLegacyPhysicalPath(imageReference);
            return System.IO.File.Exists(legacyPath);
        }

        [HttpGet]
        public async Task<IActionResult> GetImages([FromQuery] string? section)
        {
            var query = _context.GalleryImages.AsQueryable();

            if (!string.IsNullOrWhiteSpace(section))
            {
                var normalizedSection = section.Trim().ToLower();
                query = query.Where(img => img.Section.ToLower() == normalizedSection);
            }

            var images = await query
                .Where(img => img.IsVisible)
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

        [HttpGet("missing-files")]
        public async Task<IActionResult> GetMissingFiles()
        {
            var images = await _context.GalleryImages
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new { x.ImageId, x.Section, x.Title, x.ImageUrl, x.IsVisible })
                .ToListAsync();

            var missing = new List<object>();
            foreach (var x in images)
            {
                if (!await ImageExistsAsync(x.ImageUrl))
                {
                    missing.Add(new
                    {
                        x.ImageId,
                        x.Section,
                        x.Title,
                        BlobUrl = x.ImageUrl,
                        ImageUrl = BuildImageApiUrl(x.ImageId),
                        x.IsVisible
                    });
                }
            }

            return Ok(missing);
        }

        [HttpPost("hide-missing-files")]
        public async Task<IActionResult> HideMissingFiles()
        {
            var images = await _context.GalleryImages.Where(x => x.IsVisible).ToListAsync();
            var toHide = new List<Web_Phuongxa.Domain.Entities.GalleryImage>();

            foreach (var image in images)
            {
                if (!await ImageExistsAsync(image.ImageUrl))
                {
                    image.IsVisible = false;
                    toHide.Add(image);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã ẩn các bản ghi không còn file trên server.", Count = toHide.Count });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetImageById(int id)
        {
            var image = await _context.GalleryImages
                .Include(img => img.Uploader)
                .FirstOrDefaultAsync(img => img.ImageId == id);

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
            var image = await _context.GalleryImages.FirstOrDefaultAsync(x => x.ImageId == id && x.IsVisible);
            if (image == null)
            {
                return NotFound(new { Message = "Không tìm thấy hình ảnh!" });
            }

            var blobStream = await _fileStorageService.DownloadImageAsync(image.ImageUrl);
            if (blobStream != null)
            {
                return File(blobStream, GetContentType(image.ImageUrl), enableRangeProcessing: true);
            }

            var legacyPath = GetLegacyPhysicalPath(image.ImageUrl);
            if (System.IO.File.Exists(legacyPath))
            {
                return PhysicalFile(legacyPath, GetContentType(legacyPath));
            }

            return NotFound(new { Message = "File ảnh không tồn tại trên server!", ImageId = id, BlobUrl = image.ImageUrl });
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage([FromForm] UploadImageDto request)
        {
            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest(new { Message = "Vui lòng chọn một tệp ảnh." });
            }

            if (string.IsNullOrWhiteSpace(request.Section))
            {
                return BadRequest(new { Message = "Section không được để trống." });
            }

            var sectionFolder = NormalizeSectionFolder(request.Section);
            var blobUrl = await _fileStorageService.UploadImageAsync(request.File, sectionFolder);

            if (string.IsNullOrWhiteSpace(blobUrl))
            {
                return StatusCode(500, new { Message = "Không thể tải ảnh lên Azure Blob Storage." });
            }

            var galleryImage = new Web_Phuongxa.Domain.Entities.GalleryImage
            {
                Section = request.Section.Trim(),
                Title = request.Title ?? string.Empty,
                ImageUrl = blobUrl,
                UploaderId = request.UploaderId,
                IsVisible = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.GalleryImages.Add(galleryImage);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Tải ảnh lên thành công!",
                imageUrl = BuildImageApiUrl(galleryImage.ImageId),
                blobUrl = galleryImage.ImageUrl,
                Image = new
                {
                    galleryImage.ImageId,
                    galleryImage.Section,
                    galleryImage.Title,
                    ImageUrl = BuildImageApiUrl(galleryImage.ImageId),
                    BlobUrl = galleryImage.ImageUrl,
                    HasFile = true,
                    galleryImage.UploaderId,
                    galleryImage.IsVisible,
                    galleryImage.CreatedAt
                }
            });
        }
    }
}