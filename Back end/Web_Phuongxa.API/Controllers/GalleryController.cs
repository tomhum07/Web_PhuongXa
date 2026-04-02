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
using Web_Phuongxa.Infrastructure;

namespace Web_Phuongxa.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GalleryController : ControllerBase
    {
        private readonly PhuongXaDbContext _context;

        public GalleryController(PhuongXaDbContext context)
        {
            _context = context;
        }

        private string BuildImageApiUrl(int imageId) => $"{Request.Scheme}://{Request.Host}/api/Gallery/{imageId}/image";

        private string BuildStaticUrl(string imageUrl)
            => $"{Request.Scheme}://{Request.Host}" + (imageUrl.StartsWith('/') ? imageUrl : $"/{imageUrl}");

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

        private static string GetPhysicalPath(string imageUrl)
        {
            var relativePath = imageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            return Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);
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
                .Select(img => new
                {
                    img.ImageId,
                    img.Section,
                    img.Title,
                    img.ImageUrl,
                    img.UploaderId,
                    UploaderName = img.Uploader != null ? img.Uploader.FullName : null,
                    img.IsVisible,
                    img.CreatedAt
                })
                .ToListAsync();

            var result = images.Select(img => new
            {
                img.ImageId,
                img.Section,
                img.Title,
                ImageUrl = BuildImageApiUrl(img.ImageId),
                StaticUrl = BuildStaticUrl(img.ImageUrl),
                HasFile = System.IO.File.Exists(GetPhysicalPath(img.ImageUrl)),
                img.UploaderId,
                img.UploaderName,
                img.IsVisible,
                img.CreatedAt
            });

            return Ok(result);
        }

        [HttpGet("missing-files")]
        public async Task<IActionResult> GetMissingFiles()
        {
            var images = await _context.GalleryImages
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new { x.ImageId, x.Section, x.Title, x.ImageUrl, x.IsVisible })
                .ToListAsync();

            var missing = images
                .Where(x => !string.IsNullOrWhiteSpace(x.ImageUrl) && !System.IO.File.Exists(GetPhysicalPath(x.ImageUrl)))
                .Select(x => new
                {
                    x.ImageId,
                    x.Section,
                    x.Title,
                    x.ImageUrl,
                    StaticUrl = BuildStaticUrl(x.ImageUrl),
                    x.IsVisible
                });

            return Ok(missing);
        }

        [HttpPost("hide-missing-files")]
        public async Task<IActionResult> HideMissingFiles()
        {
            var images = await _context.GalleryImages.Where(x => x.IsVisible).ToListAsync();
            var toHide = images.Where(x => !string.IsNullOrWhiteSpace(x.ImageUrl) && !System.IO.File.Exists(GetPhysicalPath(x.ImageUrl))).ToList();

            foreach (var image in toHide)
            {
                image.IsVisible = false;
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

            var hasFile = !string.IsNullOrWhiteSpace(image.ImageUrl) && System.IO.File.Exists(GetPhysicalPath(image.ImageUrl));

            return Ok(new
            {
                image.ImageId,
                image.Section,
                image.Title,
                ImageUrl = BuildImageApiUrl(image.ImageId),
                StaticUrl = BuildStaticUrl(image.ImageUrl),
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

            var fullPath = GetPhysicalPath(image.ImageUrl);

            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound(new { Message = "File ảnh không tồn tại trên server!", ImageId = id, ImageUrl = image.ImageUrl });
            }

            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(fullPath, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            return PhysicalFile(fullPath, contentType);
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

            var uploadFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "gallery", sectionFolder);
            if (!Directory.Exists(uploadFolderPath))
            {
                Directory.CreateDirectory(uploadFolderPath);
            }

            var fileExtension = Path.GetExtension(request.File.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadFolderPath, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            var imageUrl = $"/uploads/gallery/{sectionFolder}/{uniqueFileName}";

            var galleryImage = new Web_Phuongxa.Domain.Entities.GalleryImage
            {
                Section = request.Section,
                Title = request.Title ?? string.Empty,
                ImageUrl = imageUrl,
                UploaderId = request.UploaderId,
                IsVisible = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.GalleryImages.Add(galleryImage);
            await _context.SaveChangesAsync();

            return Ok(new {
                Message = "Tải ảnh lên thành công!",
                Image = new {
                    galleryImage.ImageId,
                    galleryImage.Section,
                    galleryImage.Title,
                    ImageUrl = BuildImageApiUrl(galleryImage.ImageId),
                    StaticUrl = BuildStaticUrl(galleryImage.ImageUrl),
                    HasFile = true,
                    galleryImage.UploaderId,
                    galleryImage.IsVisible,
                    galleryImage.CreatedAt
                }
            });
        }
    }
}